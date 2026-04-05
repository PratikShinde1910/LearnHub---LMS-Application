// ─── User & Auth Types ───────────────────────────────────────────────────────

export interface UserAvatar {
  url: string;
  localPath: string;
  _id: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: UserAvatar;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  success: false;
}

// ─── Course Types ────────────────────────────────────────────────────────────

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "article" | "quiz";
  isCompleted: boolean;
  url?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  category: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  duration: string;
  lessonCount: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  isFree: boolean;
  tags: string[];
  lessons: Lesson[];
  progress?: number;
}

// ─── Bookmark Types ──────────────────────────────────────────────────────────

export interface BookmarkState {
  bookmarkedCourseIds: string[];
}

// ─── Navigation Types ────────────────────────────────────────────────────────

export interface CourseRouteParams {
  id: string;
}

export interface WebViewRouteParams {
  url: string;
  title: string;
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface FormFieldError {
  field: string;
  message: string;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: "email" | "password" | "username" | "name" | "off";
  editable?: boolean;
  testID?: string;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  testID?: string;
}
