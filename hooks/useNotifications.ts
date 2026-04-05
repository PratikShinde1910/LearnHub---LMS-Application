import { useState, useEffect, useCallback } from 'react';
import { 
  getNotificationHistory, 
  markAllNotificationsRead, 
  clearNotificationHistory,
  AppNotification 
} from '@/services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const history = await getNotificationHistory();
      setNotifications(history);
      setUnreadCount(history.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [loadNotifications]);

  const clearAll = useCallback(async () => {
    try {
      await clearNotificationHistory();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return { 
    notifications, 
    unreadCount, 
    loading, 
    markAllRead, 
    clearAll, 
    reload: loadNotifications 
  };
}
