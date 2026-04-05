import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState } from "@/components/EmptyState";
import { useCourses } from "@/store/courseStore";
import { useBookmarksContext } from "@/store/bookmarkStore";
import type { MappedCourse } from "@/services/courseService";

export default function BookmarksScreen() {
  const { courses } = useCourses();
  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarksContext();

  const bookmarkedCourses = useMemo(
    () => courses.filter((c) => bookmarkedIds.includes(c.id)),
    [courses, bookmarkedIds]
  );

  const handleCoursePress = useCallback((course: MappedCourse) => {
    router.push({
      pathname: "/course/[id]",
      params: { id: course.id },
    });
  }, []);

  const handleBookmark = useCallback(
    (courseId: string) => {
      toggleBookmark(courseId);
    },
    [toggleBookmark]
  );

  const renderItem = useCallback(
    ({ item }: { item: MappedCourse }) => (
      <View style={styles.cardWrapper}>
        <CourseCard
          course={item}
          onPress={handleCoursePress}
          onBookmark={handleBookmark}
          isBookmarked={isBookmarked(item.id)}
        />
      </View>
    ),
    [handleCoursePress, handleBookmark, isBookmarked]
  );

  const keyExtractor = useCallback((item: MappedCourse) => item.id, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <Text style={styles.headerSubtitle}>
          {bookmarkedCourses.length} saved course
          {bookmarkedCourses.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={bookmarkedCourses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="No Bookmarks Yet"
            message="Save courses you're interested in by tapping the bookmark icon. They'll appear here for quick access."
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          bookmarkedCourses.length === 0
            ? styles.emptyContent
            : styles.listContent
        }
        initialNumToRender={6}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    color: "#F1F5F9",
    fontSize: 26,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  cardWrapper: {
    paddingHorizontal: 20,
  },
  emptyContent: {
    flex: 1,
  },
});
