import { simulateDelay } from '../config';
import {
  Notification,
  CreateNotificationDto,
  NotificationFilters,
  ApiResponse,
  PaginatedResponse,
} from '../types';
import {
  mockNotifications,
  getNotificationsByUserId,
  getUnreadCount,
  markNotificationRead,
  markAllAsRead,
  getRecentUnread,
} from '../../mock/notificationData';

// ==========================================
// NOTIFICATION CRUD OPERATIONS
// ==========================================

export const getNotifications = async (
  userId: string,
  filters?: NotificationFilters
): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
  await simulateDelay();

  let filtered = getNotificationsByUserId(userId);

  // Apply filters
  if (filters?.type) {
    filtered = filtered.filter(n => n.type === filters.type);
  }

  if (filters?.isRead !== undefined) {
    filtered = filtered.filter(n => n.isRead === filters.isRead);
  }

  if (filters?.priority) {
    filtered = filtered.filter(n => n.priority === filters.priority);
  }

  // Sort by creation date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      items: paginatedItems,
      total: filtered.length,
      page,
      pageSize,
      hasMore: endIndex < filtered.length,
    },
    timestamp: new Date().toISOString(),
  };
};

export const getUnreadNotifications = async (
  userId: string
): Promise<ApiResponse<Notification[]>> => {
  await simulateDelay(100, 300);

  const notifications = getNotificationsByUserId(userId).filter(n => !n.isRead);

  return {
    success: true,
    data: notifications,
    timestamp: new Date().toISOString(),
  };
};

export const getRecentUnreadNotifications = async (
  userId: string,
  limit: number = 5
): Promise<ApiResponse<Notification[]>> => {
  await simulateDelay(100, 300);

  const notifications = getRecentUnread(userId, limit);

  return {
    success: true,
    data: notifications,
    timestamp: new Date().toISOString(),
  };
};

export const getNotificationById = async (
  notificationId: string
): Promise<ApiResponse<Notification | null>> => {
  await simulateDelay();

  const notification = mockNotifications.find(n => n.id === notificationId) || null;

  return {
    success: true,
    data: notification,
    timestamp: new Date().toISOString(),
  };
};

export const createNotification = async (
  dto: CreateNotificationDto
): Promise<ApiResponse<Notification>> => {
  await simulateDelay();

  const notification: Notification = {
    id: `notif-${Date.now()}`,
    userId: dto.userId,
    type: dto.type,
    entityId: dto.entityId,
    entityType: dto.entityType,
    title: dto.title,
    message: dto.message,
    isRead: false,
    priority: dto.priority || 'medium',
    actionUrl: dto.actionUrl,
    createdAt: new Date().toISOString(),
  };

  mockNotifications.push(notification);

  return {
    success: true,
    data: notification,
    message: 'Notification created successfully',
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// NOTIFICATION STATUS MANAGEMENT
// ==========================================

export const markNotificationAsRead = async (
  notificationId: string
): Promise<ApiResponse<Notification | null>> => {
  await simulateDelay(100, 300);

  const notification = mockNotifications.find(n => n.id === notificationId);

  if (!notification) {
    throw new Error('Notification not found');
  }

  markNotificationRead(notificationId);

  return {
    success: true,
    data: notification,
    message: 'Notification marked as read',
    timestamp: new Date().toISOString(),
  };
};

export const markMultipleAsRead = async (
  notificationIds: string[]
): Promise<ApiResponse<{ markedCount: number }>> => {
  await simulateDelay(100, 300);

  let markedCount = 0;

  notificationIds.forEach(id => {
    const notification = mockNotifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      markNotificationRead(id);
      markedCount++;
    }
  });

  return {
    success: true,
    data: { markedCount },
    message: `${markedCount} notification(s) marked as read`,
    timestamp: new Date().toISOString(),
  };
};

export const markAllNotificationsAsRead = async (
  userId: string
): Promise<ApiResponse<{ markedCount: number }>> => {
  await simulateDelay(100, 300);

  const unreadNotifications = mockNotifications.filter(
    n => n.userId === userId && !n.isRead
  );

  const markedCount = unreadNotifications.length;
  markAllAsRead(userId);

  return {
    success: true,
    data: { markedCount },
    message: `${markedCount} notification(s) marked as read`,
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// NOTIFICATION DELETION
// ==========================================

export const deleteNotification = async (
  notificationId: string
): Promise<ApiResponse<{ success: boolean }>> => {
  await simulateDelay(100, 300);

  const index = mockNotifications.findIndex(n => n.id === notificationId);

  if (index === -1) {
    throw new Error('Notification not found');
  }

  mockNotifications.splice(index, 1);

  return {
    success: true,
    data: { success: true },
    message: 'Notification deleted successfully',
    timestamp: new Date().toISOString(),
  };
};

export const deleteMultipleNotifications = async (
  notificationIds: string[]
): Promise<ApiResponse<{ deletedCount: number }>> => {
  await simulateDelay(100, 300);

  let deletedCount = 0;

  notificationIds.forEach(id => {
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
      deletedCount++;
    }
  });

  return {
    success: true,
    data: { deletedCount },
    message: `${deletedCount} notification(s) deleted`,
    timestamp: new Date().toISOString(),
  };
};

export const clearAllNotifications = async (
  userId: string
): Promise<ApiResponse<{ deletedCount: number }>> => {
  await simulateDelay(100, 300);

  const userNotificationIds = mockNotifications
    .filter(n => n.userId === userId)
    .map(n => n.id);

  const deletedCount = userNotificationIds.length;

  userNotificationIds.forEach(id => {
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
    }
  });

  return {
    success: true,
    data: { deletedCount },
    message: `${deletedCount} notification(s) deleted`,
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// NOTIFICATION STATS & COUNTS
// ==========================================

export const getUnreadCountApi = async (
  userId: string
): Promise<ApiResponse<{ count: number }>> => {
  await simulateDelay(100, 300);

  const count = getUnreadCount(userId);

  return {
    success: true,
    data: { count },
    timestamp: new Date().toISOString(),
  };
};

export const getNotificationStats = async (
  userId: string
): Promise<ApiResponse<{
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}>> => {
  await simulateDelay(100, 300);

  const userNotifications = getNotificationsByUserId(userId);
  const total = userNotifications.length;
  const unread = userNotifications.filter(n => !n.isRead).length;
  const read = total - unread;

  const byType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  userNotifications.forEach(n => {
    byType[n.type] = (byType[n.type] || 0) + 1;
    byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
  });

  return {
    success: true,
    data: {
      total,
      unread,
      read,
      byType,
      byPriority,
    },
    timestamp: new Date().toISOString(),
  };
};
