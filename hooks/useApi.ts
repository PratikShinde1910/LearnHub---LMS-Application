import { useState, useCallback, useEffect } from "react";
import { ApiError } from "@/types/api";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refresh: () => Promise<void>;
}

/**
 * Standardized data fetching hook that integrates with our custom apiClient
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err as ApiError);
      // Optional: Clear data if needed, or keep last known good value
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refresh: execute };
}
