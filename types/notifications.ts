export type NotificationType = 'BOOKMARK_MILESTONE' | 'RE_ENGAGEMENT';

export interface NotificationData {
  type: NotificationType;
  count?: number;
}

export interface NotificationKeys {
  LAST_OPENED: 'last_opened_at';
  PERMISSION: 'notification_permission';
  MILESTONE_SENT: 'milestone_notif_sent';
}

export const NOTIFICATION_KEYS: NotificationKeys = {
  LAST_OPENED: 'last_opened_at',
  PERMISSION: 'notification_permission',
  MILESTONE_SENT: 'milestone_notif_sent',
};
