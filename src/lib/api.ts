/**
 * API Client for EduFleet
 * Connects to Express backend at http://localhost:5000/api
 */

import axios, { AxiosInstance } from 'axios';
import { Institute, Vehicle, ContactInquiry, VerificationStatus, VerificationOrder } from '../types';

export interface Notification {
  _id: string;
  id?: string; // Legacy support for backward compatibility
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
        // Enhanced centralized error logging
        const errorDetails = {
          timestamp: new Date().toISOString(),
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.response?.data?.error || error.message,
          data: error.response?.data,
        };

        // Log to console in development
        if (import.meta.env.DEV) {
          console.error('API Error:', errorDetails);
        }

        // Log structured error for monitoring
        this.logError(errorDetails);

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Unauthorized - clear token and potentially redirect
          localStorage.removeItem('authToken');
          console.warn('Authentication expired. Please login again.');
        } else if (error.response?.status === 429) {
          // Rate limit exceeded
          console.warn('Rate limit exceeded. Please try again later.');
        } else if (error.response?.status === 403) {
          // Forbidden
          console.warn('Access forbidden. You do not have permission for this action.');
        } else if (!error.response) {
          // Network error
          console.warn('Network error. Please check your connection.');
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Log errors to external monitoring service (placeholder for future integration)
   */
  private logError(errorDetails: any): void {
    // Store recent errors in localStorage for debugging
    try {
      const recentErrors = JSON.parse(localStorage.getItem('api_errors') || '[]');
      recentErrors.push(errorDetails);
      
      // Keep only last 20 errors
      if (recentErrors.length > 20) {
        recentErrors.shift();
      }
      
      localStorage.setItem('api_errors', JSON.stringify(recentErrors));
    } catch (e) {
      // Silently fail if localStorage is full
    }

    // TODO: Send to external monitoring service (e.g., Sentry, LogRocket)
    // Example: Sentry.captureException(new Error(errorDetails.message), { extra: errorDetails });
  }

  /**
   * Get recent API errors for debugging
   */
  getRecentErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem('api_errors') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear error logs
   */
  clearErrorLogs(): void {
    localStorage.removeItem('api_errors');
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
      subscriptionPlan?: 'Silver' | 'Gold' | 'Platinum';
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

    setPriority: async (id: string, isPriority: boolean, expiresAt?: Date): Promise<Institute> => {
      const response = await this.client.patch(`/institutes/${id}/priority`, {
        isPriority,
        expiresAt: expiresAt?.toISOString(),
      });
      return response.data.data;
    },

    getPriorityList: async (): Promise<Institute[]> => {
      const response = await this.client.get('/institutes/priority/list');
      return response.data.data;
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

    getRelated: async (vehicleId: string, limit?: number): Promise<any[]> => {
      const response = await this.client.get(`/related-vehicles/${vehicleId}`, {
        params: { limit: limit || 6 },
      });
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

    promote: async (
      id: string,
      data: {
        isPromoted: boolean;
        adPrice?: number;
        adBudget?: number;
        adPlacements?: ('landing' | 'browse' | 'detail')[];
      }
    ): Promise<Vehicle> => {
      const response = await this.client.patch(`/vehicles/${id}/promote`, data);
      return response.data.data;
    },

    getAdsByPage: async (pageLocation: 'landing' | 'browse' | 'detail'): Promise<Vehicle[]> => {
      const response = await this.client.get(`/vehicles/ads/${pageLocation}`);
      return response.data.data;
    },

    toggleFeatured: async (
      id: string,
      data: {
        isFeatured: boolean;
        durationDays?: number;
      }
    ): Promise<Vehicle> => {
      const response = await this.client.patch(`/vehicles/${id}/feature`, data);
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

  // Ad Tracking API
  adTracking = {
    recordImpression: async (
      vehicleId: string,
      pageLocation: 'landing' | 'browse' | 'detail',
      sessionId: string,
      referrer?: string
    ): Promise<void> => {
      await this.client.post('/adviews/impression', {
        vehicleId,
        pageLocation,
        sessionId,
        referrer,
      });
    },

    recordClick: async (
      vehicleId: string,
      pageLocation: 'landing' | 'browse' | 'detail',
      sessionId: string
    ): Promise<void> => {
      await this.client.post('/adviews/click', {
        vehicleId,
        pageLocation,
        sessionId,
      });
    },

    getStats: async (filters?: {
      vehicleId?: string;
      instituteId?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<{
      impressions: number;
      clicks: number;
      ctr: string;
    }> => {
      const response = await this.client.get('/adviews/stats', { params: filters });
      return response.data.data;
    },

    getRevenue: async (filters?: {
      startDate?: string;
      endDate?: string;
    }): Promise<{
      totalRevenue: number;
      vehicles: any[];
    }> => {
      const response = await this.client.get('/adviews/revenue', { params: filters });
      return response.data.data;
    },
  };

  // Inquiry Analytics API
  inquiryAnalytics = {
    getSchoolStats: async (): Promise<{
      totalInquiries: number;
      totalReplied: number;
      responseRate: number;
      averageResponseTime: number;
      topPerformingVehicles: any[];
      leastPerformingVehicles: any[];
      inquiryTrend: Array<{ date: string; count: number }>;
      responseTrend: Array<{ date: string; responded: number; pending: number }>;
      statusBreakdown: {
        pending: number;
        responded: number;
        contacted: number;
      };
    }> => {
      const response = await this.client.get('/inquiry-analytics/school-stats');
      return response.data.data;
    },

    getVehicleMetrics: async (vehicleId: string): Promise<{
      vehicleId: string;
      brand: string;
      model: string;
      totalInquiries: number;
      repliedInquiries: number;
      responseRate: number;
      averageResponseTime: number;
      lastInquiryDate: string | null;
      inquiryTrend: Array<{ date: string; count: number }>;
    }> => {
      const response = await this.client.get(`/inquiry-analytics/vehicle/${vehicleId}`);
      return response.data.data;
    },

    getStatsByDateRange: async (startDate: string, endDate: string): Promise<{
      totalInquiries: number;
      responded: number;
      pending: number;
      averageResponseTime: number;
      responseRate: number;
    }> => {
      const response = await this.client.get('/inquiry-analytics/date-range', {
        params: { startDate, endDate },
      });
      return response.data.data;
    },

    exportCSV: async (): Promise<Blob> => {
      const response = await this.client.get('/inquiry-analytics/export-csv', {
        responseType: 'blob',
      });
      return response.data;
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

  // Payments API (Manual Activation - No Online Payment)
  payments = {
    // Payment order creation disabled (returns 501)
    createOrder: async (
      plan: 'Silver' | 'Gold' | 'Platinum',
      duration: 'monthly' | 'quarterly' | 'yearly'
    ): Promise<never> => {
      // This will throw with 501 error
      const response = await this.client.post('/payments/create-order', {
        plan,
        duration,
      });
      return response.data.data;
    },

    // Payment verification disabled (returns 501)
    verifyPayment: async (
      orderId: string,
      paymentId: string,
      signature: string,
      plan: 'Silver' | 'Gold' | 'Platinum',
      duration: 'monthly' | 'quarterly' | 'yearly'
    ): Promise<never> => {
      // This will throw with 501 error
      const response = await this.client.post('/payments/verify', {
        orderId,
        paymentId,
        signature,
        plan,
        duration,
      });
      return response.data.data;
    },

    // Get subscription history
    getHistory: async (): Promise<any> => {
      const response = await this.client.get('/payments/history');
      return response.data.data;
    },

    // Get pricing information
    getPricing: async (): Promise<any> => {
      const response = await this.client.get('/payments/pricing');
      return response.data;
    },
  };

  // Subscriptions API
  subscriptions = {
    activate: async (
      instituteId: string,
      plan: 'Silver' | 'Gold' | 'Platinum',
      durationMonths?: number
    ): Promise<Institute> => {
      const response = await this.client.post(`/subscriptions/${instituteId}/activate`, {
        plan,
        durationMonths: durationMonths || 1,
      });
      return response.data.data;
    },

    cancel: async (instituteId: string, reason?: string): Promise<Institute> => {
      const response = await this.client.post(`/subscriptions/${instituteId}/cancel`, { reason });
      return response.data.data;
    },

    extend: async (instituteId: string, additionalMonths: number): Promise<Institute> => {
      const response = await this.client.post(`/subscriptions/${instituteId}/extend`, {
        additionalMonths,
      });
      return response.data.data;
    },

    changePlan: async (instituteId: string, newPlan: 'Silver' | 'Gold' | 'Platinum'): Promise<Institute> => {
      const response = await this.client.post(`/subscriptions/${instituteId}/change-plan`, {
        newPlan,
      });
      return response.data.data;
    },

    getStatus: async (): Promise<{
      subscriptionPlan?: string;
      subscriptionStatus?: string;
      subscriptionStartDate?: string;
      subscriptionEndDate?: string;
      limits: {
        maxVehicles: number;
        listingDuration: number;
        searchBoost: number;
        featuredBadge: boolean;
        homepagePromotion: boolean;
        prioritySupport: boolean;
        customBranding?: boolean;
        dedicatedManager?: boolean;
      };
    }> => {
      const response = await this.client.get('/subscriptions/status');
      return response.data.data;
    },

    getAll: async (filters?: {
      status?: string;
      plan?: string;
    }): Promise<Institute[]> => {
      const response = await this.client.get('/subscriptions/all', { params: filters });
      return response.data.data;
    },
  };

  // Verification API (Manual process - no payment)
  verification = {
    // Verification order creation disabled
    createOrder: async (
      verificationType: 'oneTime' | 'renewal' = 'oneTime'
    ): Promise<VerificationOrder> => {
      const response = await this.client.post('/verification/create-order', {
        verificationType,
      });
      return response.data.data;
    },

    // Verification payment disabled
    verifyPayment: async (
      orderId: string,
      paymentId: string,
      signature: string,
      verificationType: 'oneTime' | 'renewal' = 'oneTime'
    ): Promise<Institute> => {
      const response = await this.client.post('/verification/verify-payment', {
        orderId,
        paymentId,
        signature,
        verificationType,
      });
      return response.data.data;
    },

    getStatus: async (): Promise<VerificationStatus> => {
      const response = await this.client.get('/verification/status');
      return response.data.data;
    },

    uploadDocument: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('document', file);
      const response = await this.client.post('/verification/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.url;
    },
  };

  // Transactions API
  transactions = {
    getTransactions: async (filters?: {
      startDate?: string;
      endDate?: string;
    }): Promise<{
      transactions: any[];
      totalAmount: number;
    }> => {
      const response = await this.client.get('/transactions', { params: filters });
      return response.data.data;
    },

    getTransactionDetails: async (id: string): Promise<any> => {
      const response = await this.client.get(`/transactions/${id}`);
      return response.data.data;
    },

    createTransaction: async (data: any): Promise<any> => {
      const response = await this.client.post('/transactions', data);
      return response.data.data;
    },

    updateTransaction: async (id: string, data: any): Promise<any> => {
      const response = await this.client.put(`/transactions/${id}`, data);
      return response.data.data;
    },

    deleteTransaction: async (id: string): Promise<void> => {
      await this.client.delete(`/transactions/${id}`);
    },
  };

  // Analytics API
  analytics = {
    getDashboard: async (range?: '7d' | '30d' | '90d' | '365d'): Promise<{
      stats: {
        totalInstitutes: number;
        pendingInstitutes: number;
        approvedInstitutes: number;
        rejectedInstitutes: number;
        totalVehicles: number;
        pendingVehicles: number;
        approvedVehicles: number;
        rejectedVehicles: number;
        soldVehicles: number;
        activeVehicles: number;
        totalInquiries: number;
        totalValue: number;
        totalAdViews: number;
        totalAdClicks: number;
      };
      instituteTrends: Array<{ date: string; count: number }>;
      vehicleTrends: Array<{ date: string; count: number }>;
      approvalRates: {
        institutes: {
          total: number;
          approved: number;
          rejected: number;
          pending: number;
          approvalRate: string;
          avgApprovalTime: string;
        };
        vehicles: {
          total: number;
          approved: number;
          rejected: number;
          pending: number;
          approvalRate: string;
          avgApprovalTime: string;
        };
      };
      vehicleTypeDistribution: Array<{ type: string; count: number }>;
      geographicDistribution: Array<{ city: string; count: number }>;
      topInstitutes: Array<{ id: string; name: string; count: number; city: string }>;
      adMetrics: {
        totalRevenue: number;
        promotedVehicles: number;
        totalImpressions: number;
        totalClicks: number;
        ctr: string;
      };
    }> => {
      const response = await this.client.get('/analytics/dashboard', { params: { range } });
      return response.data.data;
    },

    getRevenue: async (filters?: {
      startDate?: string;
      endDate?: string;
    }): Promise<{
      totalRevenue: number;
      vehicles: Array<{
        vehicleId: string;
        brand: string;
        model: string;
        instituteName: string;
        adBudget: number;
        adPlacements: string[];
      }>;
    }> => {
      const response = await this.client.get('/analytics/revenue', { params: filters });
      return response.data.data;
    },
  };
}

// Export singleton instance
export const api = new ApiClient();

// Export individual API namespaces for convenience
export const institutesApi = api.institutes;
export const vehiclesApi = api.vehicles;
export const inquiriesApi = api.inquiries;
export const adTrackingApi = api.adTracking;
export const notificationsApi = api.notifications;

export default api;