import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types/subscriptionTypes';
import {
  getRecentUnreadNotifications,
  getUnreadCount as getUnreadCountApi,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotifications,
} from '@/api/services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID from session/auth
  const getCurrentUserId = useCallback((): string => {
    // This should ideally come from AuthContext or session
    // For now, we'll use a stored value or default
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const user = JSON.parse(stored);
        return user.id;
      }
    } catch (e) {
      console.error('Error getting user ID:', e);
    }
    return 'guest';
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getCurrentUserId();

      const response = await getRecentUnreadNotifications(userId, 10);
      if (response.success && response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.length);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(message);
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await markNotificationAsRead(notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(message);
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      setError(null);
      const userId = getCurrentUserId();

      await markAllNotificationsAsRead(userId);

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark all as read';
      setError(message);
      console.error('Error marking all as read:', err);
    }
  }, [getCurrentUserId]);

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await deleteNotification(notificationId);

      // Update local state
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Update unread count if deleted notification was unread
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(message);
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load notifications on mount and set up interval for polling
  useEffect(() => {
    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    clearError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
