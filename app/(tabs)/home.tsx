import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "@/components/Header";
import { CourseCard } from "@/components/CourseCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { CourseSkeleton } from "@/components/SkeletonLoader";
import { useCourses } from "@/store/courseStore";
import { useBookmarksContext } from "@/store/bookmarkStore";
import { useAuth } from "@/hooks/useAuth";
import type { MappedCourse } from "@/services/courseService";
import { ErrorView } from "@/components/ErrorView";
import { ApiError } from "@/types/api";

const DOMAINS = [
  { id: "Technology", label: "Technology", icon: "hardware-chip" as const, colors: ["#4F46E5", "#6366F1"] as readonly [string, string] },
  { id: "Design", label: "Design", icon: "color-palette" as const, colors: ["#F59E0B", "#FCD34D"] as readonly [string, string] },
  { id: "Lifestyle", label: "Lifestyle", icon: "leaf" as const, colors: ["#10B981", "#34D399"] as readonly [string, string] },
  { id: "Health", label: "Health", icon: "fitness" as const, colors: ["#EC4899", "#F472B6"] as readonly [string, string] },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { courses, loading, refreshing, error, hasMore, refreshCourses, loadMoreCourses, fetchCourses } =
    useCourses();
  const { toggleBookmark, isBookmarked } = useBookmarksContext();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase().trim();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

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

  const handleRefresh = useCallback(async () => {
    await refreshCourses();
  }, [refreshCourses]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMoreCourses();
    }
  }, [hasMore, loading, loadMoreCourses]);

  const renderCourseItem = useCallback(
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

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }, [hasMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon="search-outline"
          title="No Results Found"
          message={`No courses match "${searchQuery}". Try a different search term.`}
        />
      );
    }
    return (
      <EmptyState
        icon="book-outline"
        title="No Courses Available"
        message="There are no courses in this category right now."
      />
    );
  }, [loading, searchQuery]);

  const ListHeader = useMemo(
    () => (
      <>
        <Header user={user} />

        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {!searchQuery && (
          <View style={styles.domainsGrid}>
            {DOMAINS.map((domain) => (
              <Pressable
                key={domain.id}
                style={styles.domainCard}
                onPress={() => router.push(`/domain/${domain.id}`)}
              >
                <LinearGradient colors={domain.colors} style={styles.domainGradient}>
                  <Ionicons name={domain.icon} size={28} color="#FFFFFF" />
                  <Text style={styles.domainLabel}>{domain.label}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        )}

        {!searchQuery && courses.length > 0 && (
          <View style={styles.popularSection}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 12 }]}>Popular Courses</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroll}>
              {courses.slice(0, 5).map((course) => (
                <View key={course.id} style={{ width: 320 }}>
                  <CourseCard
                    course={course}
                    onPress={handleCoursePress}
                    onBookmark={handleBookmark}
                    isBookmarked={isBookmarked(course.id)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery
              ? `Results (${filteredCourses.length})`
              : "All Courses"}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </>
    ),
    [user, searchQuery, filteredCourses.length, courses, handleCoursePress, handleBookmark, isBookmarked]
  );

  if (loading && courses.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header user={user} />
        <CourseSkeleton count={5} />
      </SafeAreaView>
    );
  }

  if (error && courses.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header user={user} />
        <ErrorView
          error={{
            type: "NETWORK",
            message: error,
            originalError: {} as any,
          }}
          onRetry={fetchCourses}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filteredCourses}
        keyExtractor={keyExtractor}
        renderItem={renderCourseItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6366F1"
            colors={["#6366F1"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  listContent: {
    paddingBottom: 24,
  },
  cardWrapper: {
    paddingHorizontal: 20,
  },
  domainsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  domainCard: {
    width: "48%",
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
  },
  domainGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  domainLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  popularSection: {
    marginBottom: 24,
  },
  popularScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: "#64748B",
    fontSize: 13,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
