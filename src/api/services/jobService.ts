import { mockJobs } from '@/mock/jobData';
import type { ApiResponse, PaginatedResponse } from '../types';

/**
 * Job Service
 * Handles all job-related API operations
 */

// Job types (matching mock data structure)
export interface Job {
  id: string;
  title: string;
  institute: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  department?: string; // Added department to Job interface
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  postedDate: string;
  deadline?: string;
  status?: 'open' | 'closed';
}

export interface JobFilters {
  searchTerm?: string;
  type?: string;
  department?: string; // Added department to JobFilters interface
  location?: string;
  status?: 'open' | 'closed';
  page?: number;
  pageSize?: number;
}

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all jobs with optional filters
 */
export async function getJobs(
  filters?: JobFilters
): Promise<ApiResponse<PaginatedResponse<Job>>> {
  await delay(300);

  let filtered = [...mockJobs];

  // Apply filters
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      j =>
        j.title.toLowerCase().includes(term) ||
        j.institute.toLowerCase().includes(term) ||
        j.location.toLowerCase().includes(term) ||
        j.description.toLowerCase().includes(term)
    );
  }

  if (filters?.type) {
    filtered = filtered.filter(j => j.type === filters.type);
  }

  if (filters?.department) { // Implemented filtering logic for department
    filtered = filtered.filter(j => j.department === filters.department);
  }

  if (filters?.location) {
    filtered = filtered.filter(j => 
      j.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  if (filters?.status) {
    filtered = filtered.filter(j => j.status === filters.status);
  }

  // Pagination
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 12;
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
 * Get single job by ID
 */
export async function getJobById(id: string): Promise<ApiResponse<Job>> {
  await delay(200);

  const job = mockJobs.find(j => j.id === id);

  if (!job) {
    throw new Error('Job not found');
  }

  return {
    success: true,
    data: job,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get featured/recent jobs
 */
export async function getFeaturedJobs(limit = 4): Promise<ApiResponse<Job[]>> {
  await delay(200);

  const featured = mockJobs.slice(0, limit);

  return {
    success: true,
    data: featured,
    timestamp: new Date().toISOString()
  };
}