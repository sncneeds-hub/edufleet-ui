import api from '../lib/api';
import { Vehicle } from './vehicleService';

export interface DashboardStats {
  vehicles: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    priority: number;
  };
  users: number;
  jobs: number;
  suppliers: number;
}

export const adminService = {
  // Get dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get('/admin/stats');
    return data.data;
  },

  // Get pending vehicles
  async getPendingVehicles(): Promise<Vehicle[]> {
    const { data } = await api.get('/admin/pending');
    return data.data;
  },

  // Approve/reject vehicle
  async approveVehicle(
    id: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<Vehicle> {
    const { data } = await api.put(`/admin/approve/${id}`, { status, reason });
    return data.data;
  },

  // Toggle priority
  async togglePriority(id: string, isPriority: boolean): Promise<Vehicle> {
    const { data } = await api.put(`/admin/priority/${id}`, { isPriority });
    return data.data;
  },

  // Get all users
  async getAllUsers(): Promise<any[]> {
    const { data } = await api.get('/admin/users');
    return data.data;
  },

  // Update user status
  async updateUserStatus(id: string, isActive: boolean): Promise<any> {
    const { data } = await api.put(`/admin/users/${id}/status`, { isActive });
    return data.data;
  },
};
