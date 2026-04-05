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
  } catch {
    return false;
  }
}

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
      trigger: null,
    });

    await saveNotificationToHistory({
      type: 'BOOKMARK_MILESTONE',
      title: "You're on fire! 🔥",
      body: "You've bookmarked 5 courses. Time to start learning!",
      timestamp: new Date().toISOString(),
      data: { count: 5 },
    });

    await AsyncStorage.setItem(NOTIFICATION_KEYS.MILESTONE_SENT, 'true');
  } catch {
  }
}

export async function scheduleReEngagementNotification(): Promise<void> {
  try {
    const lastOpenedAt = await AsyncStorage.getItem(NOTIFICATION_KEYS.LAST_OPENED);
    const now = Date.now();

    if (!lastOpenedAt) {
      await updateLastOpenedAt();
      return;
    }

    const diff = now - new Date(lastOpenedAt).getTime();
    const THRESHOLD = 24 * 60 * 60 * 1000;

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
  } catch {
  }
}

export async function updateLastOpenedAt(): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_KEYS.LAST_OPENED, new Date().toISOString());
  } catch {}
}

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
  } catch {}
}

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
  } catch {
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map(n => ({ ...n, isRead: true }));
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function clearNotificationHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export async function markAsRead(id: string): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}
