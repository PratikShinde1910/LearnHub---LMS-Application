import api from "./api";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "@/types";

export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>(
    "/users/login",
    credentials
  );
  return response.data.data;
}

export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await api.post<ApiResponse<RegisterResponse>>(
    "/users/register",
    data
  );
  return response.data.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/users/current-user");
  return response.data.data;
}
