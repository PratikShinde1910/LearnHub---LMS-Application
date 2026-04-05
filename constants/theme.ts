export const Colors = {
  primary: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#6366F1",
    600: "#4F46E5",
    700: "#4338CA",
    800: "#3730A3",
    900: "#312E81",
  },
  secondary: {
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
  },
  accent: {
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
  },
  dark: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
    950: "#020617",
  },
  white: "#FFFFFF",
  black: "#000000",
  error: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#3B82F6",
} as const;

export const Gradients = {
  primary: ["#4F46E5", "#7C3AED"] as const,
  dark: ["#0F172A", "#1E293B"] as const,
  card: ["rgba(30, 41, 59, 0.9)", "rgba(51, 65, 85, 0.6)"] as const,
  accent: ["#F59E0B", "#EF4444"] as const,
  success: ["#10B981", "#059669"] as const,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;
