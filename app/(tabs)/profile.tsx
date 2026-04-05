import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/theme";
import { useEnrollment } from "@/store/enrolledStore";
import { useBookmarksContext } from "@/store/bookmarkStore";
import { useCourseProgress } from "@/store/progressStore";
import { useCourses } from "@/store/courseStore";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileStatCard } from "@/components/ProfileStatCard";

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  iconColor?: string;
  danger?: boolean;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  iconColor = Colors.dark[300],
  danger = false,
}: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.settingsItem,
        { borderBottomColor: Colors.dark[800] }
      ]}
    >
      <View
        style={[
          styles.settingsIconContainer,
          { backgroundColor: danger ? Colors.error + "15" : Colors.dark[800] }
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? Colors.error : iconColor}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.settingsLabel,
            { color: danger ? "#F87171" : "#FFFFFF" }
          ]}
        >
          {label}
        </Text>
      </View>
      {value && (
        <Text style={styles.settingsValue}>{value}</Text>
      )}
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.dark[500]}
        />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { enrolledIds } = useEnrollment();
  const { bookmarkedIds } = useBookmarksContext();
  const { progressMap } = useCourseProgress();
  const { courses } = useCourses();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const stats = {
    enrolled: enrolledIds.length,
    bookmarks: bookmarkedIds.length,
    completed: Object.values(progressMap).filter((p) => p === 100).length,
    chapters: Object.values(progressMap).reduce((acc, curr) => acc + (curr > 0 ? 1 : 0), 0),
  };

  const inProgressCourses = courses
    .filter((c) => enrolledIds.includes(c.id))
    .map((course) => ({
      ...course,
      percentage: progressMap[course.id] || 0,
    }))
    .filter((c) => c.percentage > 0 && c.percentage < 100)
    .slice(0, 3);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: Colors.dark[900] }]}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={styles.headerContainer}>
          <ProfileAvatar user={user} />
          
          <Text style={styles.username}>
            {user?.username || "Learner"}
          </Text>
          <Text style={styles.email}>
            {user?.email || "No email provided"}
          </Text>

          <View style={styles.statsRow}>
            <ProfileStatCard
              label="Enrolled"
              value={stats.enrolled}
              icon="book-outline"
              color="#6366F1"
            />
            <ProfileStatCard
              label="Bookmarks"
              value={stats.bookmarks}
              icon="bookmark-outline"
              color="#F59E0B"
            />
            <ProfileStatCard
              label="Finished"
              value={stats.completed}
              icon="trophy-outline"
              color="#10B981"
            />
            <ProfileStatCard
              label="Chapters"
              value={stats.chapters}
              icon="checkmark-done-outline"
              color="#3B82F6"
            />
          </View>
        </View>

        {inProgressCourses.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>In Progress</Text>
              <Pressable>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>
            
            {inProgressCourses.map((course) => (
              <View key={course.id} style={styles.progressCard}>
                <View style={styles.progressCardHeader}>
                  <Text style={styles.progressCourseTitle} numberOfLines={1}>
                    {course.title}
                  </Text>
                  <Text style={styles.progressPercentage}>{Math.round(course.percentage)}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={["#6366F1", "#8B5CF6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: `${course.percentage}%`, height: "100%" }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <SettingsItem
            icon="notifications-outline"
            label="Notifications"
            value="On"
            iconColor={Colors.primary[400]}
          />
          <SettingsItem
            icon="moon-outline"
            label="Dark Mode"
            value="Always"
            iconColor={Colors.primary[400]}
          />
          <SettingsItem
            icon="language-outline"
            label="Language"
            value="English"
            iconColor={Colors.primary[400]}
          />

          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Support</Text>
          <SettingsItem
            icon="help-circle-outline"
            label="Help Center"
            iconColor={Colors.accent[400]}
          />
          <SettingsItem
            icon="document-text-outline"
            label="Terms & Privacy"
            iconColor={Colors.dark[400]}
          />

          <View style={{ marginTop: 24 }}>
            <SettingsItem
              icon="log-out-outline"
              label="Log Out"
              onPress={handleLogout}
              showArrow={false}
              danger
            />
          </View>
        </View>

        <Text style={styles.versionText}>
          LearnHub v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  email: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 32,
    width: "100%",
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "bold",
  },
  progressCard: {
    marginBottom: 16,
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  progressCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressCourseTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    flex: 1,
    marginRight: 16,
  },
  progressPercentage: {
    color: "#94A3B8",
    fontSize: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#0F172A",
    borderRadius: 3,
    overflow: "hidden",
  },
  sectionLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingsValue: {
    color: "#64748B",
    fontSize: 14,
    marginRight: 8,
  },
  versionText: {
    color: "#475569",
    fontSize: 12,
    textAlign: "center",
    marginTop: 32,
  },
});
