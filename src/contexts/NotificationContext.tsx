import React, { useState, useCallback, useEffect, useRef } from 'react';
import { notificationsApi, Notification as ApiNotification } from '../lib/api';
import { useAuth } from '@/hooks/useAuth';
import { NotificationContext, Notification as NotificationType, NotificationContextType } from './notification-base';
import { blink } from '@/lib/blink';
import type { RealtimeChannel } from '@blinkdotnew/sdk';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Convert API notification to our Notification type
  const convertNotification = (apiNotif: ApiNotification): NotificationType => ({
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

  // Set up realtime notifications and fallback polling
  useEffect(() => {
    if (!user) {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial fetch
    fetchNotifications();

    // Set up realtime subscription for instant notifications
    let channel: RealtimeChannel | null = null;
    
    const setupRealtime = async () => {
      try {
        channel = blink.realtime.channel(`notifications-${user.id}`);
        
        await channel.subscribe({
          userId: user.id,
          metadata: { userName: user.instituteName || user.email }
        });

        // Listen for new notifications
        const unsubMessage = channel.onMessage((message) => {
          if (message.type === 'notification_created') {
            const newNotification: NotificationType = {
              id: message.data.id,
              userId: message.data.userId,
              type: message.data.type,
              title: message.data.title,
              message: message.data.message,
              link: message.data.link,
              read: message.data.read,
              createdAt: new Date(message.data.createdAt),
              metadata: message.data.metadata,
            };

            // Add to notifications list (prepend to show newest first)
            setNotifications(prev => [newNotification, ...prev]);
            
            // Increment unread count
            if (!newNotification.read) {
              setUnreadCount(prev => prev + 1);
            }
          }
        });

        channelRef.current = channel;
      } catch (error) {
        console.error('Failed to setup realtime notifications:', error);
      }
    };

    setupRealtime();

    // Fallback: Poll every 2 minutes as backup (reduced from 30s since we have realtime)
    // This ensures we stay in sync even if realtime connection drops
    const fallbackInterval = setInterval(() => {
      fetchNotifications();
    }, 120000); // 2 minutes

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      clearInterval(fallbackInterval);
    };
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


