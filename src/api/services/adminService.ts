import { simulateDelay } from '../config';
import { MockDatabase } from '../mockData';
import { ApiResponse, VehicleStats, Vehicle, ApprovalRequest, PriorityToggleRequest } from '../types';

const db = MockDatabase.getInstance();

export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<VehicleStats>> {
    await simulateDelay();

    try {
      const allVehicles = db.getAllVehicles();

      const stats: VehicleStats = {
        total: allVehicles.length,
        pending: allVehicles.filter(v => v.status === 'pending').length,
        approved: allVehicles.filter(v => v.status === 'approved').length,
        rejected: allVehicles.filter(v => v.status === 'rejected').length,
        priorityListings: allVehicles.filter(v => v.isPriority).length,
      };

      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw {
        success: false,
        error: 'Failed to fetch statistics',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all pending approvals
   */
  async getPendingApprovals(): Promise<ApiResponse<Vehicle[]>> {
    await simulateDelay();

    try {
      const pendingVehicles = db.getVehiclesByFilter({ status: 'pending' });

      return {
        success: true,
        data: pendingVehicles,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw {
        success: false,
        error: 'Failed to fetch pending approvals',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Approve or reject a vehicle
   */
  async updateApprovalStatus(request: ApprovalRequest): Promise<ApiResponse<Vehicle>> {
    await simulateDelay();

    try {
      const { vehicleId, status } = request;

      let updatedVehicle: Vehicle | null;

      if (status === 'approved') {
        updatedVehicle = db.approveVehicle(vehicleId);
      } else {
        updatedVehicle = db.rejectVehicle(vehicleId);
      }

      if (!updatedVehicle) {
        throw new Error('Vehicle not found');
      }

      return {
        success: true,
        data: updatedVehicle,
        message: `Vehicle ${status} successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update approval status',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Toggle priority status
   */
  async togglePriority(request: PriorityToggleRequest): Promise<ApiResponse<Vehicle>> {
    await simulateDelay();

    try {
      const { vehicleId, isPriority } = request;

      const updatedVehicle = db.togglePriority(vehicleId, isPriority);

      if (!updatedVehicle) {
        throw new Error('Vehicle not found');
      }

      return {
        success: true,
        data: updatedVehicle,
        message: `Priority ${isPriority ? 'enabled' : 'disabled'} successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle priority',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all vehicles (admin view)
   */
  async getAllVehicles(): Promise<ApiResponse<Vehicle[]>> {
    await simulateDelay();

    try {
      const allVehicles = db.getAllVehicles();

      return {
        success: true,
        data: allVehicles,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw {
        success: false,
        error: 'Failed to fetch vehicles',
        timestamp: new Date().toISOString(),
      };
    }
  },
};
