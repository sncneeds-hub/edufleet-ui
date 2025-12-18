import { API_CONFIG } from '../api/config';
import { mockApiClient } from './mockApiClient';

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

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Main API client for making HTTP requests
 * Falls back to mock client when MOCK_MODE is enabled
 */
export const apiClient = {
  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },

  /**
   * Make a request with proper headers and error handling
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // Use mock client if mock mode is enabled
    if (API_CONFIG.MOCK_MODE) {
      return mockApiClient.request<T>(endpoint, options);
    }

    const { requiresAuth = true, headers = {}, ...fetchOptions } = options;

    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    // Prepare headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
        credentials: 'include', // Include cookies
      });

      // Parse response
      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle errors
      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || 'Request failed';
        const errorCode = responseData?.code || 'UNKNOWN_ERROR';
        throw new APIError(response.status, errorMessage, errorCode);
      }

      // Return data (handle both wrapped and unwrapped responses)
      return responseData?.data || responseData;
    } catch (error) {
      // Re-throw API errors
      if (error instanceof APIError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new APIError(0, 'Network error. Please check your connection.', 'NETWORK_ERROR');
      }

      // Handle unknown errors
      throw new APIError(500, 'An unexpected error occurred', 'UNKNOWN_ERROR');
    }
  },

  /**
   * Upload file(s)
   */
  async uploadFile(endpoint: string, file: File, fieldName = 'image'): Promise<{ url: string }> {
    // Use mock client if mock mode is enabled
    if (API_CONFIG.MOCK_MODE) {
      return mockApiClient.uploadFile(endpoint, file, fieldName);
    }

    const formData = new FormData();
    formData.append(fieldName, file);

    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(
          response.status,
          data?.error || 'Upload failed',
          data?.code || 'UPLOAD_ERROR'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, 'File upload failed', 'UPLOAD_ERROR');
    }
  },

  /**
   * Upload multiple files
   */
  async uploadFiles(endpoint: string, files: File[], fieldName = 'images'): Promise<{ urls: string[] }> {
    // Use mock client if mock mode is enabled
    if (API_CONFIG.MOCK_MODE) {
      return mockApiClient.uploadFiles(endpoint, files, fieldName);
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append(fieldName, file);
    });

    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(
          response.status,
          data?.error || 'Upload failed',
          data?.code || 'UPLOAD_ERROR'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, 'File upload failed', 'UPLOAD_ERROR');
    }
  },
};
