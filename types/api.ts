import { AxiosError } from "axios";

export type ApiErrorType =
  | "NETWORK"
  | "TIMEOUT"
  | "SERVER"
  | "AUTH"
  | "NOT_FOUND"
  | "UNKNOWN";

export interface ApiError {
  type: ApiErrorType;
  message: string; // User-friendly message
  statusCode?: number;
  originalError: AxiosError;
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
  wasOffline: boolean; // true if user was offline and came back
}
