import React, { memo, useRef, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface CourseHeaderProps {
  thumbnail: string;
  category: string;
  isBookmarked: boolean;
  onBack: () => void;
  onBookmark: () => void;
}

function CourseHeaderComponent({
  thumbnail,
  category,
  isBookmarked,
  onBack,
  onBookmark,
}: CourseHeaderProps) {
  const bookmarkScale = useRef(new Animated.Value(1)).current;

  const handleBookmarkPress = useCallback(() => {
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
    onBookmark();
  }, [bookmarkScale, onBookmark]);

  return (
    <View style={styles.heroContainer}>
      <Image
        source={{ uri: thumbnail }}
        style={styles.heroImage}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={["transparent", "#0F172A"]}
        style={styles.heroGradient}
      />

      {/* Back & Bookmark Buttons */}
      <SafeAreaView style={styles.heroButtons} edges={["top"]}>
        <Pressable onPress={onBack} style={styles.circleButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={handleBookmarkPress} style={styles.circleButton} hitSlop={10}>
          <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isBookmarked ? "#F59E0B" : "#FFFFFF"}
            />
          </Animated.View>
        </Pressable>
      </SafeAreaView>

      {/* Category Badge */}
      <View style={styles.heroBadge}>
        <LinearGradient
          colors={["#4F46E5", "#6366F1"]}
          style={styles.badgeGradient}
        >
          <Text style={styles.badgeText}>{category}</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 260,
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroButtons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadge: {
    position: "absolute",
    bottom: 12,
    left: 20,
  },
  badgeGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export const CourseHeader = memo(CourseHeaderComponent);
