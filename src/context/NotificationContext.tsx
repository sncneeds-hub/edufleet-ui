import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Notification } from '@/types/subscriptionTypes';
import {
  getRecentUnreadNotifications,
  getUnreadCountApi,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
  getNotifications,
} from '@/api/services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadNotifications: () => Promise<void>;
  loadAllNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID from session/auth
  const getCurrentUserId = useCallback((): string => {
    return user?.id || '';
  }, [user?.id]);

  const loadNotifications = useCallback(async () => {
    const userId = getCurrentUserId();
    
    // Don't fetch if no user is logged in
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // Fetch recent unread notifications for the list
      const response = await getRecentUnreadNotifications(userId, 10);
      if (response.success && response.data) {
        setNotifications(response.data);
      }

      // Fetch accurate unread count
      const countResponse = await getUnreadCountApi(userId);
      if (countResponse.success && countResponse.data) {
        setUnreadCount(countResponse.data.count);
      } else if (response.success && response.data) {
        // Fallback to list length if count API fails
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

  const loadAllNotifications = useCallback(async () => {
    const userId = getCurrentUserId();
    
    // Don't fetch if no user is logged in
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const response = await getNotifications(userId);
      if (response.success && response.data) {
        const allNotifications = response.data.items || response.data;
        setNotifications(Array.isArray(allNotifications) ? allNotifications : []);
        const unread = (Array.isArray(allNotifications) ? allNotifications : []).filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load all notifications';
      setError(message);
      console.error('Error loading all notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    if (!notificationId) return;
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
    if (!notificationId) {
      console.warn('deleteNotification called with missing notificationId');
      return;
    }
    
    // Optimistically update UI first for better UX
    setNotifications(prev => {
      const deletedNotif = prev.find(n => n.id === notificationId);
      
      // Update unread count if deleted notification was unread
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return prev.filter(n => n.id !== notificationId);
    });
    
    try {
      setError(null);
      console.log(`[NotificationContext] Deleting notification ${notificationId}...`);
      const result = await deleteNotificationApi(notificationId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete notification');
      }
      console.log(`[NotificationContext] Successfully deleted notification ${notificationId}`);
    } catch (err: any) {
      // Revert optimistic update on error by reloading
      const message = err.error || (err instanceof Error ? err.message : 'Failed to delete notification');
      setError(message);
      console.error('Error deleting notification:', err);
      
      // Reload notifications to restore state
      try {
        await loadNotifications();
      } catch (reloadErr) {
        console.error('Error reloading notifications:', reloadErr);
      }
    }
  }, [loadNotifications]);

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
    loadAllNotifications,
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