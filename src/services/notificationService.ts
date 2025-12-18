import api from '../lib/api';

export interface Notification {
  id?: string;
  _id?: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'vehicle_status' | 'job_application' | 'system';
  entityId?: string;
  entityType?: 'vehicle' | 'job' | 'application' | 'supplier' | 'user';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationFilters {
  type?: Notification['type'];
  isRead?: boolean;
  priority?: Notification['priority'];
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    const { data } = await api.get('/notifications', { params: filters });
    return data.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const { data } = await api.get('/notifications/unread-count');
    return data.data.count;
  },

  /**
   * Get recent unread notifications
   */
  async getRecentUnread(limit: number = 5): Promise<Notification[]> {
    const { data } = await api.get('/notifications/recent-unread', { params: { limit } });
    return data.data;
  },

  /**
   * Get single notification by ID
   */
  async getNotification(id: string): Promise<Notification> {
    const { data } = await api.get(`/notifications/${id}`);
    return data.data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data.data;
  },

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(ids: string[]): Promise<{ markedCount: number }> {
    const { data } = await api.put('/notifications/mark-multiple-read', { ids });
    return data.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ markedCount: number }> {
    const { data } = await api.put('/notifications/mark-all-read');
    return data.data;
  },

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(ids: string[]): Promise<{ deletedCount: number }> {
    const { data } = await api.post('/notifications/delete-multiple', { ids });
    return data.data;
  },

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<{ deletedCount: number }> {
    const { data } = await api.delete('/notifications/clear-all');
    return data.data;
  },

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    const { data } = await api.get('/notifications/stats');
    return data.data;
  },

  /**
   * Subscribe to real-time notifications (WebSocket - future)
   */
  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    // TODO: Implement WebSocket connection for real-time notifications
    // For now, return empty unsubscribe function
    console.log('Real-time notifications not yet implemented');
    return () => {
      console.log('Unsubscribing from notifications');
    };
  },
};
