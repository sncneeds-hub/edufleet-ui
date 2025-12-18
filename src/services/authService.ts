import { apiClient, APIError } from '../lib/apiClient';
import { API_CONFIG } from '../api/config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  instituteName?: string;
  contactPerson?: string;
  instituteCode?: string;
  phone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'institute' | 'admin' | 'teacher' | 'supplier';
  instituteName?: string;
  contactPerson?: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  otp?: string; // For demo purposes only
}

/**
 * Store authentication data in localStorage
 */
function storeAuthData(user: User, token: string): void {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

/**
 * Clear authentication data from localStorage
 */
function clearAuthData(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

/**
 * Get stored user from localStorage
 */
function getStoredUserData(): User | null {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        credentials,
        { requiresAuth: false }
      );

      // Store authentication data
      storeAuthData(response.user, response.token);

      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed');
    }
  },

  /**
   * Signup with user data
   */
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.SIGNUP,
        userData,
        { requiresAuth: false }
      );

      // Store authentication data
      storeAuthData(response.user, response.token);

      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error('Signup failed');
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT, {}, { requiresAuth: true });
    } catch (error) {
      // Logout anyway even if backend call fails
    } finally {
      clearAuthData();
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<{ user: User }>(API_CONFIG.ENDPOINTS.ME);
      return response.user;
    } catch (error) {
      clearAuthData();
      throw new Error('Not authenticated');
    }
  },

  /**
   * Validate token
   */
  async validateToken(): Promise<boolean> {
    try {
      await apiClient.get(API_CONFIG.ENDPOINTS.ME);
      return true;
    } catch (error) {
      clearAuthData();
      return false;
    }
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    return getStoredUserData();
  },

  /**
   * Get stored token from localStorage
   */
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Check if authenticated (based on stored token)
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },

  /**
   * Send signup OTP to email
   */
  async sendSignupOTP(email: string): Promise<OTPResponse> {
    try {
      // For demo/mock purposes, generate a random OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // In production, this would call the backend API to send the OTP via email
      console.log(`OTP for ${email}: ${otp}`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        otp, // Only for demo/testing purposes
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  },
};
