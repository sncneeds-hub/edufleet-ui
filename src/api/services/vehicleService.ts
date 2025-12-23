import { apiClient } from '@/lib/apiClient';
import {
  ApiResponse,
  Vehicle,
  VehicleFilters,
  CreateVehicleDto,
  UpdateVehicleDto,
  PaginatedResponse,
  UploadImageResponse,
} from '../types';

export const vehicleService = {
  /**
   * Get all vehicles with optional filters
   */
  async getVehicles(filters?: VehicleFilters): Promise<ApiResponse<PaginatedResponse<Vehicle>>> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.manufacturer) params.append('manufacturer', filters.manufacturer);
      if (filters?.condition) params.append('condition', filters.condition);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.minYear) params.append('minYear', filters.minYear.toString());
      if (filters?.maxYear) params.append('maxYear', filters.maxYear.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sellerId) params.append('sellerId', filters.sellerId);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/vehicles?${queryString}` : '/vehicles';
      
      const data = await apiClient.get<PaginatedResponse<Vehicle>>(endpoint, { requiresAuth: false });
      
      return {
        success: true,
        data,
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
   * Get vehicle by ID
   */
  async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    try {
      const vehicle = await apiClient.get<Vehicle>(`/vehicles/${id}`, { requiresAuth: false });

      return {
        success: true,
        data: vehicle,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch vehicle',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get priority listings
   */
  async getPriorityListings(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const vehicles = await apiClient.get<Vehicle[]>('/vehicles/priority', { requiresAuth: false });

      return {
        success: true,
        data: vehicles,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch priority listings',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get recent listings
   */
  async getRecentListings(limit = 3): Promise<ApiResponse<Vehicle[]>> {
    try {
      const vehicles = await apiClient.get<Vehicle[]>(`/vehicles/recent?limit=${limit}`, { requiresAuth: false });

      return {
        success: true,
        data: vehicles,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch recent listings',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get listings by seller ID
   */
  async getMyListings(sellerId: string): Promise<ApiResponse<Vehicle[]>> {
    try {
      const vehicles = await apiClient.get<Vehicle[]>(`/vehicles/my/listings`, { requiresAuth: true });

      return {
        success: true,
        data: vehicles,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch your listings',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Create new vehicle listing
   */
  async createVehicle(vehicleData: CreateVehicleDto, sellerId: string): Promise<ApiResponse<Vehicle>> {
    try {
      const vehicle = await apiClient.post<Vehicle>('/vehicles', { ...vehicleData, sellerId });

      return {
        success: true,
        data: vehicle,
        message: 'Vehicle listing created successfully. Pending admin approval.',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to create vehicle listing',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Update vehicle listing
   */
  async updateVehicle(updates: UpdateVehicleDto): Promise<ApiResponse<Vehicle>> {
    try {
      const { id, ...data } = updates;
      const vehicle = await apiClient.put<Vehicle>(`/vehicles/${id}`, data);

      return {
        success: true,
        data: vehicle,
        message: 'Vehicle listing updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update vehicle',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Delete vehicle listing
   */
  async deleteVehicle(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      await apiClient.delete(`/vehicles/${id}`);

      return {
        success: true,
        data: { deleted: true },
        message: 'Vehicle listing deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to delete vehicle',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get vehicle views count
   */
  async getVehicleViews(id: string): Promise<ApiResponse<{ views: number }>> {
    try {
      const data = await apiClient.get<{ views: number }>(`/vehicles/${id}/views`, { requiresAuth: false });

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch vehicle views',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Upload vehicle images
   */
  async uploadVehicleImages(files: File[]): Promise<ApiResponse<UploadImageResponse[]>> {
    try {
      // Validate files client-side
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      for (const file of files) {
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} exceeds 5MB limit`);
        }
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} has invalid type. Only JPEG, PNG, and WebP allowed.`);
        }
      }

      // Upload to backend
      const response = await apiClient.uploadFiles('/upload/multiple', files, 'images');

      return {
        success: true,
        data: response.urls.map((url, index) => ({
          url,
          filename: files[index].name,
          size: files[index].size,
        })),
        message: `${files.length} image(s) uploaded successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to upload images',
        timestamp: new Date().toISOString(),
      };
    }
  },
};
