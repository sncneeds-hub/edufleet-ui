import { apiClient } from '@/lib/apiClient';
import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFilters,
  SupplierStats,
  ApiResponse,
  PaginatedResponse
} from '../types';

/**
 * Supplier Service
 * Handles all supplier-related API operations
 */

/**
 * Get all suppliers with optional filters
 */
export async function getSuppliers(
  filters?: SupplierFilters
): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isVerified !== undefined) params.append('isVerified', filters.isVerified.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/suppliers?${queryString}` : '/suppliers';
    
    const data = await apiClient.get<PaginatedResponse<Supplier>>(endpoint, { requiresAuth: false });
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch suppliers',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get single supplier by ID
 */
export async function getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
  try {
    const supplier = await apiClient.get<Supplier>(`/suppliers/${id}`, { requiresAuth: false });

    return {
      success: true,
      data: supplier,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch supplier',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Create new supplier
 */
export async function createSupplier(
  data: CreateSupplierDto
): Promise<ApiResponse<Supplier>> {
  try {
    const supplier = await apiClient.post<Supplier>('/suppliers', data);

    return {
      success: true,
      data: supplier,
      message: 'Supplier created successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to create supplier',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update supplier
 */
export async function updateSupplier(
  data: UpdateSupplierDto
): Promise<ApiResponse<Supplier>> {
  try {
    const { id, ...updateData } = data;
    const supplier = await apiClient.put<Supplier>(`/suppliers/${id}`, updateData);

    return {
      success: true,
      data: supplier,
      message: 'Supplier updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to update supplier',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Delete supplier
 */
export async function deleteSupplier(id: string): Promise<ApiResponse<void>> {
  try {
    await apiClient.delete(`/suppliers/${id}`);

    return {
      success: true,
      data: undefined,
      message: 'Supplier deleted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to delete supplier',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Approve supplier (admin only - to be implemented on backend)
 */
export async function approveSupplier(id: string): Promise<ApiResponse<Supplier>> {
  try {
    const supplier = await apiClient.put<Supplier>(`/suppliers/${id}`, { status: 'approved' });

    return {
      success: true,
      data: supplier,
      message: 'Supplier approved successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to approve supplier',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Reject supplier (admin only - to be implemented on backend)
 */
export async function rejectSupplier(id: string): Promise<ApiResponse<Supplier>> {
  try {
    const supplier = await apiClient.put<Supplier>(`/suppliers/${id}`, { status: 'rejected' });

    return {
      success: true,
      data: supplier,
      message: 'Supplier rejected',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to reject supplier',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Toggle supplier verification (admin only - to be implemented on backend)
 */
export async function toggleVerification(id: string): Promise<ApiResponse<Supplier>> {
  try {
    const supplier = await apiClient.put<Supplier>(`/suppliers/${id}/toggle-verification`, {});

    return {
      success: true,
      data: supplier,
      message: `Supplier ${supplier.isVerified ? 'verified' : 'unverified'}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to toggle verification',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get supplier statistics (admin only - to be implemented on backend)
 */
export async function getSupplierStats(): Promise<ApiResponse<SupplierStats>> {
  try {
    const stats = await apiClient.get<SupplierStats>('/suppliers/stats', { requiresAuth: true });

    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch supplier stats',
      timestamp: new Date().toISOString(),
    };
  }
}
