import api from '../lib/api';

export interface Supplier {
  id?: string;
  _id?: string;
  name: string;
  category: 'maintenance' | 'parts' | 'fuel' | 'insurance' | 'leasing' | 'other';
  description: string;
  services: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  website?: string;
  rating?: number;
  reviews?: number;
  isVerified?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierFilters {
  searchTerm?: string;
  category?: string;
  isVerified?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
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

export interface SupplierStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  verified: number;
}

export const supplierService = {
  /**
   * Get all suppliers with optional filters
   */
  async getSuppliers(filters?: SupplierFilters): Promise<PaginatedResponse<Supplier>> {
    const { data } = await api.get('/suppliers', { params: filters });
    return data.data;
  },

  /**
   * Get single supplier by ID
   */
  async getSupplier(id: string): Promise<Supplier> {
    const { data } = await api.get(`/suppliers/${id}`);
    return data.data;
  },

  /**
   * Create new supplier (admin only)
   */
  async createSupplier(supplierData: Partial<Supplier>): Promise<Supplier> {
    const { data } = await api.post('/suppliers', supplierData);
    return data.data;
  },

  /**
   * Update supplier (admin only)
   */
  async updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<Supplier> {
    const { data } = await api.put(`/suppliers/${id}`, supplierData);
    return data.data;
  },

  /**
   * Delete supplier (admin only)
   */
  async deleteSupplier(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },

  /**
   * Approve supplier (admin only)
   */
  async approveSupplier(id: string): Promise<Supplier> {
    const { data } = await api.put(`/suppliers/${id}/approve`);
    return data.data;
  },

  /**
   * Reject supplier (admin only)
   */
  async rejectSupplier(id: string): Promise<Supplier> {
    const { data } = await api.put(`/suppliers/${id}/reject`);
    return data.data;
  },

  /**
   * Toggle supplier verification (admin only)
   */
  async toggleVerification(id: string): Promise<Supplier> {
    const { data } = await api.put(`/suppliers/${id}/verify/toggle`);
    return data.data;
  },

  /**
   * Get supplier statistics (admin only)
   */
  async getSupplierStats(): Promise<SupplierStats> {
    const { data } = await api.get('/suppliers/stats');
    return data.data;
  },

  /**
   * Search suppliers by category
   */
  async searchByCategory(category: string): Promise<Supplier[]> {
    const { data } = await api.get('/suppliers/search/category', { params: { category } });
    return data.data;
  },

  /**
   * Get verified suppliers only
   */
  async getVerifiedSuppliers(): Promise<Supplier[]> {
    const { data } = await api.get('/suppliers/verified');
    return data.data;
  },
};
