import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";

// ─── Single Skeleton Pulse ──────────────────────────────────────────────────

function SkeletonPulse({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: "#334155",
          opacity,
        },
        style,
      ]}
    />
  );
}

// ─── Course Card Skeleton ───────────────────────────────────────────────────

export function CourseCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <SkeletonPulse width={112} height={112} borderRadius={0} />
      {/* Content */}
      <View style={styles.cardContent}>
        <SkeletonPulse width={60} height={18} borderRadius={10} />
        <SkeletonPulse
          width="90%"
          height={16}
          style={{ marginTop: 10 }}
        />
        <SkeletonPulse
          width="60%"
          height={16}
          style={{ marginTop: 6 }}
        />
        <View style={styles.cardBottom}>
          <SkeletonPulse width={80} height={12} />
          <SkeletonPulse width={40} height={12} />
        </View>
      </View>
    </View>
  );
}

// ─── Full Loading Screen ────────────────────────────────────────────────────

export function CourseSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.container}>
      {/* Search bar skeleton */}
      <View style={styles.searchWrapper}>
        <SkeletonPulse width="100%" height={48} borderRadius={14} />
      </View>

      {/* Category bar skeleton */}
      <View style={styles.categoryRow}>
        {[80, 100, 70, 90, 75].map((w, i) => (
          <SkeletonPulse
            key={i}
            width={w}
            height={36}
            borderRadius={12}
            style={{ marginRight: 8 }}
          />
        ))}
      </View>

      {/* Section title */}
      <View style={styles.sectionTitle}>
        <SkeletonPulse width={140} height={20} />
      </View>

      {/* Course cards */}
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.cardWrapper}>
          <CourseCardSkeleton />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
});
