/**
 * API Client for EduFleet
 * Connects to Express backend at http://localhost:5000/api
 */

import axios, { AxiosInstance } from 'axios';
import { Institute, Vehicle, ContactInquiry } from '../types';

export interface Notification {
   _id: string;
  id?: string;
  userId: string;
  type: 'institute_approved' | 'institute_rejected' | 'vehicle_approved' | 'vehicle_rejected' | 'inquiry_received' | 'inquiry_replied' | 'vehicle_sold';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata?: {
    instituteId?: string;
    instituteName?: string;
    vehicleId?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    inquiryId?: string;
    reason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Create axios instance with base URL
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Silently pass through errors - let components handle them
        // (This is expected in deployed environments where backend isn't available)
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Authentication API
  auth = {
    signup: async (data: {
      email: string;
      password: string;
      displayName: string;
      role: 'admin' | 'school';
    }): Promise<{
      user: {
        id: string;
        email: string;
        displayName: string;
        role: 'admin' | 'school';
        approvalStatus: string;
        metadata: {
          role: string;
          approvalStatus: string;
        };
      };
      token: string;
    }> => {
      const response = await this.client.post('/auth/signup', data);
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return {
        user: response.data.data,
        token: response.data.token,
      };
    },

    login: async (
      email: string,
      password: string
    ): Promise<{
      user: {
        id: string;
        email: string;
        displayName: string;
        role: 'admin' | 'school';
        approvalStatus: string;
        metadata: {
          role: string;
          approvalStatus: string;
        };
      };
      token: string;
    }> => {
      const response = await this.client.post('/auth/login', { email, password });
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return {
        user: response.data.data,
        token: response.data.token,
      };
    },

    me: async (): Promise<{
      id: string;
      email: string;
      displayName: string;
      role: 'admin' | 'school';
      approvalStatus: string;
      metadata: {
        role: string;
        approvalStatus: string;
      };
    }> => {
      const response = await this.client.get('/auth/me');
      return response.data.data;
    },

    logout: async (): Promise<void> => {
      await this.client.post('/auth/logout');
      // Remove token from localStorage
      localStorage.removeItem('authToken');
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
      const response = await this.client.post('/auth/forgot-password', { email });
      return {
        message: response.data.message,
      };
    },

    resetPassword: async (
      token: string,
      password: string
    ): Promise<{
      user: {
        id: string;
        email: string;
        displayName: string;
        role: 'admin' | 'school';
        approvalStatus: string;
        metadata: {
          role: string;
          approvalStatus: string;
        };
      };
      token: string;
      message: string;
    }> => {
      const response = await this.client.post('/auth/reset-password', {
        token,
        password,
      });
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return {
        user: response.data.data,
        token: response.data.token,
        message: response.data.message,
      };
    },
  };

  // Institutes API
  institutes = {
    getAll: async (status?: string): Promise<Institute[]> => {
      const response = await this.client.get('/institutes', { params: { status } });
      return response.data.data;
    },

    getByUserId: async (userId: string): Promise<Institute | null> => {
      const response = await this.client.get(`/institutes/user/${userId}`);
      return response.data.data;
    },

    getById: async (id: string): Promise<Institute> => {
      const response = await this.client.get(`/institutes/${id}`);
      return response.data.data;
    },

    create: async (data: Partial<Institute>): Promise<Institute> => {
      const response = await this.client.post('/institutes', data);
      return response.data.data;
    },

    update: async (id: string, data: Partial<Institute>): Promise<Institute> => {
      const response = await this.client.put(`/institutes/${id}`, data);
      return response.data.data;
    },

    approve: async (id: string): Promise<Institute> => {
      const response = await this.client.patch(`/institutes/${id}/approve`);
      return response.data.data;
    },

    reject: async (id: string, reason: string): Promise<Institute> => {
      const response = await this.client.patch(`/institutes/${id}/reject`, { reason });
      return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/institutes/${id}`);
    },
  };

  // Vehicles API
  vehicles = {
    getAll: async (filters?: {
      status?: string;
      vehicleType?: string;
      fuelType?: string;
      condition?: string;
      minPrice?: number;
      maxPrice?: number;
      minYear?: number;
      maxYear?: number;
      soldStatus?: string;
      search?: string;
      instituteId?: string;
    }): Promise<Vehicle[]> => {
      const response = await this.client.get('/vehicles', { params: filters });
      return response.data.data;
    },

    getById: async (id: string): Promise<Vehicle> => {
      const response = await this.client.get(`/vehicles/${id}`);
      return response.data.data;
    },

    create: async (data: Partial<Vehicle>): Promise<Vehicle> => {
      const response = await this.client.post('/vehicles', data);
      return response.data.data;
    },

    update: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
      const response = await this.client.put(`/vehicles/${id}`, data);
      return response.data.data;
    },

    approve: async (id: string): Promise<Vehicle> => {
      const response = await this.client.patch(`/vehicles/${id}/approve`);
      return response.data.data;
    },

    reject: async (id: string, reason: string): Promise<Vehicle> => {
      const response = await this.client.patch(`/vehicles/${id}/reject`, { reason });
      return response.data.data;
    },

    markAsSold: async (id: string): Promise<Vehicle> => {
      const response = await this.client.patch(`/vehicles/${id}/sold`);
      return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/vehicles/${id}`);
    },

    getStats: async (instituteId?: string): Promise<{
      total: number;
      pending: number;
      approved: number;
      sold: number;
      active: number;
    }> => {
      const response = await this.client.get('/vehicles/stats/summary', {
        params: { instituteId },
      });
      return response.data.data;
    },
  };

  // Inquiries API
  inquiries = {
    getReceived: async (
      instituteId: string,
      status?: string
    ): Promise<ContactInquiry[]> => {
      const response = await this.client.get('/inquiries/received', {
        params: { instituteId, status },
      });
      return response.data.data;
    },

    getSent: async (instituteId: string): Promise<ContactInquiry[]> => {
      const response = await this.client.get('/inquiries/sent', {
        params: { instituteId },
      });
      return response.data.data;
    },

    getByVehicle: async (vehicleId: string): Promise<ContactInquiry[]> => {
      const response = await this.client.get(`/inquiries/vehicle/${vehicleId}`);
      return response.data.data;
    },

    create: async (data: Partial<ContactInquiry>): Promise<ContactInquiry> => {
      const response = await this.client.post('/inquiries', data);
      return response.data.data;
    },

    updateStatus: async (
      id: string,
      status: 'unread' | 'read' | 'replied'
    ): Promise<ContactInquiry> => {
      const response = await this.client.patch(`/inquiries/${id}/status`, { status });
      return response.data.data;
    },

    sendReply: async (
      id: string,
      replyMessage: string
    ): Promise<ContactInquiry> => {
      const response = await this.client.patch(`/inquiries/${id}/reply`, { replyMessage });
      return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/inquiries/${id}`);
    },

    getStats: async (
      instituteId: string
    ): Promise<{
      totalReceived: number;
      unreadCount: number;
      totalSent: number;
    }> => {
      const response = await this.client.get('/inquiries/stats/summary', {
        params: { instituteId },
      });
      return response.data.data;
    },
  };

  // Notifications API
  notifications = {
    getAll: async (filters?: {
      read?: boolean | 'all';
      type?: string;
      limit?: number;
    }): Promise<{ notifications: Notification[]; unreadCount: number }> => {
      const response = await this.client.get('/notifications', { params: filters });
      return {
        notifications: response.data.data,
        unreadCount: response.data.unreadCount,
      };
    },

    getUnreadCount: async (): Promise<number> => {
      const response = await this.client.get('/notifications/unread-count');
      return response.data.unreadCount;
    },

    markAsRead: async (id: string): Promise<Notification> => {
      const response = await this.client.patch(`/notifications/${id}/read`);
      return response.data.data;
    },

    markAllAsRead: async (): Promise<void> => {
      await this.client.patch('/notifications/mark-all-read');
    },

    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/notifications/${id}`);
    },

    clearRead: async (): Promise<void> => {
      await this.client.delete('/notifications/clear-read');
    },
  };
}

// Export singleton instance
export const api = new ApiClient();

// Export individual API namespaces for convenience
export const institutesApi = api.institutes;
export const vehiclesApi = api.vehicles;
export const inquiriesApi = api.inquiries;
export const notificationsApi = api.notifications;

export default api;
