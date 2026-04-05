import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "lms_course_progress";

// ─── Types ────────────────────────────────────────────────────────────────

interface ProgressMap {
  [courseId: string]: number; // 0–100
}

interface ProgressContextValue {
  progressMap: ProgressMap;
  getProgress: (courseId: string) => number;
  setProgress: (courseId: string, progress: number) => Promise<void>;
  resetProgress: (courseId: string) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

export function ProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progressMap, setProgressMap] = useState<ProgressMap>({});

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PROGRESS_KEY);
        if (stored) setProgressMap(JSON.parse(stored) as ProgressMap);
      } catch {
        // Silent
      }
    })();
  }, []);

  const persist = useCallback(async (map: ProgressMap) => {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
    } catch {
      // Silent
    }
  }, []);

  const getProgress = useCallback(
    (courseId: string): number => progressMap[courseId] ?? 0,
    [progressMap]
  );

  const setProgress = useCallback(
    async (courseId: string, progress: number) => {
      const clamped = Math.min(100, Math.max(0, Math.round(progress)));
      const updated = { ...progressMap, [courseId]: clamped };
      setProgressMap(updated);
      await persist(updated);
    },
    [progressMap, persist]
  );

  const resetProgress = useCallback(
    async (courseId: string) => {
      const { [courseId]: _, ...rest } = progressMap;
      setProgressMap(rest);
      await persist(rest);
    },
    [progressMap, persist]
  );

  const value = useMemo<ProgressContextValue>(
    () => ({ progressMap, getProgress, setProgress, resetProgress }),
    [progressMap, getProgress, setProgress, resetProgress]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useCourseProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error(
      "useCourseProgress must be used within a ProgressProvider"
    );
  }
  return ctx;
}
