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
    } catch {}
    finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } catch {}
  }, [loadNotifications]);

  const clearAll = useCallback(async () => {
    try {
      await clearNotificationHistory();
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
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
