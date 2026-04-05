import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppNotification } from "@/services/notificationService";

interface NotificationRowProps {
  notification: AppNotification;
  onPress: (id: string) => void;
}

export function NotificationRow({ notification, onPress }: NotificationRowProps) {
  const { icon, color } = getNotificationTypeConfig(notification.type);
  const timeAgo = formatTimeAgo(notification.timestamp);

  return (
    <Pressable
      onPress={() => onPress(notification.id)}
      style={[
        styles.container,
        !notification.isRead && styles.unreadContainer,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Text style={{ fontSize: 18 }}>{getEmoji(notification.type)}</Text>
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            !notification.isRead ? styles.unreadTitle : styles.readTitle,
          ]}
        >
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.timestamp}>{timeAgo}</Text>
      </View>

      {!notification.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

function getNotificationTypeConfig(type: AppNotification["type"]) {
  switch (type) {
    case "BOOKMARK_MILESTONE":
      return { icon: "bookmark", color: "#F59E0B" };
    case "RE_ENGAGEMENT":
      return { icon: "time", color: "#3B82F6" };
    case "CHAPTER_COMPLETE":
      return { icon: "checkmark-circle", color: "#10B981" };
    default:
      return { icon: "notifications", color: "#6B7280" };
  }
}

function getEmoji(type: AppNotification["type"]) {
  switch (type) {
    case "BOOKMARK_MILESTONE":
      return "🔖";
    case "RE_ENGAGEMENT":
      return "⏰";
    case "CHAPTER_COMPLETE":
      return "✅";
    default:
      return "🔔";
  }
}

function formatTimeAgo(timestamp: string) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour ago`;
  if (seconds < 172800) return "Yesterday";
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1F2937",
    alignItems: "center",
  },
  unreadContainer: {
    backgroundColor: "rgba(30, 58, 95, 0.3)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  unreadTitle: {
    color: "#F9FAF8",
  },
  readTitle: {
    color: "#9CA3AF",
  },
  body: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: "#4B5563",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    marginLeft: 8,
  },
});
