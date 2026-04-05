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

// ─── Context ──────────────────────────────────────────────────────────────

interface BookmarkContextValue {
  bookmarkedIds: string[];
  loading: boolean;
  toggleBookmark: (courseId: string) => void;
  isBookmarked: (courseId: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

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
      // Silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimistic toggle — updates UI instantly, then persists
  const toggleBookmark = useCallback(
    (courseId: string) => {
      setBookmarkedIds((prev) => {
        const isAlready = prev.includes(courseId);
        const updated = isAlready
          ? prev.filter((id) => id !== courseId)
          : [...prev, courseId];

        // Fire-and-forget persist
        setBookmarks(updated).catch(() => {
          // Rollback on persistence failure
          setBookmarkedIds(prev);
        });

        // Trigger notification check ONLY if we just added a bookmark
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

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useBookmarksContext() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    throw new Error("useBookmarksContext must be used within a BookmarkProvider");
  }
  return ctx;
}
