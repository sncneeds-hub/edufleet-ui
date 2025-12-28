import { apiClient } from '@/lib/apiClient';
import { ApiResponse, Vehicle, ApprovalRequest, PriorityToggleRequest } from '../types';

interface VehicleStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  priority: number;
}

interface AdminDashboardStats {
  vehicles: VehicleStats;
  users: number;
  jobs: number;
  suppliers: number;
}

export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<AdminDashboardStats>> {
    try {
      const data = await apiClient.get<AdminDashboardStats>('/admin/stats', { requiresAuth: true });

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch statistics',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all pending approvals
   */
  async getPendingApprovals(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const vehicles = await apiClient.get<Vehicle[]>('/admin/pending', { requiresAuth: true });

      return {
        success: true,
        data: vehicles,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch pending approvals',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Approve or reject a vehicle
   */
  async updateApprovalStatus(request: ApprovalRequest): Promise<ApiResponse<Vehicle>> {
    try {
      const { vehicleId, status, reason } = request;

      const vehicle = await apiClient.put<Vehicle>(`/admin/approve/${vehicleId}`, { 
        status,
        reason 
      }, { requiresAuth: true });

      return {
        success: true,
        data: vehicle,
        message: `Vehicle ${status} successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update approval status',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Toggle priority status
   */
  async togglePriority(request: PriorityToggleRequest): Promise<ApiResponse<Vehicle>> {
    try {
      const { vehicleId, isPriority } = request;

      const vehicle = await apiClient.put<Vehicle>(`/admin/priority/${vehicleId}`, { 
        isPriority 
      }, { requiresAuth: true });

      return {
        success: true,
        data: vehicle,
        message: `Priority ${isPriority ? 'enabled' : 'disabled'} successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to toggle priority',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all vehicles (admin view)
   */
  async getAllVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const vehicles = await apiClient.get<Vehicle[]>('/vehicles?status=all', { requiresAuth: true });

      return {
        success: true,
        data: vehicles,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch vehicles',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all users
   */
  async getAllUsers(): Promise<ApiResponse<any[]>> {
    try {
      const users = await apiClient.get<any[]>('/admin/users', { requiresAuth: true });

      return {
        success: true,
        data: users,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch users',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Update user status and subscription
   */
  async updateUserStatus(userId: string, data: { isActive?: boolean; planId?: string; notes?: string }): Promise<ApiResponse<any>> {
    try {
      const user = await apiClient.put<any>(`/admin/users/${userId}/status`, data, { requiresAuth: true });

      return {
        success: true,
        data: user,
        message: `User updated successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update user',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Approve/Reject supplier with optional plan update
   */
  async approveSupplierStatus(supplierId: string, data: { status: 'approved' | 'rejected'; planId?: string; notes?: string }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<any>(`/admin/suppliers/${supplierId}/approve`, data, { requiresAuth: true });

      return {
        success: true,
        data: response,
        message: `Supplier ${data.status} successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update supplier status',
        timestamp: new Date().toISOString(),
      };
    }
  },
};
