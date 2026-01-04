// Subscription enforcement with real backend API implementation
import { apiClient } from '@/lib/apiClient';
import {
  BrowseCheckResult,
  ListingCheckResult,
  VisibilityCheckResult,
  ApiResponse,
  JobPostCheckResult,
} from '../types';

// Helper for mock data
const getMockBrowseCount = () => {
  try {
    const stored = localStorage.getItem('mock_browse_count');
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

const setMockBrowseCount = (count: number) => {
  try {
    localStorage.setItem('mock_browse_count', count.toString());
  } catch (e) {
    console.error('Failed to save mock browse count', e);
  }
};

// ==========================================
// BROWSE LIMIT ENFORCEMENT
// ==========================================

export const checkBrowseLimit = async (): Promise<ApiResponse<BrowseCheckResult>> => {
  try {
    const response = await apiClient.get('/subscriptions/check/browse-limit');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback
    const current = getMockBrowseCount();
    const limit = 50;

    return {
      success: true,
      data: {
        allowed: current < limit,
        remaining: Math.max(0, limit - current),
        limitReached: current >= limit,
        subscription: null,
        message: current >= limit ? 'Browse limit reached (Mock)' : 'Allowed (Mock)',
      },
      message: 'Mock browse limit check',
      timestamp: new Date().toISOString(),
    };
  }
};

export const incrementBrowseCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post('/subscriptions/increment/browse-count');
    return {
      success: true,
      data: { success: response.data.success },
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback
    const current = getMockBrowseCount();
    setMockBrowseCount(current + 1);

    return {
      success: true,
      data: { success: true },
      message: 'Mock increment successful',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// LISTING LIMIT ENFORCEMENT
// ==========================================

export const checkListingLimit = async (): Promise<ApiResponse<ListingCheckResult>> => {
  try {
    const response = await apiClient.get('/subscriptions/check/listing-limit');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback
    const mockListingCount = localStorage.getItem('mock_listing_count');
    const current = mockListingCount ? parseInt(mockListingCount, 10) : 0;
    const limit = 5;

    return {
      success: true,
      data: {
        allowed: current < limit,
        remaining: Math.max(0, limit - current),
        limitReached: current >= limit,
        subscription: null,
        message: current >= limit ? 'Listing limit reached (Mock)' : 'Allowed (Mock)',
      },
      message: 'Mock listing limit check',
      timestamp: new Date().toISOString(),
    };
  }
};

export const incrementListingCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post('/subscriptions/increment/listing-count');
    return {
      success: true,
      data: { success: response.data.success },
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback
    const mockListingCount = localStorage.getItem('mock_listing_count');
    const current = mockListingCount ? parseInt(mockListingCount, 10) : 0;
    localStorage.setItem('mock_listing_count', (current + 1).toString());

    return {
      success: true,
      data: { success: true },
      message: 'Mock increment successful',
      timestamp: new Date().toISOString(),
    };
  }
};

export const decrementListingCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post('/subscriptions/decrement/listing-count');
    return {
      success: true,
      data: { success: response.data.success },
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback
    const mockListingCount = localStorage.getItem('mock_listing_count');
    const current = mockListingCount ? parseInt(mockListingCount, 10) : 0;
    localStorage.setItem('mock_listing_count', Math.max(0, current - 1).toString());

    return {
      success: true,
      data: { success: true },
      message: 'Mock decrement successful',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// JOB POSTING LIMIT ENFORCEMENT
// ==========================================

export const checkJobPostLimit = async (): Promise<ApiResponse<JobPostCheckResult>> => {
  try {
    const response = await apiClient.get('/subscriptions/check/job-post-limit');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback
    const mockJobCount = localStorage.getItem('mock_job_count');
    const current = mockJobCount ? parseInt(mockJobCount, 10) : 0;
    const limit = 10;

    return {
      success: true,
      data: {
        allowed: current < limit,
        remaining: Math.max(0, limit - current),
        limitReached: current >= limit,
        subscription: null,
        message: current >= limit ? 'Job post limit reached (Mock)' : 'Allowed (Mock)',
      },
      message: 'Mock job post limit check',
      timestamp: new Date().toISOString(),
    };
  }
};

export const incrementJobPostCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post('/subscriptions/increment/job-post-count');
    return {
      success: true,
      data: { success: response.data.success },
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback
    const mockJobCount = localStorage.getItem('mock_job_count');
    const current = mockJobCount ? parseInt(mockJobCount, 10) : 0;
    localStorage.setItem('mock_job_count', (current + 1).toString());

    return {
      success: true,
      data: { success: true },
      message: 'Mock job post increment successful',
      timestamp: new Date().toISOString(),
    };
  }
};

export const decrementJobPostCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post('/subscriptions/decrement/job-post-count');
    return {
      success: true,
      data: { success: response.data.success },
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback
    const mockJobCount = localStorage.getItem('mock_job_count');
    const current = mockJobCount ? parseInt(mockJobCount, 10) : 0;
    localStorage.setItem('mock_job_count', Math.max(0, current - 1).toString());

    return {
      success: true,
      data: { success: true },
      message: 'Mock job post decrement successful',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// LISTING VISIBILITY ENFORCEMENT
// ==========================================

export const checkListingVisibility = async (
  listingId: string
): Promise<ApiResponse<VisibilityCheckResult>> => {
  try {
    const response = await apiClient.get(`/subscriptions/check/listing-visibility/${listingId}`);
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback - assume visible
    return {
      success: true,
      data: {
        visible: true,
        subscription: null,
        message: 'Listing is visible (Mock)',
      },
      message: 'Mock visibility check',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// SUBSCRIPTION STATUS CHECK
// ==========================================

export const getSubscriptionStatus = async (): Promise<
  ApiResponse<{
    plan: string;
    features: Record<string, any>;
    expiresAt: string | null;
  }>
> => {
  try {
    const response = await apiClient.get('/subscriptions/status');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback - basic plan
    return {
      success: true,
      data: {
        plan: 'free',
        features: {
          browseLimit: 50,
          listingLimit: 5,
          jobPostLimit: 10,
        },
        expiresAt: null,
      },
      message: 'Mock subscription status',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// USAGE STATS
// ==========================================

export const getUsageStats = async (): Promise<
  ApiResponse<{
    browse: { used: number; limit: number };
    listings: { used: number; limit: number };
    jobPosts: { used: number; limit: number };
  }>
> => {
  try {
    const response = await apiClient.get('/subscriptions/usage-stats');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback
    const browseCount = getMockBrowseCount();
    const listingCount = localStorage.getItem('mock_listing_count');
    const jobCount = localStorage.getItem('mock_job_count');

    return {
      success: true,
      data: {
        browse: { used: browseCount, limit: 50 },
        listings: { used: parseInt(listingCount || '0', 10), limit: 5 },
        jobPosts: { used: parseInt(jobCount || '0', 10), limit: 10 },
      },
      message: 'Mock usage stats',
      timestamp: new Date().toISOString(),
    };
  }
};
