import { apiClient, APIError } from '@/lib/apiClient';
import { API_CONFIG } from '../config';
import type { ApiResponse, PaginatedResponse } from '../types';

/**
 * Teacher Service
 * Handles all teacher-related API operations
 */

// Teacher types
export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  qualifications: string[];
  subjects: string[];
  bio: string;
  resume?: string;
  avatar: string;
  isAvailable: boolean;
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  preferredJobType?: string[];
  createdAt?: string;
  status?: 'active' | 'inactive';
}

export interface Application {
  id: string;
  teacherId: string;
  jobId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedDate: string;
  coverLetter?: string;
}

export interface TeacherFilters {
  searchTerm?: string;
  subjects?: string[];
  location?: string;
  experienceMin?: number;
  experienceMax?: number;
  isAvailable?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Get all teachers with optional filters
 */
export async function getTeachers(
  filters?: TeacherFilters
): Promise<ApiResponse<PaginatedResponse<Teacher>>> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('role', 'teacher'); // Filter users by teacher role
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/users?${queryString}`; // Teachers are users with role='teacher'
    
    const data = await apiClient.get<PaginatedResponse<Teacher>>(endpoint, { requiresAuth: false });
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch teachers');
  }
}

/**
 * Get single teacher by ID
 */
export async function getTeacherById(id: string): Promise<ApiResponse<Teacher | null>> {
  try {
    const teacher = await apiClient.get<Teacher>(`/users/${id}`, { requiresAuth: false });
    
    return {
      success: true,
      data: teacher,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch teacher');
  }
}

/**
 * Get applications for a specific teacher
 */
export async function getApplicationsForTeacher(
  teacherId: string
): Promise<ApiResponse<Application[]>> {
  try {
    const applications = await apiClient.get<Application[]>(API_CONFIG.ENDPOINTS.MY_JOB_APPLICATIONS);
    
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch applications');
  }
}

/**
 * Get interviews for a specific teacher
 */
export async function getInterviewsForTeacher(
  teacherId: string
): Promise<ApiResponse<any[]>> {
  try {
    // Interviews are not yet implemented in backend
    // Return applications with 'shortlisted' status as interviews
    const applications = await apiClient.get<Application[]>(
      `${API_CONFIG.ENDPOINTS.MY_JOB_APPLICATIONS}?status=shortlisted`
    );
    
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch interviews');
  }
}

/**
 * Get applications for a specific job
 */
export async function getApplicationsForJob(
  jobId: string
): Promise<ApiResponse<Application[]>> {
  try {
    const applications = await apiClient.get<Application[]>(API_CONFIG.ENDPOINTS.JOB_APPLICATIONS(jobId));
    
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch applications');
  }
}

/**
 * Get all applications (for institute view)
 */
export async function getAllApplications(): Promise<ApiResponse<Application[]>> {
  try {
    const applications = await apiClient.get<Application[]>('/jobs/applications/list');
    
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch applications');
  }
}
