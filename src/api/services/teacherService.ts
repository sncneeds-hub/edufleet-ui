import { 
  mockTeachers, 
  mockApplications,
  getTeacherApplications,
  getTeacherInterviews
} from '@/mock/teacherData';
import type { ApiResponse, PaginatedResponse } from '../types';

/**
 * Teacher Service
 * Handles all teacher-related API operations
 */

// Teacher types (matching mock data structure)
export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  subjects: string[];
  location: string;
  photo?: string;
  resume?: string;
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
  experience?: string;
  page?: number;
  pageSize?: number;
}

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all teachers with optional filters
 */
export async function getTeachers(
  filters?: TeacherFilters
): Promise<ApiResponse<PaginatedResponse<Teacher>>> {
  await delay(300);

  let filtered = [...mockTeachers];

  // Apply filters
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      t =>
        t.name.toLowerCase().includes(term) ||
        t.qualification.toLowerCase().includes(term) ||
        t.subjects.some(s => s.toLowerCase().includes(term))
    );
  }

  if (filters?.subjects && filters.subjects.length > 0) {
    filtered = filtered.filter(t =>
      filters.subjects!.some(sub => t.subjects.includes(sub))
    );
  }

  if (filters?.location) {
    filtered = filtered.filter(t =>
      t.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
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
 * Get single teacher by ID
 */
export async function getTeacherById(id: string): Promise<ApiResponse<Teacher>> {
  await delay(200);

  const teacher = mockTeachers.find(t => t.id === id);

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  return {
    success: true,
    data: teacher,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get applications for a specific teacher
 */
export async function getApplicationsForTeacher(
  teacherId: string
): Promise<ApiResponse<Application[]>> {
  await delay(300);

  const applications = getTeacherApplications(teacherId);

  return {
    success: true,
    data: applications,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get interviews for a specific teacher
 */
export async function getInterviewsForTeacher(
  teacherId: string
): Promise<ApiResponse<any[]>> {
  await delay(300);

  const interviews = getTeacherInterviews(teacherId);

  return {
    success: true,
    data: interviews,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get applications for a specific job
 */
export async function getApplicationsForJob(
  jobId: string
): Promise<ApiResponse<Application[]>> {
  await delay(300);

  const applications = mockApplications.filter(app => app.jobId === jobId);

  return {
    success: true,
    data: applications,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get all applications (for institute view)
 */
export async function getAllApplications(): Promise<ApiResponse<Application[]>> {
  await delay(300);

  return {
    success: true,
    data: mockApplications,
    timestamp: new Date().toISOString()
  };
}
