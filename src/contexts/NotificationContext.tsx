import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationsApi, Notification as ApiNotification } from '../lib/api';
import { useAuth } from '@/hooks/useAuth';

export type NotificationType = 'institute_approved' | 'institute_rejected' | 'vehicle_approved' | 'vehicle_rejected' | 'inquiry_received' | 'inquiry_replied' | 'vehicle_sold';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  metadata?: {
    instituteId?: string;
    instituteName?: string;
    vehicleId?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    inquiryId?: string;
    reason?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearReadNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Convert API notification to our Notification type
  const convertNotification = (apiNotif: ApiNotification): Notification => ({
    id: apiNotif._id,
    userId: apiNotif.userId,
    type: apiNotif.type,
    title: apiNotif.title,
    message: apiNotif.message,
    link: apiNotif.link,
    read: apiNotif.read,
    createdAt: new Date(apiNotif.createdAt),
    metadata: apiNotif.metadata,
  });

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { notifications: apiNotifications, unreadCount: count } = await notificationsApi.getAll({
        limit: 50,
      });
      
      const converted = apiNotifications.map(convertNotification);
      setNotifications(converted);
      setUnreadCount(count);
    } catch (error: any) {
      // Silently fail for network errors (backend not running)
      // This is expected in deployed environments
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Failed to fetch notifications:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      
      // Update local state optimistically
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Refetch to sync state
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Refetch to sync state
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationsApi.delete(id);
      
      // Update local state
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Refetch to sync state
      await fetchNotifications();
    }
  }, [notifications, fetchNotifications]);

  // Clear all read notifications
  const clearReadNotifications = useCallback(async () => {
    try {
      await notificationsApi.clearRead();
      
      // Update local state - keep only unread
      setNotifications(prev => prev.filter(notif => !notif.read));
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
      // Refetch to sync state
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  // Fetch notifications when user logs in
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearReadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
