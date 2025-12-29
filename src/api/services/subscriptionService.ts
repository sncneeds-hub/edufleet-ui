import {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionUsageStats,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  AssignSubscriptionDto,
  ExtendSubscriptionDto,
  ResetBrowseCountDto,
  SuspendSubscriptionDto,
  SubscriptionStats,
  SubscriptionPlanStats,
  SubscriptionFilters,
  ApiResponse,
  PaginatedResponse,
  SubscriptionRequest,
  CreateSubscriptionRequestDto,
  UpdateSubscriptionRequestDto,
} from '../types';
import { apiClient } from '@/lib/apiClient';

// Cache for plans to avoid redundant calls
let plansCache: ApiResponse<SubscriptionPlan[]> | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ==========================================
//SUBSCRIPTION PLAN CRUD
// ==========================================

export const getAllSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  const data = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const getActiveSubscriptionPlans = async (force = false): Promise<ApiResponse<SubscriptionPlan[]>> => {
  const now = Date.now();
  if (!force && plansCache && now - lastCacheTime < CACHE_DURATION) {
    console.log('[SubscriptionService] Returning cached active plans');
    return plansCache;
  }

  const data = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans/active', { requiresAuth: false });
  plansCache = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  
  lastCacheTime = now;
  return plansCache;
};

export const getSubscriptionPlanById = async (planId: string): Promise<ApiResponse<SubscriptionPlan>> => {
  const data = await apiClient.get<SubscriptionPlan>(`/subscriptions/plans/${planId}`);
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const createSubscriptionPlan = async (
  dto: CreateSubscriptionPlanDto
): Promise<ApiResponse<SubscriptionPlan>> => {
  const data = await apiClient.post<SubscriptionPlan>('/subscriptions/plans', dto);
  return {
    success: true,
    data,
    message: 'Subscription plan created successfully',
    timestamp: new Date().toISOString(),
  };
};

export const updateSubscriptionPlan = async (
  dto: UpdateSubscriptionPlanDto
): Promise<ApiResponse<SubscriptionPlan>> => {
  const data = await apiClient.put<SubscriptionPlan>(`/subscriptions/plans/${dto.id}`, dto);
  return {
    success: true,
    data,
    message: 'Subscription plan updated successfully',
    timestamp: new Date().toISOString(),
  };
};

export const toggleSubscriptionPlanStatus = async (
  planId: string
): Promise<ApiResponse<SubscriptionPlan>> => {
  const data = await apiClient.put<SubscriptionPlan>(`/subscriptions/plans/${planId}/toggle-status`, {});
  return {
    success: true,
    data,
    message: `Subscription plan ${data.isActive ? 'activated' : 'deactivated'}`,
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// USER SUBSCRIPTION MANAGEMENT
// ==========================================

export const getUserSubscription = async (
  userId: string
): Promise<ApiResponse<UserSubscription | null>> => {
  // Guard against undefined/null userId
  if (!userId) {
    console.warn('[SubscriptionService] getUserSubscription called with no userId');
    return {
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
  
  try {
    const data = await apiClient.get<UserSubscription>(`/subscriptions/user/${userId}`);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // If 404, return null (no subscription found)
    if (error.status === 404) {
      return {
        success: true,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    throw error;
  }
};

export const getAllUserSubscriptions = async (): Promise<ApiResponse<UserSubscription[]>> => {
  const data = await apiClient.get<UserSubscription[]>('/subscriptions/user');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const assignSubscriptionToUser = async (
  dto: AssignSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.post<UserSubscription>('/subscriptions/assign', dto);
  return {
    success: true,
    data,
    message: 'Subscription assigned successfully',
    timestamp: new Date().toISOString(),
  };
};

export const extendUserSubscription = async (
  dto: ExtendSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${dto.userSubscriptionId}/extend`, dto);
  return {
    success: true,
    data,
    message: 'Subscription extended successfully',
    timestamp: new Date().toISOString(),
  };
};

export const continueSubscription = async (
  dto: Omit<ExtendSubscriptionDto, 'userSubscriptionId'> & { userSubscriptionId: string } // Fix type mismatch
): Promise<ApiResponse<UserSubscription>> => {
  return extendUserSubscription(dto);
};

export const resetBrowseCount = async (
  dto: ResetBrowseCountDto
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${dto.userSubscriptionId}/reset-browse`, dto);
  return {
    success: true,
    data,
    message: 'Browse count reset successfully',
    timestamp: new Date().toISOString(),
  };
};

export const suspendUserSubscription = async (
  dto: SuspendSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${dto.userSubscriptionId}/suspend`, dto);
  return {
    success: true,
    data,
    message: 'Subscription suspended',
    timestamp: new Date().toISOString(),
  };
};

export const reactivateUserSubscription = async (
  subscriptionId: string
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${subscriptionId}/reactivate`, {});
  return {
    success: true,
    data,
    message: 'Subscription reactivated successfully',
    timestamp: new Date().toISOString(),
  };
};

export const cancelUserSubscription = async (
  subscriptionId: string
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.delete<UserSubscription>(`/subscriptions/${subscriptionId}`);
  return {
    success: true,
    data,
    message: 'Subscription cancelled successfully',
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// SUBSCRIPTION USAGE & STATS
// ==========================================

export const getSubscriptionUsageStats = async (
  userId: string
): Promise<ApiResponse<SubscriptionUsageStats>> => {
  // Guard against undefined/null userId
  if (!userId) {
    console.warn('[SubscriptionService] getSubscriptionUsageStats called with no userId');
    return {
      success: true,
      data: {
        currentBrowseCount: 0,
        maxBrowseLimit: 0,
        remainingBrowses: 0,
        percentageUsed: 0,
        listingsPosted: 0,
        maxListingsAllowed: 0,
        jobsPosted: 0,
        maxJobsAllowed: 0,
        daysRemaining: 0,
        isExpired: false,
        isSuspended: false,
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  const data = await apiClient.get<SubscriptionUsageStats>(`/subscriptions/user/${userId}/usage`);
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const getGlobalSubscriptionStats = async (): Promise<ApiResponse<SubscriptionStats>> => {
  const data = await apiClient.get<SubscriptionStats>('/subscriptions/stats');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const getSubscriptionPlanStats = async (): Promise<ApiResponse<SubscriptionPlanStats[]>> => {
  const data = await apiClient.get<SubscriptionPlanStats[]>('/subscriptions/plan-stats');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const getFilteredUserSubscriptions = async (
  filters: SubscriptionFilters
): Promise<ApiResponse<PaginatedResponse<UserSubscription>>> => {
  const params = new URLSearchParams();
  
  if (filters.status && filters.status !== 'all' as any) {
    params.append('status', filters.status);
  }
  if (filters.planId && filters.planId !== 'all') {
    params.append('planId', filters.planId);
  }
  if (filters.search || filters.searchTerm) {
    params.append('search', filters.search || filters.searchTerm || '');
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.pageSize) {
    params.append('pageSize', filters.pageSize.toString());
  }
  
  const data = await apiClient.get<PaginatedResponse<UserSubscription>>(`/subscriptions/filtered?${params.toString()}`);
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// SUBSCRIPTION REQUESTS
// ==========================================

export const createSubscriptionRequest = async (
  dto: CreateSubscriptionRequestDto
): Promise<ApiResponse<SubscriptionRequest>> => {
  const data = await apiClient.post<SubscriptionRequest>('/subscriptions/requests', dto);
  return {
    success: true,
    data,
    message: 'Subscription request submitted successfully',
    timestamp: new Date().toISOString(),
  };
};

export const getAllSubscriptionRequests = async (
  filters?: { status?: string; userId?: string }
): Promise<ApiResponse<SubscriptionRequest[]>> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.userId) params.append('userId', filters.userId);
  
  const data = await apiClient.get<SubscriptionRequest[]>(`/subscriptions/requests?${params.toString()}`);
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const getMySubscriptionRequests = async (): Promise<ApiResponse<SubscriptionRequest[]>> => {
  const data = await apiClient.get<SubscriptionRequest[]>('/subscriptions/requests/my');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const updateSubscriptionRequest = async (
  requestId: string,
  dto: UpdateSubscriptionRequestDto
): Promise<ApiResponse<SubscriptionRequest>> => {
  const data = await apiClient.put<SubscriptionRequest>(`/subscriptions/requests/${requestId}`, dto);
  return {
    success: true,
    data,
    message: `Subscription request ${dto.status}`,
    timestamp: new Date().toISOString(),
  };
};

export const changeUserSubscriptionPlan = async (
  subscriptionId: string,
  newPlanId: string,
  notes?: string
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${subscriptionId}/change-plan`, {
    planId: newPlanId,
    notes
  });
  return {
    success: true,
    data,
    message: 'Subscription plan changed successfully',
    timestamp: new Date().toISOString(),
  };
};