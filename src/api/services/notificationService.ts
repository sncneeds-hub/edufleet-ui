import { apiClient } from '@/lib/apiClient';
import {
  Notification,
  CreateNotificationDto,
  NotificationFilters,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// ==========================================
// NOTIFICATION CRUD OPERATIONS
// ==========================================

export const getNotifications = async (
  userId: string,
  filters?: NotificationFilters
): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    
    const data = await apiClient.get<PaginatedResponse<Notification>>(endpoint, { requiresAuth: true });

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch notifications',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getUnreadNotifications = async (
  userId: string
): Promise<ApiResponse<Notification[]>> => {
  try {
    const data = await apiClient.get<Notification[]>('/notifications?isRead=false', { requiresAuth: true });

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch unread notifications',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getRecentUnreadNotifications = async (
  userId: string,
  limit: number = 5
): Promise<ApiResponse<Notification[]>> => {
  try {
    const data = await apiClient.get<Notification[]>(`/notifications?isRead=false&limit=${limit}`, { requiresAuth: true });

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch recent unread notifications',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getNotificationById = async (
  notificationId: string
): Promise<ApiResponse<Notification | null>> => {
  try {
    const notification = await apiClient.get<Notification>(`/notifications/${notificationId}`, { requiresAuth: true });

    return {
      success: true,
      data: notification,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch notification',
      timestamp: new Date().toISOString(),
    };
  }
};

export const createNotification = async (
  dto: CreateNotificationDto
): Promise<ApiResponse<Notification>> => {
  try {
    const notification = await apiClient.post<Notification>('/notifications', dto);

    return {
      success: true,
      data: notification,
      message: 'Notification created successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to create notification',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// NOTIFICATION STATUS MANAGEMENT
// ==========================================

export const markNotificationAsRead = async (
  notificationId: string
): Promise<ApiResponse<Notification | null>> => {
  try {
    const notification = await apiClient.put<Notification>(`/notifications/${notificationId}/read`, {});

    return {
      success: true,
      data: notification,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to mark notification as read',
      timestamp: new Date().toISOString(),
    };
  }
};

export const markMultipleAsRead = async (
  notificationIds: string[]
): Promise<ApiResponse<{ markedCount: number }>> => {
  try {
    // Call mark as read for each notification
    await Promise.all(notificationIds.map(id => 
      apiClient.put(`/notifications/${id}/read`, {})
    ));

    return {
      success: true,
      data: { markedCount: notificationIds.length },
      message: `${notificationIds.length} notification(s) marked as read`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to mark notifications as read',
      timestamp: new Date().toISOString(),
    };
  }
};

export const markAllNotificationsAsRead = async (
  userId: string
): Promise<ApiResponse<{ markedCount: number }>> => {
  try {
    const result = await apiClient.put<{ markedCount: number }>('/notifications/mark-all-read', {});

    return {
      success: true,
      data: result,
      message: `${result.markedCount} notification(s) marked as read`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to mark all notifications as read',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// NOTIFICATION DELETION
// ==========================================

export const deleteNotification = async (
  notificationId: string
): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);

    return {
      success: true,
      data: { success: true },
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to delete notification',
      timestamp: new Date().toISOString(),
    };
  }
};

export const deleteMultipleNotifications = async (
  notificationIds: string[]
): Promise<ApiResponse<{ deletedCount: number }>> => {
  try {
    await Promise.all(notificationIds.map(id => 
      apiClient.delete(`/notifications/${id}`)
    ));

    return {
      success: true,
      data: { deletedCount: notificationIds.length },
      message: `${notificationIds.length} notification(s) deleted`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to delete notifications',
      timestamp: new Date().toISOString(),
    };
  }
};

export const clearAllNotifications = async (
  userId: string
): Promise<ApiResponse<{ deletedCount: number }>> => {
  try {
    // Get all notifications first, then delete them
    const notifications = await apiClient.get<Notification[]>('/notifications', { requiresAuth: true });
    await Promise.all(notifications.map(n => 
      apiClient.delete(`/notifications/${n.id}`)
    ));

    return {
      success: true,
      data: { deletedCount: notifications.length },
      message: `${notifications.length} notification(s) deleted`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to clear notifications',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// NOTIFICATION STATS & COUNTS
// ==========================================

export const getUnreadCountApi = async (
  userId: string
): Promise<ApiResponse<{ count: number }>> => {
  try {
    const data = await apiClient.get<{ count: number }>('/notifications/unread-count', { requiresAuth: true });

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch unread count',
      timestamp: new Date().toISOString(),
    };
  }
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
  try {
    // Get all notifications and calculate stats client-side
    const notifications = await apiClient.get<Notification[]>('/notifications', { requiresAuth: true });
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const read = total - unread;

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    notifications.forEach(n => {
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
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch notification stats',
      timestamp: new Date().toISOString(),
    };
  }
};
