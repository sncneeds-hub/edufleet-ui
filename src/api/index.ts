/**
 * Main API Export
 * 
 * This is the central API layer for the EduFleet Exchange application.
 * All API calls go through this layer and connect to the backend.
 * 
 * Usage:
 * import { api } from '@/api';
 * const vehicles = await api.vehicles.getVehicles();
 */

export * from './types';
export * from './config';

import { vehicleService } from './services/vehicleService';
import { adminService } from './services/adminService';
import { authService } from './services/authService';
import * as jobService from './services/jobService';
import * as teacherService from './services/teacherService';
import * as supplierService from './services/supplierService';

/**
 * Main API object
 * Organized by resource/domain
 */
export const api = {
  /**
   * Auth-related API calls
   */
  auth: authService,

  /**
   * Vehicle-related API calls
   */
  vehicles: vehicleService,

  /**
   * Admin-related API calls
   */
  admin: adminService,

  /**
   * Job-related API calls
   */
  jobs: jobService,

  /**
   * Teacher-related API calls
   */
  teachers: teacherService,

  /**
   * Supplier-related API calls
   */
  suppliers: supplierService,
};
