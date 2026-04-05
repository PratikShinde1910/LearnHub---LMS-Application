import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { NOTIFICATION_KEYS, NotificationData } from '@/types/notifications';

export interface AppNotification {
  id: string;
  type: 'BOOKMARK_MILESTONE' | 'RE_ENGAGEMENT' | 'CHAPTER_COMPLETE' | 'SYSTEM';
  title: string;
  body: string;
  timestamp: string;        // ISO string
  isRead: boolean;
  data?: Record<string, any>;
}

const HISTORY_KEY = 'notification_history';
const MAX_HISTORY = 50;

/**
 * 1. Request Notification Permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';
    await AsyncStorage.setItem(NOTIFICATION_KEYS.PERMISSION, granted.toString());

    if (granted && Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
      });
    }

    return granted;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * 2. Schedule Bookmark Milestone Notification (Exactly 5)
 */
export async function scheduleBookmarkMilestoneNotification(
  bookmarkCount: number
): Promise<void> {
  try {
    if (bookmarkCount !== 5) return;

    const alreadySent = await AsyncStorage.getItem(NOTIFICATION_KEYS.MILESTONE_SENT);
    if (alreadySent === 'true') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You're on fire! 🔥",
        body: "You've bookmarked 5 courses. Time to start learning!",
        data: { type: "BOOKMARK_MILESTONE", count: 5 } as any,
      },
      trigger: null, // Immediate
    });

    await saveNotificationToHistory({
      type: 'BOOKMARK_MILESTONE',
      title: "You're on fire! 🔥",
      body: "You've bookmarked 5 courses. Time to start learning!",
      timestamp: new Date().toISOString(),
      data: { count: 5 },
    });

    await AsyncStorage.setItem(NOTIFICATION_KEYS.MILESTONE_SENT, 'true');
  } catch (error) {
    console.error('Error scheduling milestone notification:', error);
  }
}

/**
 * 3. Schedule Re-Engagement Notification (24h Inactivity)
 */
export async function scheduleReEngagementNotification(): Promise<void> {
  try {
    const lastOpenedAt = await AsyncStorage.getItem(NOTIFICATION_KEYS.LAST_OPENED);
    const now = Date.now();

    if (!lastOpenedAt) {
      await updateLastOpenedAt();
      return;
    }

    const diff = now - new Date(lastOpenedAt).getTime();
    
    // TESTING: Change to 10 seconds for verification as per instructions
    // PRODUCTION: 24 * 60 * 60 * 1000
    const THRESHOLD = 10 * 1000; 

    if (diff >= THRESHOLD) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Miss you! 👋",
          body: "You haven't opened the app in a while. Pick up where you left off!",
          data: { type: "RE_ENGAGEMENT" } as any,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
        },
      });

      await saveNotificationToHistory({
        type: 'RE_ENGAGEMENT',
        title: "Miss you! 👋",
        body: "You haven't opened the app in a while. Pick up where you left off!",
        timestamp: new Date().toISOString(),
      });
    }

    await updateLastOpenedAt();
  } catch (error) {
    console.error('Error scheduling re-engagement notification:', error);
  }
}

/**
 * 4. Update Last Opened Timestamp
 */
export async function updateLastOpenedAt(): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_KEYS.LAST_OPENED, new Date().toISOString());
  } catch (error) {
    console.error('Error updating last opened timestamp:', error);
  }
}

/**
 * 5. Handle Notification Response (Deep Linking)
 */
export async function handleNotificationResponse(
  response: Notifications.NotificationResponse
): Promise<void> {
  try {
    const data = response.notification.request.content.data as any;
    
    if (data?.type === 'BOOKMARK_MILESTONE') {
      router.push('/(tabs)/bookmarks');
    } else if (data.type === 'RE_ENGAGEMENT') {
      router.push('/(tabs)/home');
    }
  } catch (error) {
    console.error('Error handling notification response:', error);
  }
}

/**
 * 6. History Management
 */
export async function getNotificationHistory(): Promise<AppNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveNotificationToHistory(
  notif: Omit<AppNotification, 'id' | 'isRead'>
): Promise<void> {
  try {
    const existing = await getNotificationHistory();
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now().toString(),
      isRead: false,
    };
    const updated = [newNotif, ...existing].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving notification history:', error);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map(n => ({ ...n, isRead: true }));
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking all read:', error);
  }
}

export async function clearNotificationHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

export async function markAsRead(id: string): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking single as read:', error);
  }
}
