import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCourses } from "@/store/courseStore";
import { useBookmarksContext } from "@/store/bookmarkStore";
import { useEnrollment } from "@/store/enrolledStore";
import { useCourseProgress } from "@/store/progressStore";
import { CourseHeader } from "@/components/CourseHeader";
import { EnrollButton } from "@/components/EnrollButton";
import { getCourseImage } from "@/utils/getCourseImage";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses, loading } = useCourses();
  const { toggleBookmark, isBookmarked } = useBookmarksContext();
  const { isEnrolled, enroll } = useEnrollment();
  const { getProgress } = useCourseProgress();
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [justEnrolled, setJustEnrolled] = useState(false);

  const course = useMemo(
    () => courses.find((c) => c.id === id),
    [courses, id]
  );

  if (loading && !course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#475569" />
          <Text style={styles.errorText}>Course not found</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={styles.linkText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const bookmarked = isBookmarked(course.id);
  const enrolled = isEnrolled(course.id);
  const progress = getProgress(course.id);
  const discountedPrice =
    course.price - (course.price * (course.discountPercentage || 0)) / 100;

  const handleEnroll = async () => {
    setEnrollLoading(true);
    setTimeout(async () => {
      await enroll(course.id);
      setEnrollLoading(false);
      setJustEnrolled(true);
      setTimeout(() => {
        setJustEnrolled(false);
      }, 2000);
    }, 800);
  };

  const handleStartCourse = () => {
    const defaultChapters = [
      { id: 1, title: "Introduction", content: `Welcome to the ${course.title} course. Learn basics and set up your environment.`, duration: "5 min" },
      { id: 2, title: "Core Concepts", content: "Learn the core syntax, variables, loops, and functions.", duration: "12 min" },
      { id: 3, title: "Advanced Topics", content: "Understand advanced architectures, Auto Layout and Size Classes.", duration: "18 min" },
      { id: 4, title: "Final Project", content: "Build a complete mini-app using everything you have learned.", duration: "25 min" }
    ];

    router.push({
      pathname: "/course/webview",
      params: {
        id: course.id,
        title: course.title,
        instructor: course.instructorName,
        category: course.domain,
        chapters: JSON.stringify(defaultChapters)
      },
    });
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <CourseHeader
          thumbnail={getCourseImage(course.title, course.domain)}
          category={course.domain}
          isBookmarked={bookmarked}
          onBack={() => router.back()}
          onBookmark={() => toggleBookmark(course.id)}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.courseTitle}>{course.title}</Text>

          <View style={styles.instructorRow}>
            <View style={styles.instructorInfo}>
              <Image
                source={{ uri: course.instructorAvatar }}
                style={styles.instructorAvatar}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <Text style={styles.instructorName}>
                {course.instructorName}
              </Text>
            </View>
            {enrolled && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{progress}% Complete</Text>
                <View style={styles.progressBarBg}>
                  <View
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.statHighlight}>
                {(course.rating || 0).toFixed(1)}
              </Text>
            </View>
            {course.brand && (
              <View style={styles.statItem}>
                <Ionicons name="pricetag-outline" size={16} color="#64748B" />
                <Text style={styles.statText}>{course.brand}</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="layers-outline" size={16} color="#64748B" />
              <Text style={styles.statText}>{course.domain}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceMain}>
              ${discountedPrice.toFixed(2)}
            </Text>
            {course.discountPercentage ? (
              <>
                <Text style={styles.priceOriginal}>
                  ${course.price.toFixed(2)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round(course.discountPercentage)}% OFF
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Course</Text>
            <Text style={styles.descriptionText}>
              {course.description}
            </Text>
          </View>

          {(course as any).images && (course as any).images.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Preview</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {(course as any).images.map((img: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={styles.galleryImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={300}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <EnrollButton
        isEnrolled={enrolled}
        justEnrolled={justEnrolled}
        onEnroll={handleEnroll}
        onStartCourse={handleStartCourse}
        loading={enrollLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#94A3B8",
    fontSize: 18,
    marginTop: 16,
  },
  linkText: {
    color: "#818CF8",
    fontSize: 14,
    fontWeight: "bold",
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  courseTitle: {
    color: "#F1F5F9",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  instructorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  instructorName: {
    color: "#CBD5E1",
    fontSize: 14,
  },
  progressContainer: {
    alignItems: "flex-end",
  },
  progressText: {
    color: "#A5B4FC",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  progressBarBg: {
    width: 80,
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 16,
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statHighlight: {
    color: "#FBBF24",
    fontSize: 14,
    fontWeight: "bold",
  },
  statText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },
  priceMain: {
    color: "#F1F5F9",
    fontSize: 28,
    fontWeight: "bold",
  },
  priceOriginal: {
    color: "#64748B",
    fontSize: 16,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  descriptionText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 24,
  },
  galleryImage: {
    width: 200,
    height: 140,
    borderRadius: 12,
  },
});
