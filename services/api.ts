import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAll } from "./storage";
import { router } from "expo-router";

interface RetryQueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: InternalAxiosRequestConfig;
}

interface ExtendedAxiosConfig extends InternalAxiosRequestConfig {
  _isRetry?: boolean;
  _retryCount?: number;
}

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

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as ExtendedAxiosConfig;

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalConfig?.url?.includes("/users/refresh-token");
    const alreadyRetried = originalConfig?._isRetry;

    if (is401 && !isRefreshEndpoint && !alreadyRetried && originalConfig) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        });
      }

      originalConfig._isRetry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${BASE_URL}/users/refresh-token`, {
          refreshToken,
        });

        const newAccessToken: string = response.data?.data?.accessToken;
        const newRefreshToken: string = response.data?.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        await setToken(newAccessToken);
        if (newRefreshToken) {
          await setRefreshToken(newRefreshToken);
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalConfig);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);

        await clearAll();

        delete api.defaults.headers.common["Authorization"];

        router.replace("/(auth)/login");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

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
