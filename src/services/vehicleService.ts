import { apiClient, APIError } from '../lib/apiClient';
import { API_CONFIG } from '../api/config';

export interface Vehicle {
  id?: string;
  _id?: string;
  title: string;
  manufacturer: string;
  model: string;
  year: number;
  type: 'school-bus' | 'minibus' | 'van' | 'truck';
  price: number;
  registrationNumber: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  features: string[];
  images: string[];
  description: string;
  sellerId?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  isPriority?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  insurance?: {
    valid: boolean;
    expiryDate?: string;
    provider?: string;
  };
  fitness?: {
    valid: boolean;
    expiryDate?: string;
  };
  roadTax?: {
    valid: boolean;
    expiryDate?: string;
  };
  permit?: {
    valid: boolean;
    expiryDate?: string;
    type?: string;
  };
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleFilters {
  searchTerm?: string;
  type?: string;
  manufacturer?: string;
  year?: number;
  condition?: string;
  status?: 'pending' | 'approved' | 'rejected';
  isPriority?: boolean;
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

export const vehicleService = {
  /**
   * Get all vehicles with optional filters
   */
  async getVehicles(filters?: VehicleFilters): Promise<PaginatedResponse<Vehicle>> {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const queryString = queryParams.toString();
      const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.VEHICLES}?${queryString}` : API_CONFIG.ENDPOINTS.VEHICLES;
      
      const response = await apiClient.get<PaginatedResponse<Vehicle>>(endpoint);
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch vehicles');
    }
  },

  /**
   * Get single vehicle by ID
   */
  async getVehicle(id: string): Promise<Vehicle> {
    try {
      const response = await apiClient.get<Vehicle>(`${API_CONFIG.ENDPOINTS.VEHICLES}/${id}`);
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch vehicle');
    }
  },

  /**
   * Create new vehicle listing
   */
  async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const response = await apiClient.post<Vehicle>(
        API_CONFIG.ENDPOINTS.VEHICLES,
        vehicleData
      );
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create vehicle');
    }
  },

  /**
   * Update vehicle listing
   */
  async updateVehicle(id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const response = await apiClient.put<Vehicle>(
        `${API_CONFIG.ENDPOINTS.VEHICLES}/${id}`,
        vehicleData
      );
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update vehicle');
    }
  },

  /**
   * Delete vehicle listing
   */
  async deleteVehicle(id: string): Promise<void> {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.VEHICLES}/${id}`);
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to delete vehicle');
    }
  },

  /**
   * Get priority listings
   */
  async getPriorityListings(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<Vehicle[]>(`${API_CONFIG.ENDPOINTS.VEHICLES}/priority`);
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch priority listings');
    }
  },

  /**
   * Get recent listings
   */
  async getRecentListings(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<Vehicle[]>(`${API_CONFIG.ENDPOINTS.VEHICLES}/recent`);
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch recent listings');
    }
  },

  /**
   * Get my listings (requires authentication)
   */
  async getMyListings(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<Vehicle[]>(`${API_CONFIG.ENDPOINTS.VEHICLES}/my/listings`);
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch your listings');
    }
  },

  /**
   * Upload vehicle images
   */
  async uploadImages(files: File[]): Promise<{ urls: string[] }> {
    try {
      const response = await apiClient.uploadFiles(
        '/upload/multiple',
        files,
        'images'
      );
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to upload images');
    }
  },
};
