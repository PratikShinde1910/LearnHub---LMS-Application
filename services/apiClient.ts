import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { ApiError } from "@/types/api";

const BASE_URL = "https://api.freeapi.app";
const TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 1000; // doubles each retry: 1s, 2s, 4s

// Extend config to track retry count
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// REQUEST interceptor (attach auth token)
apiClient.interceptors.request.use(
  async (config: RetryConfig) => {
    try {
      const token = await SecureStore.getItemAsync("lms_auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Safe to ignore if storage fails
    }
    config._retryCount = config._retryCount ?? 0;
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE interceptor (retry logic + error mapping)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;

    // --- RETRY LOGIC ---
    const shouldRetry =
      config &&
      (config._retryCount ?? 0) < MAX_RETRIES &&
      isRetryableError(error);

    if (shouldRetry) {
      config._retryCount = (config._retryCount ?? 0) + 1;

      // Exponential backoff: 1s, 2s, 4s
      const delay = RETRY_DELAY_BASE_MS * Math.pow(2, config._retryCount - 1);
      await sleep(delay);

      return apiClient(config); // retry the request
    }

    // --- ERROR MAPPING ---
    throw mapApiError(error);
  }
);

function isRetryableError(error: AxiosError): boolean {
  // Retry on: network errors, 408 timeout, 429 rate limit, 500-503 server errors
  if (!error.response) return true; // network error
  const { status } = error.response;
  return [408, 429, 500, 502, 503].includes(status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapApiError(error: AxiosError): ApiError {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return {
        type: "TIMEOUT",
        message: "Request timed out. Please check your connection.",
        originalError: error,
      };
    }
    return {
      type: "NETWORK",
      message: "No internet connection. Please try again.",
      originalError: error,
    };
  }

  const { status } = error.response;
  const errorMap: Record<number, Partial<ApiError>> = {
    401: { type: "AUTH", message: "Session expired. Please log in again.", statusCode: 401 },
    403: { type: "AUTH", message: "You don't have access to this.", statusCode: 403 },
    404: { type: "NOT_FOUND", message: "Content not found.", statusCode: 404 },
    429: { type: "SERVER", message: "Too many requests. Please slow down.", statusCode: 429 },
    500: { type: "SERVER", message: "Server error. Please try again later.", statusCode: 500 },
    503: { type: "SERVER", message: "Service unavailable. Try again shortly.", statusCode: 503 },
  };

  const mapped = errorMap[status] ?? {
    type: "UNKNOWN",
    message: "Something went wrong. Please try again.",
    statusCode: status,
  };

  return {
    ...mapped,
    originalError: error,
  } as ApiError;
}

export default apiClient;
