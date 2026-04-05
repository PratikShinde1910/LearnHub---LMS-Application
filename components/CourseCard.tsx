import React, { memo, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { MappedCourse } from "@/services/courseService";
import { getCourseImage } from "@/utils/getCourseImage";

interface CourseCardProps {
  course: MappedCourse;
  onPress: (course: MappedCourse) => void;
  onBookmark: (courseId: string) => void;
  isBookmarked: boolean;
}

function CourseCardComponent({
  course,
  onPress,
  onBookmark,
  isBookmarked,
}: CourseCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleBookmark = useCallback(() => {
    // Animate bookmark icon
    Animated.sequence([
      Animated.spring(bookmarkScale, {
        toValue: 1.4,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(bookmarkScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onBookmark(course.id);
  }, [bookmarkScale, course.id, onBookmark]);

  const handlePress = useCallback(() => {
    onPress(course);
  }, [course, onPress]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: getCourseImage(course.title, course.domain) }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={StyleSheet.absoluteFill}
          />
          {/* Price badge */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>
              ${course.price}
            </Text>
          </View>
          {/* Popular badge */}
          {(course.rating || 0) > 4.5 && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category + Bookmark row */}
          <View style={styles.topRow}>
            <LinearGradient
              colors={["rgba(99, 102, 241, 0.2)", "rgba(79, 70, 229, 0.1)"]}
              style={styles.categoryBadge}
            >
              <Text style={styles.categoryText}>{course.domain}</Text>
            </LinearGradient>

            <Pressable onPress={handleBookmark} hitSlop={8}>
              <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={isBookmarked ? "#F59E0B" : "#64748B"}
                />
              </Animated.View>
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {course.title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {course.description}
          </Text>

          {/* Instructor + Rating */}
          <View style={styles.bottomRow}>
            <View style={styles.instructorRow}>
              <Image
                source={{ uri: course.instructorAvatar }}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <Text style={styles.instructorName} numberOfLines={1}>
                {course.instructorName}
              </Text>
            </View>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {(course.rating || 0).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const CourseCard = memo(CourseCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  thumbnailWrapper: {
    position: "relative",
  },
  thumbnail: {
    width: 120,
    height: 130,
  },
  priceBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  popularBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    color: "#A5B4FC",
    fontSize: 10,
    fontWeight: "700",
  },
  title: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
    lineHeight: 20,
  },
  description: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  instructorName: {
    color: "#94A3B8",
    fontSize: 11,
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 3,
  },
});
