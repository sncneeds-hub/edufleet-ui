import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '../types';

/**
 * Job Service
 * Handles all job-related API operations
 */

// Job types
export interface Job {
  id: string;
  title: string;
  institute: string;
  instituteName?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  department?: string;
  experience: string;
  salary: string | { min?: number; max?: number };
  description: string;
  requirements: string[];
  benefits?: string[];
  postedDate: string;
  postedAt?: string;
  deadline?: string;
  status?: 'open' | 'closed';
  isPriority?: boolean;
}

export interface JobFilters {
  searchTerm?: string;
  type?: string;
  department?: string;
  location?: string;
  status?: 'open' | 'closed';
  page?: number;
  pageSize?: number;
}

/**
 * Get all jobs with optional filters
 */
export async function getJobs(
  filters?: JobFilters
): Promise<ApiResponse<PaginatedResponse<Job>>> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
    
    const data = await apiClient.get<PaginatedResponse<Job>>(endpoint, { requiresAuth: false });
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch jobs',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get single job by ID
 */
export async function getJobById(id: string): Promise<ApiResponse<Job>> {
  try {
    const job = await apiClient.get<Job>(`/jobs/${id}`, { requiresAuth: false });

    return {
      success: true,
      data: job,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch job',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get featured/recent jobs
 */
export async function getFeaturedJobs(limit = 4): Promise<ApiResponse<Job[]>> {
  try {
    const jobs = await apiClient.get<Job[]>(`/jobs/featured?limit=${limit}`, { requiresAuth: false });

    return {
      success: true,
      data: jobs,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch featured jobs',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Create a new job
 */
export async function createJob(data: any): Promise<ApiResponse<Job>> {
  try {
    const job = await apiClient.post<Job>('/jobs', data);
    return {
      success: true,
      data: job,
      message: 'Job created successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to create job',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update a job
 */
export async function updateJob(id: string, data: any): Promise<ApiResponse<Job>> {
  try {
    const job = await apiClient.put<Job>(`/jobs/${id}`, data);
    return {
      success: true,
      data: job,
      message: 'Job updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to update job',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Delete a job
 */
export async function deleteJob(id: string): Promise<ApiResponse<void>> {
  try {
    await apiClient.delete(`/jobs/${id}`);
    return {
      success: true,
      message: 'Job deleted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to delete job',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Apply to a job
 */
export async function applyToJob(id: string, data?: any): Promise<ApiResponse<any>> {
  try {
    const result = await apiClient.post<any>(`/jobs/${id}/apply`, data || {});
    return {
      success: true,
      data: result,
      message: 'Applied to job successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to apply to job',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get my jobs (for institutes)
 */
export async function getMyJobs(): Promise<ApiResponse<Job[]>> {
  try {
    const jobs = await apiClient.get<Job[]>('/jobs/my/listings');
    return {
      success: true,
      data: jobs,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch my jobs',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get my applications (for teachers)
 */
export async function getMyApplications(): Promise<ApiResponse<any[]>> {
  try {
    const applications = await apiClient.get<any[]>('/jobs/applications/my');
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch my applications',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get job applications (for institutes)
 */
export async function getApplications(params?: { jobId?: string }): Promise<ApiResponse<any[]>> {
  try {
    const queryString = params?.jobId ? `?jobId=${params.jobId}` : '';
    const applications = await apiClient.get<any[]>(`/jobs/applications/list${queryString}`, { requiresAuth: true });
    
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch applications',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string, 
  data: { status?: string; interviewScheduled?: any }
): Promise<ApiResponse<any>> {
  try {
    const result = await apiClient.put<any>(`/jobs/applications/${applicationId}/status`, data);
    
    return {
      success: true,
      data: result,
      message: 'Application status updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to update application status',
      timestamp: new Date().toISOString(),
    };
  }
}

// Default export for convenience
export const jobService = {
  getAllJobs: getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getMyJobs,
  getMyApplications,
  getJobApplications: getApplications,
  updateApplicationStatus,
};
