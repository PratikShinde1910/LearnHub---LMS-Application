import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { User } from "@/types";
import { useRouter } from "expo-router";
import { useNotifications } from "@/hooks/useNotifications";

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const greeting = getGreeting();
  const initial = user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={styles.greeting}>{greeting} 👋</Text>
        <Text style={styles.name}>{user?.username || "Learner"}</Text>
      </View>

      <View style={styles.rightCol}>
        <Pressable
          onPress={() => router.push("/notifications")}
          style={styles.notificationBtn}
        >
          <Ionicons name="notifications-outline" size={22} color="#94A3B8" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.avatarWrapper}
        >
          {user?.avatar?.url ? (
            <Image
              source={{ uri: user.avatar.url }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <LinearGradient
              colors={["#4F46E5", "#6366F1"]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  leftCol: {
    flex: 1,
  },
  greeting: {
    color: "#94A3B8",
    fontSize: 14,
  },
  name: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 2,
  },
  rightCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: "#1E293B",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
