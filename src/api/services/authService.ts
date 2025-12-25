import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '../types';
import { API_CONFIG } from '../config';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'institute' | 'admin' | 'teacher';
  avatar?: string;
  instituteName?: string;
  contactPerson?: string;
  instituteCode?: string;
  phone?: string;
  subscriptionId?: string;
  isActive?: boolean;
  qualifications?: string[];
  experience?: number;
  subjects?: string[];
  bio?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  instituteName?: string;
  contactPerson?: string;
  instituteCode?: string;
  phone: string;
  role?: 'institute' | 'teacher';
}

export interface TeacherSignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  qualifications: string[];
  experience: number;
  subjects: string[];
  bio?: string;
  location: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, data);
      
      // Store token and user
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  /**
   * Signup institute
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.SIGNUP, {
        ...data,
        role: 'institute',
      });

      // Store token and user
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  },

  /**
   * Signup teacher
   */
  async signupTeacher(data: TeacherSignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.SIGNUP, {
        ...data,
        role: 'teacher',
      });

      // Store token and user
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Teacher signup failed');
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT, {});
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await apiClient.get<User>(API_CONFIG.ENDPOINTS.ME);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user');
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      return await apiClient.put<User>(API_CONFIG.ENDPOINTS.ME, data);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  /**
   * Validate current token
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get stored token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};
