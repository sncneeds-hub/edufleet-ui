import { API_CONFIG, simulateDelay } from '../api/config';
import { mockVehicles } from '../mock/vehicleData';
import { mockJobs } from '../mock/jobData';
import { mockSuppliers } from '../mock/supplierData';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export const mockApiClient = {
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true } = options;

    await simulateDelay();

    if (requiresAuth) {
      const token = getAuthToken();
      if (!token) {
        throw new APIError(401, 'Unauthorized', 'AUTH_REQUIRED');
      }
    }

    if (endpoint.startsWith('/vehicles')) {
      return this.handleVehicleEndpoint<T>(endpoint, options);
    } else if (endpoint.startsWith('/jobs')) {
      return this.handleJobEndpoint<T>(endpoint, options);
    } else if (endpoint.startsWith('/suppliers')) {
      return this.handleSupplierEndpoint<T>(endpoint, options);
    } else if (endpoint.startsWith('/admin')) {
      return this.handleAdminEndpoint<T>(endpoint, options);
    }

    throw new APIError(404, 'Endpoint not found', 'NOT_FOUND');
  },

  handleVehicleEndpoint<T>(endpoint: string, options: RequestOptions): T {
    const method = options.method || 'GET';

    if (method === 'GET') {
      if (endpoint === '/vehicles' || endpoint.startsWith('/vehicles?')) {
        const items = mockVehicles;
        return {
          items,
          total: items.length,
          hasMore: false,
          page: 1,
          pageSize: 12,
        } as T;
      } else if (endpoint === '/vehicles/priority') {
        const priority = mockVehicles.filter(v => v.isPriority);
        return priority as T;
      } else if (endpoint.startsWith('/vehicles/recent')) {
        const limit = endpoint.includes('limit=') ? parseInt(endpoint.split('limit=')[1]) : 3;
        const recent = mockVehicles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
        return recent as T;
      } else if (endpoint.match(/^\/vehicles\/[\w-]+$/)) {
        const id = endpoint.split('/').pop();
        const vehicle = mockVehicles.find(v => v.id === id);
        if (!vehicle) {
          throw new APIError(404, 'Vehicle not found', 'NOT_FOUND');
        }
        return vehicle as T;
      }
    }

    return { data: [] } as T;
  },

  handleJobEndpoint<T>(endpoint: string, options: RequestOptions): T {
    const method = options.method || 'GET';

    if (method === 'GET') {
      if (endpoint === '/jobs' || endpoint.startsWith('/jobs?')) {
        const items = mockJobs;
        return {
          items,
          total: items.length,
          hasMore: false,
        } as T;
      } else if (endpoint.match(/^\/jobs\/[\w-]+$/)) {
        const id = endpoint.split('/').pop();
        const job = mockJobs.find(j => j.id === id);
        if (!job) {
          throw new APIError(404, 'Job not found', 'NOT_FOUND');
        }
        return job as T;
      }
    }

    return { data: [] } as T;
  },

  handleSupplierEndpoint<T>(endpoint: string, options: RequestOptions): T {
    const method = options.method || 'GET';

    if (method === 'GET') {
      if (endpoint === '/suppliers' || endpoint.startsWith('/suppliers?')) {
        const items = mockSuppliers;
        return {
          items,
          total: items.length,
          hasMore: false,
        } as T;
      } else if (endpoint.match(/^\/suppliers\/[\w-]+$/)) {
        const id = endpoint.split('/').pop();
        const supplier = mockSuppliers.find(s => s.id === id);
        if (!supplier) {
          throw new APIError(404, 'Supplier not found', 'NOT_FOUND');
        }
        return supplier as T;
      }
    }

    return { data: [] } as T;
  },

  handleAdminEndpoint<T>(endpoint: string, options: RequestOptions): T {
    const method = options.method || 'GET';

    if (endpoint === '/admin/stats') {
      const pending = mockVehicles.filter(v => v.status === 'pending').length;
      const approved = mockVehicles.filter(v => v.status === 'approved').length;
      const rejected = mockVehicles.filter(v => v.status === 'rejected').length;
      const priorityListings = mockVehicles.filter(v => v.isPriority).length;

      return {
        total: mockVehicles.length,
        pending,
        approved,
        rejected,
        priorityListings,
      } as T;
    } else if (endpoint === '/admin/pending') {
      const pending = mockVehicles.filter(v => v.status === 'pending');
      return pending as T;
    }

    return { data: {} } as T;
  },

  async uploadFile(endpoint: string, file: File, fieldName = 'image'): Promise<{ url: string }> {
    await simulateDelay();
    return {
      url: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
    };
  },

  async uploadFiles(endpoint: string, files: File[], fieldName = 'images'): Promise<{ urls: string[] }> {
    await simulateDelay();
    return {
      urls: files.map(() => 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800'),
    };
  },
};
