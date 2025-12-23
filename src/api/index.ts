/**
 * Main API Export
 * 
 * This is the central API layer for the EduFleet Exchange application.
 * All API calls go through this layer, which provides mock backend functionality.
 * 
 * Usage:
 * import { api } from '@/api';
 * const vehicles = await api.vehicles.getVehicles();
 */

export * from './types';
export * from './config';

import { vehicleService } from './services/vehicleService';
import { adminService } from './services/adminService';
import * as jobService from './services/jobService';
import * as teacherService from './services/teacherService';
import * as supplierService from './services/supplierService';

/**
 * Main API object
 * Organized by resource/domain
 */
export const api = {
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

/**
 * API Client - For future real backend integration
 * 
 * When ready to connect to a real backend:
 * 1. Replace mock services with HTTP client calls (axios/fetch)
 * 2. Update API_CONFIG.BASE_URL in config.ts
 * 3. Add error handling and retry logic
 * 4. Add authentication token management
 * 5. Set MOCK_MODE to false in config.ts
 */
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}
