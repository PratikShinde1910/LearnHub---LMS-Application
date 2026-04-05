import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAll } from "./storage";
import { router } from "expo-router";

// --- Types ---
interface RetryQueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: InternalAxiosRequestConfig;
}

interface ExtendedAxiosConfig extends InternalAxiosRequestConfig {
  _isRetry?: boolean; // flag to prevent infinite retry loop
  _retryCount?: number;
}

// --- Queue to hold requests while refresh is in progress ---
let isRefreshing = false;
let failedQueue: RetryQueueItem[] = [];

function processQueue(error: AxiosError | null, token: string | null): void {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error || !token) {
      reject(error);
    } else {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      resolve(api(config));
    }
  });
  failedQueue = [];
}

const BASE_URL = "https://api.freeapi.app/api/v1";
const TIMEOUT = 7000;
const MAX_RETRIES = 2;

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Token retrieval failed — continue without auth header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handling token refresh and normalization
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as ExtendedAxiosConfig;

    // ─── 1. Handling Token Refresh (401) ───────────────────────────────────
    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalConfig?.url?.includes("/users/refresh-token");
    const alreadyRetried = originalConfig?._isRetry;

    // Only handle 401 errors that are NOT from the refresh endpoint itself
    // and have not already been retried
    if (is401 && !isRefreshEndpoint && !alreadyRetried && originalConfig) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        });
      }

      // Mark this request as retried to prevent infinite loop
      originalConfig._isRetry = true;
      isRefreshing = true;

      try {
        console.log("[API] Attempting token refresh...");
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call the refresh endpoint (using the base instance to avoid circular auth logic)
        const response = await axios.post(`${BASE_URL}/users/refresh-token`, {
          refreshToken,
        });

        const newAccessToken: string = response.data?.data?.accessToken;
        const newRefreshToken: string = response.data?.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        // Save new tokens to storage
        await setToken(newAccessToken);
        if (newRefreshToken) {
          await setRefreshToken(newRefreshToken);
        }

        // Update default headers for all future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        // Process any queued requests with new token
        processQueue(null, newAccessToken);

        // Retry the original failed request
        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalConfig);
      } catch (refreshError) {
        console.error("[API] Refresh failed, logging out...", refreshError);
        // Refresh failed — reject all queued requests and force logout
        processQueue(refreshError as AxiosError, null);

        // Clear all stored tokens
        await clearAll();

        // Clear auth header
        delete api.defaults.headers.common["Authorization"];

        // Redirect to login using router
        router.replace("/(auth)/login");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ─── 2. Retry logic (500+, Network, etc.) ────────────────────────────────
    if (originalConfig && (!originalConfig._retryCount || originalConfig._retryCount < MAX_RETRIES)) {
      const isRetryable =
        !error.response ||
        error.response.status >= 500 ||
        error.code === "ECONNABORTED";

      if (isRetryable) {
        originalConfig._retryCount = (originalConfig._retryCount || 0) + 1;
        const delay = Math.pow(2, originalConfig._retryCount) * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(originalConfig);
      }
    }

    // ─── 3. Normalize error messages ─────────────────────────────────────
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Request timed out. Please try again.");
      }
      throw new Error("Check your internet connection and try again.");
    }

    const serverMessage =
      (error.response.data as { message?: string })?.message ||
      "Something went wrong. Please try again.";

    switch (error.response.status) {
      case 401:
        // If we reach here, it means it's a 401 from a source that shouldn't be refreshed
        throw new Error("Invalid session. Please log in.");
      case 404:
        throw new Error("Resource not found.");
      case 409:
        throw new Error("Account already exists with this email.");
      case 422:
        throw new Error(serverMessage);
      case 429:
        throw new Error("Too many requests. Please wait a moment.");
      default:
        throw new Error(serverMessage);
    }
  }
);

export default api;
