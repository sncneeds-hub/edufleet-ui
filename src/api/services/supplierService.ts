import { mockSuppliers } from '@/mock/supplierData';
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

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all suppliers with optional filters
 */
export async function getSuppliers(
  filters?: SupplierFilters
): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
  await delay(300);

  let filtered = [...mockSuppliers];

  // Apply filters
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      s =>
        s.name.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.services.some(service => service.toLowerCase().includes(term))
    );
  }

  if (filters?.category) {
    filtered = filtered.filter(s => s.category === filters.category);
  }

  if (filters?.isVerified !== undefined) {
    filtered = filtered.filter(s => s.isVerified === filters.isVerified);
  }

  if (filters?.status) {
    filtered = filtered.filter(s => s.status === filters.status);
  }

  // Pagination
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      items: paginatedItems,
      total: filtered.length,
      page,
      pageSize,
      hasMore: endIndex < filtered.length
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Get single supplier by ID
 */
export async function getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
  await delay(200);

  const supplier = mockSuppliers.find(s => s.id === id);

  if (!supplier) {
    throw new Error('Supplier not found');
  }

  return {
    success: true,
    data: supplier,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create new supplier (admin only)
 */
export async function createSupplier(
  data: CreateSupplierDto
): Promise<ApiResponse<Supplier>> {
  await delay(500);

  const newSupplier: Supplier = {
    ...data,
    id: `sup-${Date.now()}`,
    isVerified: false,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // In a real app, this would save to backend
  mockSuppliers.push(newSupplier);

  return {
    success: true,
    data: newSupplier,
    message: 'Supplier created successfully',
    timestamp: new Date().toISOString()
  };
}

/**
 * Update supplier (admin only)
 */
export async function updateSupplier(
  data: UpdateSupplierDto
): Promise<ApiResponse<Supplier>> {
  await delay(400);

  const index = mockSuppliers.findIndex(s => s.id === data.id);

  if (index === -1) {
    throw new Error('Supplier not found');
  }

  const updatedSupplier: Supplier = {
    ...mockSuppliers[index],
    ...data,
    updatedAt: new Date().toISOString()
  };

  // In a real app, this would update backend
  mockSuppliers[index] = updatedSupplier;

  return {
    success: true,
    data: updatedSupplier,
    message: 'Supplier updated successfully',
    timestamp: new Date().toISOString()
  };
}

/**
 * Delete supplier (admin only)
 */
export async function deleteSupplier(id: string): Promise<ApiResponse<void>> {
  await delay(300);

  const index = mockSuppliers.findIndex(s => s.id === id);

  if (index === -1) {
    throw new Error('Supplier not found');
  }

  // In a real app, this would delete from backend
  mockSuppliers.splice(index, 1);

  return {
    success: true,
    data: undefined,
    message: 'Supplier deleted successfully',
    timestamp: new Date().toISOString()
  };
}

/**
 * Approve supplier (admin only)
 */
export async function approveSupplier(id: string): Promise<ApiResponse<Supplier>> {
  await delay(300);

  const index = mockSuppliers.findIndex(s => s.id === id);

  if (index === -1) {
    throw new Error('Supplier not found');
  }

  mockSuppliers[index] = {
    ...mockSuppliers[index],
    status: 'approved',
    updatedAt: new Date().toISOString()
  };

  return {
    success: true,
    data: mockSuppliers[index],
    message: 'Supplier approved successfully',
    timestamp: new Date().toISOString()
  };
}

/**
 * Reject supplier (admin only)
 */
export async function rejectSupplier(id: string): Promise<ApiResponse<Supplier>> {
  await delay(300);

  const index = mockSuppliers.findIndex(s => s.id === id);

  if (index === -1) {
    throw new Error('Supplier not found');
  }

  mockSuppliers[index] = {
    ...mockSuppliers[index],
    status: 'rejected',
    updatedAt: new Date().toISOString()
  };

  return {
    success: true,
    data: mockSuppliers[index],
    message: 'Supplier rejected',
    timestamp: new Date().toISOString()
  };
}

/**
 * Toggle supplier verification (admin only)
 */
export async function toggleVerification(id: string): Promise<ApiResponse<Supplier>> {
  await delay(300);

  const index = mockSuppliers.findIndex(s => s.id === id);

  if (index === -1) {
    throw new Error('Supplier not found');
  }

  mockSuppliers[index] = {
    ...mockSuppliers[index],
    isVerified: !mockSuppliers[index].isVerified,
    updatedAt: new Date().toISOString()
  };

  return {
    success: true,
    data: mockSuppliers[index],
    message: `Supplier ${mockSuppliers[index].isVerified ? 'verified' : 'unverified'}`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get supplier statistics (admin only)
 */
export async function getSupplierStats(): Promise<ApiResponse<SupplierStats>> {
  await delay(200);

  const stats: SupplierStats = {
    total: mockSuppliers.length,
    pending: mockSuppliers.filter(s => s.status === 'pending').length,
    approved: mockSuppliers.filter(s => s.status === 'approved').length,
    rejected: mockSuppliers.filter(s => s.status === 'rejected').length,
    verified: mockSuppliers.filter(s => s.isVerified).length
  };

  return {
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  };
}
