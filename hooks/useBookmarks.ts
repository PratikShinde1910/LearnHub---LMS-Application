import { useState, useCallback, useEffect } from "react";
import { getBookmarks, setBookmarks } from "@/services/storage";

export function useBookmarks() {
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
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBookmark = useCallback(
    async (courseId: string) => {
      const isBookmarked = bookmarkedIds.includes(courseId);
      const updated = isBookmarked
        ? bookmarkedIds.filter((id) => id !== courseId)
        : [...bookmarkedIds, courseId];

      setBookmarkedIds(updated);
      await setBookmarks(updated);
    },
    [bookmarkedIds]
  );

  const isBookmarked = useCallback(
    (courseId: string): boolean => {
      return bookmarkedIds.includes(courseId);
    },
    [bookmarkedIds]
  );

  return {
    bookmarkedIds,
    loading,
    toggleBookmark,
    isBookmarked,
    refreshBookmarks: loadBookmarks,
  };
}
