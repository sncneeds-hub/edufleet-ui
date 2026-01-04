import { apiClient } from '@/lib/apiClient';
import {
  Notification,
  CreateNotificationDto,
  NotificationFilters,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// ==========================================
// HELPER: Transform MongoDB _id to id
// ==========================================

interface MongoNotification {
  _id?: string;
  id?: string;
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  isRead: boolean;
  priority: Notification['priority'];
  link?: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt?: string;
  readAt?: string;
}

const transformNotification = (n: MongoNotification): Notification => ({
  id: n._id || n.id || '',
  userId: n.userId,
  type: n.type,
  title: n.title,
  message: n.message,
  isRead: n.isRead,
  priority: n.priority || 'low',
  actionUrl: n.actionUrl || n.link,
  createdAt: n.createdAt,
  readAt: n.readAt,
});

const transformNotifications = (notifications: MongoNotification[]): Notification[] => {
  return notifications.map(transformNotification);
};

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
    
    const rawData = await apiClient.get<any>(endpoint, { requiresAuth: true });
    
    // Handle the response format from backend
    const items = Array.isArray(rawData) ? rawData : (rawData.items || rawData.data || []);
    const transformedItems = transformNotifications(items);

    return {
      success: true,
      data: {
        items: transformedItems,
        total: rawData.pagination?.total || transformedItems.length,
        page: rawData.pagination?.page || 1,
        pageSize: rawData.pagination?.limit || 20,
        hasMore: rawData.pagination?.pages > rawData.pagination?.page || false,
      },
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
    const rawData = await apiClient.get<any>('/notifications?isRead=false', { requiresAuth: true });
    
    // Handle the response format from backend
    const items = Array.isArray(rawData) ? rawData : (rawData.items || rawData.data || []);
    const transformedItems = transformNotifications(items);

    return {
      success: true,
      data: transformedItems,
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
    const rawData = await apiClient.get<any>(`/notifications?isRead=false&limit=${limit}`, { requiresAuth: true });
    
    // Handle the response format from backend
    const items = Array.isArray(rawData) ? rawData : (rawData.items || rawData.data || []);
    const transformedItems = transformNotifications(items);

    return {
      success: true,
      data: transformedItems,
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
  if (!notificationId || notificationId === 'undefined') {
    console.error('getNotificationById called with invalid ID:', notificationId);
    throw {
      success: false,
      error: 'Invalid notification ID',
      timestamp: new Date().toISOString(),
    };
  }
  try {
    const notification = await apiClient.get<any>(`/notifications/${notificationId}`, { requiresAuth: true });

    return {
      success: true,
      data: notification ? transformNotification(notification) : null,
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
    const notification = await apiClient.post<any>('/notifications', dto);

    return {
      success: true,
      data: transformNotification(notification),
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
  if (!notificationId || notificationId === 'undefined') {
    console.error('markNotificationAsRead called with invalid ID:', notificationId);
    throw {
      success: false,
      error: 'Invalid notification ID',
      timestamp: new Date().toISOString(),
    };
  }
  try {
    const notification = await apiClient.put<any>(`/notifications/${notificationId}/read`, {});

    return {
      success: true,
      data: notification ? transformNotification(notification) : null,
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
  if (!notificationId || notificationId === 'undefined') {
    console.error('deleteNotification called with invalid ID:', notificationId);
    throw {
      success: false,
      error: 'Invalid notification ID',
      timestamp: new Date().toISOString(),
    };
  }
  try {
    console.log(`[NotificationService] Deleting notification with ID: ${notificationId}`);
    await apiClient.delete(`/notifications/${notificationId}`, { requiresAuth: true });

    return {
      success: true,
      data: { success: true },
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`[NotificationService] Error deleting notification ${notificationId}:`, error);
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