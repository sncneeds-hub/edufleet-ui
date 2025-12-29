// Subscription enforcement with real backend API implementation
import { apiClient } from '@/lib/apiClient';
import {
  BrowseCheckResult,
  ListingCheckResult,
  VisibilityCheckResult,
  ApiResponse,
  JobPostCheckResult, // Added this import
} from '../types';

// ==========================================
// BROWSE LIMIT ENFORCEMENT
// ==========================================

export const checkBrowseLimit = async (): Promise<ApiResponse<BrowseCheckResult>> => {
  try {
    const response = await apiClient.get('/api/subscriptions/check/browse-limit');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      data: {
        allowed: true,
        remaining: 10,
        limitReached: false,
        subscription: null,
        message: 'Failed to check browse limit',
      },
      message: error.response?.data?.error || error.message || 'Failed to check browse limit',
      timestamp: new Date().toISOString(),
    };
  }
};

export const incrementBrowseCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post('/api/subscriptions/increment/browse-count');
    return {
      success: true,
      data: { success: response.data.success },
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      data: { success: false },
      message: error.response?.data?.error || error.message || 'Failed to increment browse count',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// LISTING LIMIT ENFORCEMENT
// ==========================================

export const checkListingLimit = async (): Promise<ApiResponse<ListingCheckResult>> => {
  try {
    const response = await apiClient.get('/api/subscriptions/check/listing-limit');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      data: {
        allowed: false,
        remaining: 2,
        limitReached: true,
        subscription: null,
        message: 'Failed to check listing limit',
      },
      message: error.response?.data?.error || error.message || 'Failed to check listing limit',
      timestamp: new Date().toISOString(),
    };
  }
};

export const incrementListingCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post('/api/subscriptions/increment/listing-count');
    return {
      success: true,
      data: { success: response.data.success },
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      data: { success: false },
      message: error.response?.data?.error || error.message || 'Failed to increment listing count',
      timestamp: new Date().toISOString(),
    };
  }
};

export const decrementListingCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post('/api/subscriptions/decrement/listing-count');
    return {
      success: true,
      data: { success: response.data.success },
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      data: { success: false },
      message: error.response?.data?.error || error.message || 'Failed to decrement listing count',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// JOB POST LIMIT ENFORCEMENT
// ==========================================

export const checkJobPostLimit = async (): Promise<ApiResponse<JobPostCheckResult>> => {
  try {
    const response = await apiClient.get('/api/subscriptions/check/job-post-limit');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      data: {
        allowed: false,
        remaining: 0,
        limitReached: true,
        subscription: null,
        message: 'Failed to check job post limit',
      },
      message: error.response?.data?.error || error.message || 'Failed to check job post limit',
      timestamp: new Date().toISOString(),
    };
  }
};

export const incrementJobPostCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post('/api/subscriptions/increment/job-post-count');
    return {
      success: true,
      data: { success: response.data.success },
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      data: { success: false },
      message: error.response?.data?.error || error.message || 'Failed to increment job post count',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// LISTING VISIBILITY ENFORCEMENT
// ==========================================

export const checkListingVisibility = async (
  listingCreatedAt: string,
  userId: string
): Promise<ApiResponse<VisibilityCheckResult>> => {
  try {
    const response = await apiClient.post('/api/subscriptions/check/listing-visibility', {
      listingCreatedAt,
      userId,
    });
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Default to visible on error
    return {
      success: false,
      data: {
        visible: true,
        delayHours: 0,
        availableAt: new Date().toISOString(),
        subscription: null,
      },
      message: error.response?.data?.error || error.message || 'Failed to check listing visibility',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// NOTIFICATION PERMISSION CHECK
// ==========================================

export const checkNotificationPermission = async (): Promise<ApiResponse<{ allowed: boolean; subscription: any }>> => {
  try {
    const response = await apiClient.get('/api/subscriptions/check/notification-permission');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      data: {
        allowed: false,
        subscription: null,
      },
      message: error.response?.data?.error || error.message || 'Failed to check notification permission',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// BATCH VISIBILITY FILTERING (for browse pages)
// ==========================================

export interface ListingWithVisibility {
  id: string;
  createdAt: string;
  visible: boolean;
  availableAt?: string;
}

export const filterListingsByVisibility = async <T extends { id: string; createdAt: string; userId?: string }>(
  listings: T[],
  currentUserId: string
): Promise<ApiResponse<T[]>> => {
  try {
    // Check visibility for each listing
    const visibilityPromises = listings.map(async (listing) => {
      const result = await checkListingVisibility(listing.createdAt, listing.userId || currentUserId);
      return {
        listing,
        visible: result.data.visible,
      };
    });

    const results = await Promise.all(visibilityPromises);
    const filtered = results
      .filter(r => r.visible)
      .map(r => r.listing);

    return {
      success: true,
      data: filtered,
      message: `Filtered ${listings.length - filtered.length} items based on visibility delay`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // On error, return all listings
    return {
      success: false,
      data: listings,
      message: error.message || 'Failed to filter listings by visibility',
      timestamp: new Date().toISOString(),
    };
  }
};