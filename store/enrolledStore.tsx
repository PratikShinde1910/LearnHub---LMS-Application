import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ENROLLED_KEY = "lms_enrolled_courses";

interface EnrollmentContextValue {
  enrolledIds: string[];
  loading: boolean;
  enroll: (courseId: string) => Promise<void>;
  unenroll: (courseId: string) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
}

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null);

export function EnrollmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(ENROLLED_KEY);
        if (stored) setEnrolledIds(JSON.parse(stored) as string[]);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(ENROLLED_KEY, JSON.stringify(ids));
    } catch {}
  }, []);

  const enroll = useCallback(
    async (courseId: string) => {
      const updated = [...enrolledIds, courseId];
      setEnrolledIds(updated);
      await persist(updated);
    },
    [enrolledIds, persist]
  );

  const unenroll = useCallback(
    async (courseId: string) => {
      const updated = enrolledIds.filter((id) => id !== courseId);
      setEnrolledIds(updated);
      await persist(updated);
    },
    [enrolledIds, persist]
  );

  const isEnrolled = useCallback(
    (courseId: string): boolean => enrolledIds.includes(courseId),
    [enrolledIds]
  );

  const value = useMemo<EnrollmentContextValue>(
    () => ({ enrolledIds, loading, enroll, unenroll, isEnrolled }),
    [enrolledIds, loading, enroll, unenroll, isEnrolled]
  );

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const ctx = useContext(EnrollmentContext);
  if (!ctx) {
    throw new Error(
      "useEnrollment must be used within an EnrollmentProvider"
    );
  }
  return ctx;
}
