import React, { useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationRow } from "@/components/NotificationRow";
import { markAsRead, AppNotification } from "@/services/notificationService";

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markAllRead, clearAll, reload } =
    useNotifications();

  const handleNotificationPress = async (notification: AppNotification) => {
    await markAsRead(notification.id);
    reload();

    if (notification.type === "BOOKMARK_MILESTONE") {
      router.push("/(tabs)/bookmarks");
    } else if (notification.type === "RE_ENGAGEMENT") {
      router.push("/(tabs)/home");
    }
  };

  const sections = useMemo(() => {
    if (notifications.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayItems: AppNotification[] = [];
    const yesterdayItems: AppNotification[] = [];
    const olderItems: AppNotification[] = [];

    notifications.forEach((item) => {
      const itemDate = new Date(item.timestamp);
      if (itemDate >= today) {
        todayItems.push(item);
      } else if (itemDate >= yesterday) {
        yesterdayItems.push(item);
      } else {
        olderItems.push(item);
      }
    });

    const result = [];
    if (todayItems.length > 0) result.push({ title: "Today", data: todayItems });
    if (yesterdayItems.length > 0)
      result.push({ title: "Yesterday", data: yesterdayItems });
    if (olderItems.length > 0) result.push({ title: "Older", data: olderItems });

    return result;
  }, [notifications]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#F1F5F9" />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <Pressable onPress={markAllRead}>
              <Text style={styles.markReadText}>Mark all read</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#1E293B" />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySub}>
            You'll see course updates and reminders here
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationRow
              notification={item}
              onPress={() => handleNotificationPress(item)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {notifications.length > 0 && (
        <Pressable style={styles.clearBtn} onPress={clearAll}>
          <Text style={styles.clearText}>Clear History</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F1F5F9",
  },
  headerRight: {
    minWidth: 80,
    alignItems: "flex-end",
  },
  markReadText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F1F5F9",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  sectionHeader: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748B",
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  clearBtn: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#1E293B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  clearText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
});
