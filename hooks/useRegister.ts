import { useState, useCallback } from "react";
import { z } from "zod";
import { useAuth } from "./useAuth";

const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

interface RegisterFormState {
  username: string;
  email: string;
  password: string;
}

interface RegisterFormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

export function useRegister() {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);

  const updateField = useCallback(
    (field: keyof RegisterFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    },
    []
  );

  const validate = useCallback((): boolean => {
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: RegisterFormErrors = {};
      result.error.issues.forEach((issue: z.core.$ZodIssue) => {
        const field = issue.path[0] as keyof RegisterFormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [form]);

  const handleRegister = useCallback(async (): Promise<boolean> => {
    if (!validate()) return false;
    if (loading) return false;

    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setErrors({ general: message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [form, loading, register, validate]);

  return {
    form,
    errors,
    loading,
    updateField,
    handleRegister,
  };
}
