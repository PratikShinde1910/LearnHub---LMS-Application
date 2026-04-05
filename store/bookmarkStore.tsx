import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getBookmarks, setBookmarks } from "@/services/storage";
import { scheduleBookmarkMilestoneNotification } from "@/services/notificationService";

interface BookmarkContextValue {
  bookmarkedIds: string[];
  loading: boolean;
  toggleBookmark: (courseId: string) => void;
  isBookmarked: (courseId: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = useCallback(async () => {
    try {
      const ids = await getBookmarks();
      setBookmarkedIds(ids);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBookmark = useCallback(
    (courseId: string) => {
      setBookmarkedIds((prev) => {
        const isAlready = prev.includes(courseId);
        const updated = isAlready
          ? prev.filter((id) => id !== courseId)
          : [...prev, courseId];

        setBookmarks(updated).catch(() => {
          setBookmarkedIds(prev);
        });

        if (!isAlready) {
          scheduleBookmarkMilestoneNotification(updated.length);
        }

        return updated;
      });
    },
    []
  );

  const isBookmarked = useCallback(
    (courseId: string): boolean => {
      return bookmarkedIds.includes(courseId);
    },
    [bookmarkedIds]
  );

  const value = useMemo<BookmarkContextValue>(
    () => ({
      bookmarkedIds,
      loading,
      toggleBookmark,
      isBookmarked,
    }),
    [bookmarkedIds, loading, toggleBookmark, isBookmarked]
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarksContext() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    throw new Error("useBookmarksContext must be used within a BookmarkProvider");
  }
  return ctx;
}
