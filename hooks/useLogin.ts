import { useState, useCallback } from "react";
import { z } from "zod";
import { useAuth } from "./useAuth";

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

interface LoginFormState {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export function useLogin() {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormState>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);

  const updateField = useCallback(
    (field: keyof LoginFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear field error on change
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    },
    []
  );

  const validate = useCallback((): boolean => {
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: LoginFormErrors = {};
      result.error.issues.forEach((issue: z.core.$ZodIssue) => {
        const field = issue.path[0] as keyof LoginFormErrors;
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

  const handleLogin = useCallback(async (): Promise<boolean> => {
    if (!validate()) return false;
    if (loading) return false;

    setLoading(true);
    try {
      await login({ username: form.username, password: form.password });
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed. Please try again.";
      setErrors({ general: message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [form, loading, login, validate]);

  return {
    form,
    errors,
    loading,
    updateField,
    handleLogin,
  };
}
