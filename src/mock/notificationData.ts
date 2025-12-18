import { Notification } from '../types/subscriptionTypes';

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'inst-1',
    type: 'listing_approved',
    entityId: 'v-1',
    entityType: 'vehicle',
    title: 'Listing Approved',
    message: 'Your Tata Starbus LP 713/52 has been approved and is now live!',
    isRead: false,
    priority: 'high',
    actionUrl: '/vehicle/v-1',
    createdAt: new Date('2024-12-14T10:30:00').toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'inst-1',
    type: 'browse_limit_warning',
    title: 'Browse Limit Warning',
    message: 'You have used 80% of your monthly browse limit (40/50 views)',
    isRead: false,
    priority: 'medium',
    createdAt: new Date('2024-12-14T09:15:00').toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'inst-7',
    type: 'subscription_expiring',
    title: 'Subscription Expiring Soon',
    message: 'Your Standard Plan subscription expires in 5 days. Contact admin to renew.',
    isRead: false,
    priority: 'high',
    createdAt: new Date('2024-12-13T14:00:00').toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'inst-1',
    type: 'listing_approved',
    entityId: 'v-2',
    entityType: 'vehicle',
    title: 'Another Listing Approved',
    message: 'Your Ashok Leyland Viking has been approved!',
    isRead: true,
    priority: 'medium',
    actionUrl: '/vehicle/v-2',
    createdAt: new Date('2024-12-12T16:45:00').toISOString(),
    readAt: new Date('2024-12-12T17:00:00').toISOString(),
  },
  {
    id: 'notif-5',
    userId: 'teacher-1',
    type: 'listing_approved',
    entityId: 'job-1',
    entityType: 'job',
    title: 'New Job Posted',
    message: 'A new Mathematics Teacher position has been posted at Delhi Public School',
    isRead: false,
    priority: 'medium',
    actionUrl: '/teacher/jobs/job-1',
    createdAt: new Date('2024-12-14T08:00:00').toISOString(),
  },
  {
    id: 'notif-6',
    userId: 'inst-7',
    type: 'listing_limit_reached',
    title: 'Listing Limit Reached',
    message: 'You have reached your listing limit (5/5). Contact admin to upgrade your plan.',
    isRead: false,
    priority: 'high',
    createdAt: new Date('2024-12-11T11:30:00').toISOString(),
  },
  {
    id: 'notif-7',
    userId: 'inst-expired',
    type: 'subscription_expired',
    title: 'Subscription Expired',
    message: 'Your subscription has expired. Contact admin to renew access.',
    isRead: false,
    priority: 'high',
    createdAt: new Date('2024-12-01T00:00:00').toISOString(),
  },
  {
    id: 'notif-8',
    userId: 'inst-1',
    type: 'new_feature',
    title: 'New Feature: Supplier Directory',
    message: 'Check out our new supplier directory for educational products and services!',
    isRead: true,
    priority: 'low',
    actionUrl: '/suppliers',
    createdAt: new Date('2024-12-10T12:00:00').toISOString(),
    readAt: new Date('2024-12-10T15:30:00').toISOString(),
  },
  {
    id: 'notif-9',
    userId: 'inst-1',
    type: 'system_alert',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Dec 20, 2024 from 2 AM - 4 AM IST',
    isRead: false,
    priority: 'low',
    createdAt: new Date('2024-12-09T10:00:00').toISOString(),
  },
  {
    id: 'notif-10',
    userId: 'teacher-1',
    type: 'browse_limit_warning',
    title: 'Browse Limit Warning',
    message: 'You have 2 remaining job views this month',
    isRead: false,
    priority: 'medium',
    createdAt: new Date('2024-12-08T14:20:00').toISOString(),
  },
];

// Helper function to get notifications by user ID
export const getNotificationsByUserId = (userId: string): Notification[] => {
  return mockNotifications
    .filter(notif => notif.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Helper function to get unread count
export const getUnreadCount = (userId: string): number => {
  return mockNotifications.filter(notif => notif.userId === userId && !notif.isRead).length;
};

// Helper function to mark notification as read
export const markNotificationRead = (notificationId: string): void => {
  const notification = mockNotifications.find(n => n.id === notificationId);
  if (notification && !notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date().toISOString();
  }
};

// Helper function to mark all as read for user
export const markAllAsRead = (userId: string): void => {
  mockNotifications
    .filter(n => n.userId === userId && !n.isRead)
    .forEach(n => {
      n.isRead = true;
      n.readAt = new Date().toISOString();
    });
};

// Helper function to get recent unread notifications (for bell icon)
export const getRecentUnread = (userId: string, limit = 5): Notification[] => {
  return mockNotifications
    .filter(notif => notif.userId === userId && !notif.isRead)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};
