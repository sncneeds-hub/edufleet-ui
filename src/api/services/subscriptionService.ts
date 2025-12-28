import { apiClient } from '@/lib/apiClient';
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

// ==========================================
// SUBSCRIPTION PLAN CRUD
// ==========================================

export const getAllSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  try {
    const plans = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans', { requiresAuth: true });
    
    return {
      success: true,
      data: plans,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch subscription plans',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getActiveSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  try {
    const plans = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans/active', { requiresAuth: false });
    
    return {
      success: true,
      data: plans,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch active subscription plans',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getSubscriptionPlanById = async (planId: string): Promise<ApiResponse<SubscriptionPlan>> => {
  try {
    const plan = await apiClient.get<SubscriptionPlan>(`/subscriptions/plans/${planId}`, { requiresAuth: true });
    
    return {
      success: true,
      data: plan,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Subscription plan not found',
      timestamp: new Date().toISOString(),
    };
  }
};

export const createSubscriptionPlan = async (
  dto: CreateSubscriptionPlanDto
): Promise<ApiResponse<SubscriptionPlan>> => {
  try {
    const plan = await apiClient.post<SubscriptionPlan>('/subscriptions/plans', dto);
    
    return {
      success: true,
      data: plan,
      message: 'Subscription plan created successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to create subscription plan',
      timestamp: new Date().toISOString(),
    };
  }
};

export const updateSubscriptionPlan = async (
  dto: UpdateSubscriptionPlanDto
): Promise<ApiResponse<SubscriptionPlan>> => {
  try {
    const { id, ...data } = dto;
    const plan = await apiClient.put<SubscriptionPlan>(`/subscriptions/plans/${id}`, data);
    
    return {
      success: true,
      data: plan,
      message: 'Subscription plan updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to update subscription plan',
      timestamp: new Date().toISOString(),
    };
  }
};

export const toggleSubscriptionPlanStatus = async (
  planId: string
): Promise<ApiResponse<SubscriptionPlan>> => {
  try {
    const plan = await apiClient.put<SubscriptionPlan>(`/subscriptions/plans/${planId}/toggle-status`, {});
    
    return {
      success: true,
      data: plan,
      message: `Subscription plan ${plan.isActive ? 'activated' : 'deactivated'}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to toggle subscription plan status',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// USER SUBSCRIPTION MANAGEMENT
// ==========================================

export const getUserSubscription = async (
  userId: string
): Promise<ApiResponse<UserSubscription | null>> => {
  try {
    const subscription = await apiClient.get<UserSubscription | null>(`/subscriptions/user/${userId}`, { requiresAuth: true });
    
    return {
      success: true,
      data: subscription,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch user subscription',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getAllUserSubscriptions = async (): Promise<ApiResponse<UserSubscription[]>> => {
  try {
    const subscriptions = await apiClient.get<UserSubscription[]>('/subscriptions/user', { requiresAuth: true });
    
    return {
      success: true,
      data: subscriptions,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch user subscriptions',
      timestamp: new Date().toISOString(),
    };
  }
};

export const assignSubscriptionToUser = async (
  dto: AssignSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  try {
    const subscription = await apiClient.post<UserSubscription>('/subscriptions/assign', dto);
    
    return {
      success: true,
      data: subscription,
      message: 'Subscription assigned successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to assign subscription',
      timestamp: new Date().toISOString(),
    };
  }
};

export const extendUserSubscription = async (
  dto: ExtendSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  try {
    const { userSubscriptionId, ...data } = dto;
    const subscription = await apiClient.put<UserSubscription>(
      `/subscriptions/${userSubscriptionId}/extend`,
      data
    );
    
    return {
      success: true,
      data: subscription,
      message: 'Subscription extended successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to extend subscription',
      timestamp: new Date().toISOString(),
    };
  }
};

export const continueSubscription = async (
  dto: Omit<ExtendSubscriptionDto, 'userSubscriptionId'>
): Promise<ApiResponse<UserSubscription>> => {
  try {
    const subscription = await apiClient.put<UserSubscription>(
      '/subscriptions/continue',
      dto
    );
    
    return {
      success: true,
      data: subscription,
      message: 'Subscription continued successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to continue subscription',
      timestamp: new Date().toISOString(),
    };
  }
};

export const resetBrowseCount = async (
  dto: ResetBrowseCountDto
): Promise<ApiResponse<UserSubscription>> => {
  try {
    const subscription = await apiClient.put<UserSubscription>(
      `/subscriptions/${dto.userSubscriptionId}/reset-browse`,
      {}
    );
    
    return {
      success: true,
      data: subscription,
      message: 'Browse count reset successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to reset browse count',
      timestamp: new Date().toISOString(),
    };
  }
};

export const suspendUserSubscription = async (
  dto: SuspendSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  try {
    const subscription = await apiClient.put<UserSubscription>(
      `/subscriptions/${dto.userSubscriptionId}/suspend`,
      { reason: dto.reason }
    );
    
    return {
      success: true,
      data: subscription,
      message: 'Subscription suspended',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to suspend subscription',
      timestamp: new Date().toISOString(),
    };
  }
};

export const reactivateUserSubscription = async (
  subscriptionId: string
): Promise<ApiResponse<UserSubscription>> => {
  try {
    const subscription = await apiClient.put<UserSubscription>(
      `/subscriptions/${subscriptionId}/reactivate`,
      {}
    );
    
    return {
      success: true,
      data: subscription,
      message: 'Subscription reactivated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to reactivate subscription',
      timestamp: new Date().toISOString(),
    };
  }
};

export const cancelUserSubscription = async (
  subscriptionId: string
): Promise<ApiResponse<UserSubscription>> => {
  try {
    const subscription = await apiClient.delete<UserSubscription>(
      `/subscriptions/${subscriptionId}`
    );
    
    return {
      success: true,
      data: subscription,
      message: 'Subscription cancelled successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to cancel subscription',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// SUBSCRIPTION USAGE & STATS
// ==========================================

export const getSubscriptionUsageStats = async (
  userId: string
): Promise<ApiResponse<SubscriptionUsageStats>> => {
  try {
    const stats = await apiClient.get<SubscriptionUsageStats>(
      `/subscriptions/user/${userId}/usage`,
      { requiresAuth: true }
    );
    
    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch subscription usage stats',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getGlobalSubscriptionStats = async (): Promise<ApiResponse<SubscriptionStats>> => {
  try {
    const stats = await apiClient.get<SubscriptionStats>('/subscriptions/stats', { requiresAuth: true });
    
    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch subscription stats',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getSubscriptionPlanStats = async (): Promise<ApiResponse<SubscriptionPlanStats[]>> => {
  try {
    const stats = await apiClient.get<SubscriptionPlanStats[]>('/subscriptions/plan-stats', { requiresAuth: true });
    
    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch subscription plan stats',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getFilteredUserSubscriptions = async (
  filters: SubscriptionFilters
): Promise<ApiResponse<PaginatedResponse<UserSubscription>>> => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.planId) params.append('planId', filters.planId);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/subscriptions/filtered?${queryString}` : '/subscriptions/filtered';
    
    const data = await apiClient.get<PaginatedResponse<UserSubscription>>(endpoint, { requiresAuth: true });
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch filtered subscriptions',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// SUBSCRIPTION REQUESTS
// ==========================================

export const createSubscriptionRequest = async (
  dto: CreateSubscriptionRequestDto
): Promise<ApiResponse<SubscriptionRequest>> => {
  try {
    const request = await apiClient.post<SubscriptionRequest>('/subscriptions/requests', dto);
    
    return {
      success: true,
      data: request,
      message: 'Subscription request submitted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to submit subscription request',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getAllSubscriptionRequests = async (
  filters?: { status?: string; userId?: string }
): Promise<ApiResponse<SubscriptionRequest[]>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);

    const queryString = params.toString();
    const endpoint = queryString ? `/subscriptions/requests?${queryString}` : '/subscriptions/requests';
    
    const requests = await apiClient.get<SubscriptionRequest[]>(endpoint, { requiresAuth: true });
    
    return {
      success: true,
      data: requests,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch subscription requests',
      timestamp: new Date().toISOString(),
    };
  }
};

export const getMySubscriptionRequests = async (): Promise<ApiResponse<SubscriptionRequest[]>> => {
  try {
    const requests = await apiClient.get<SubscriptionRequest[]>('/subscriptions/requests/my', { requiresAuth: true });
    
    return {
      success: true,
      data: requests,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to fetch your subscription requests',
      timestamp: new Date().toISOString(),
    };
  }
};

export const updateSubscriptionRequest = async (
  requestId: string,
  dto: UpdateSubscriptionRequestDto
): Promise<ApiResponse<SubscriptionRequest>> => {
  try {
    const request = await apiClient.put<SubscriptionRequest>(`/subscriptions/requests/${requestId}`, dto);
    
    return {
      success: true,
      data: request,
      message: `Subscription request ${dto.status}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to update subscription request',
      timestamp: new Date().toISOString(),
    };
  }
};

// Change user subscription plan (Admin only)
export const changeUserSubscriptionPlan = async (
  subscriptionId: string,
  newPlanId: string,
  notes?: string
): Promise<ApiResponse<UserSubscription>> => {
  try {
    const subscription = await apiClient.put<UserSubscription>(
      `/subscriptions/${subscriptionId}/change-plan`,
      { planId: newPlanId, notes }
    );
    
    return {
      success: true,
      data: subscription,
      message: 'Subscription plan changed successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw {
      success: false,
      error: error.message || 'Failed to change subscription plan',
      timestamp: new Date().toISOString(),
    };
  }
};