import { simulateDelay } from '../config';
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
} from '../types';
import {
  mockSubscriptionPlans,
  mockUserSubscriptions,
  getUserSubscription,
  getSubscriptionPlan,
  getActivePlans,
  getDaysRemaining,
  isExpiringSoon,
  DEFAULT_FREE_PLAN,
} from '../../mock/subscriptionData';

// ==========================================
// SUBSCRIPTION PLAN CRUD
// ==========================================

export const getAllSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  await simulateDelay();
  
  return {
    success: true,
    data: [...mockSubscriptionPlans],
    timestamp: new Date().toISOString(),
  };
};

export const getActiveSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  await simulateDelay();
  
  return {
    success: true,
    data: getActivePlans(),
    timestamp: new Date().toISOString(),
  };
};

export const getSubscriptionPlanById = async (planId: string): Promise<ApiResponse<SubscriptionPlan>> => {
  await simulateDelay();
  
  const plan = getSubscriptionPlan(planId);
  
  if (!plan) {
    throw new Error('Subscription plan not found');
  }
  
  return {
    success: true,
    data: plan,
    timestamp: new Date().toISOString(),
  };
};

export const createSubscriptionPlan = async (
  dto: CreateSubscriptionPlanDto
): Promise<ApiResponse<SubscriptionPlan>> => {
  await simulateDelay();
  
  const newPlan: SubscriptionPlan = {
    id: `plan-${Date.now()}`,
    ...dto,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockSubscriptionPlans.push(newPlan);
  
  return {
    success: true,
    data: newPlan,
    message: 'Subscription plan created successfully',
    timestamp: new Date().toISOString(),
  };
};

export const updateSubscriptionPlan = async (
  dto: UpdateSubscriptionPlanDto
): Promise<ApiResponse<SubscriptionPlan>> => {
  await simulateDelay();
  
  const planIndex = mockSubscriptionPlans.findIndex(p => p.id === dto.id);
  
  if (planIndex === -1) {
    throw new Error('Subscription plan not found');
  }
  
  const updatedPlan = {
    ...mockSubscriptionPlans[planIndex],
    ...dto,
    updatedAt: new Date().toISOString(),
  };
  
  mockSubscriptionPlans[planIndex] = updatedPlan;
  
  return {
    success: true,
    data: updatedPlan,
    message: 'Subscription plan updated successfully',
    timestamp: new Date().toISOString(),
  };
};

export const toggleSubscriptionPlanStatus = async (
  planId: string
): Promise<ApiResponse<SubscriptionPlan>> => {
  await simulateDelay();
  
  const planIndex = mockSubscriptionPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    throw new Error('Subscription plan not found');
  }
  
  mockSubscriptionPlans[planIndex].isActive = !mockSubscriptionPlans[planIndex].isActive;
  mockSubscriptionPlans[planIndex].updatedAt = new Date().toISOString();
  
  return {
    success: true,
    data: mockSubscriptionPlans[planIndex],
    message: `Subscription plan ${mockSubscriptionPlans[planIndex].isActive ? 'activated' : 'deactivated'}`,
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// USER SUBSCRIPTION MANAGEMENT
// ==========================================

export const getUserSubscriptionById = async (
  userId: string
): Promise<ApiResponse<UserSubscription | null>> => {
  await simulateDelay();
  
  const subscription = getUserSubscription(userId);
  
  return {
    success: true,
    data: subscription,
    timestamp: new Date().toISOString(),
  };
};

export const getUserSubscriptionWithStats = async (
  userId: string
): Promise<ApiResponse<{ subscription: UserSubscription | null; stats: SubscriptionUsageStats }>> => {
  await simulateDelay();
  
  const subscription = getUserSubscription(userId);
  
  if (!subscription) {
    // Return default free plan stats
    return {
      success: true,
      data: {
        subscription: null,
        stats: {
          browseCount: {
            used: 0,
            allowed: DEFAULT_FREE_PLAN.maxBrowseCount,
            remaining: DEFAULT_FREE_PLAN.maxBrowseCount,
            percentage: 0,
          },
          listingCount: {
            used: 0,
            allowed: DEFAULT_FREE_PLAN.maxListingCount,
            remaining: DEFAULT_FREE_PLAN.maxListingCount,
            percentage: 0,
          },
          daysRemaining: 30,
          isExpiringSoon: false,
          isExpired: false,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  const plan = getSubscriptionPlan(subscription.subscriptionPlanId);
  
  if (!plan) {
    throw new Error('Associated subscription plan not found');
  }
  
  const daysRemaining = getDaysRemaining(subscription.endDate);
  const isExpired = daysRemaining < 0;
  
  const stats: SubscriptionUsageStats = {
    browseCount: {
      used: subscription.browseCountUsed,
      allowed: plan.maxBrowseCount,
      remaining: Math.max(0, plan.maxBrowseCount - subscription.browseCountUsed),
      percentage: (subscription.browseCountUsed / plan.maxBrowseCount) * 100,
    },
    listingCount: {
      used: subscription.listingCountUsed,
      allowed: plan.maxListingCount,
      remaining: Math.max(0, plan.maxListingCount - subscription.listingCountUsed),
      percentage: (subscription.listingCountUsed / plan.maxListingCount) * 100,
    },
    daysRemaining: Math.max(0, daysRemaining),
    isExpiringSoon: isExpiringSoon(subscription.endDate),
    isExpired,
  };
  
  return {
    success: true,
    data: {
      subscription,
      stats,
    },
    timestamp: new Date().toISOString(),
  };
};

export const assignSubscription = async (
  dto: AssignSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  await simulateDelay();
  
  const plan = getSubscriptionPlan(dto.subscriptionPlanId);
  
  if (!plan) {
    throw new Error('Subscription plan not found');
  }
  
  // Remove existing subscription for user (only one active at a time)
  const existingIndex = mockUserSubscriptions.findIndex(s => s.userId === dto.userId);
  if (existingIndex !== -1) {
    mockUserSubscriptions.splice(existingIndex, 1);
  }
  
  const newSubscription: UserSubscription = {
    id: `sub-${Date.now()}`,
    userId: dto.userId,
    subscriptionPlanId: dto.subscriptionPlanId,
    planName: plan.displayName,
    startDate: dto.startDate,
    endDate: dto.endDate,
    status: 'active',
    browseCountUsed: 0,
    lastBrowseResetAt: new Date().toISOString(),
    listingCountUsed: 0,
    assignedBy: 'admin-1', // In real app, get from auth context
    notes: dto.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockUserSubscriptions.push(newSubscription);
  
  return {
    success: true,
    data: newSubscription,
    message: 'Subscription assigned successfully',
    timestamp: new Date().toISOString(),
  };
};

export const extendSubscription = async (
  dto: ExtendSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  await simulateDelay();
  
  const subIndex = mockUserSubscriptions.findIndex(s => s.id === dto.userSubscriptionId);
  
  if (subIndex === -1) {
    throw new Error('User subscription not found');
  }
  
  mockUserSubscriptions[subIndex].endDate = dto.newEndDate;
  mockUserSubscriptions[subIndex].status = 'active';
  mockUserSubscriptions[subIndex].notes = dto.notes || mockUserSubscriptions[subIndex].notes;
  mockUserSubscriptions[subIndex].updatedAt = new Date().toISOString();
  
  return {
    success: true,
    data: mockUserSubscriptions[subIndex],
    message: 'Subscription extended successfully',
    timestamp: new Date().toISOString(),
  };
};

export const resetBrowseCount = async (
  dto: ResetBrowseCountDto
): Promise<ApiResponse<UserSubscription>> => {
  await simulateDelay();
  
  const subIndex = mockUserSubscriptions.findIndex(s => s.id === dto.userSubscriptionId);
  
  if (subIndex === -1) {
    throw new Error('User subscription not found');
  }
  
  mockUserSubscriptions[subIndex].browseCountUsed = 0;
  mockUserSubscriptions[subIndex].lastBrowseResetAt = new Date().toISOString();
  mockUserSubscriptions[subIndex].updatedAt = new Date().toISOString();
  
  return {
    success: true,
    data: mockUserSubscriptions[subIndex],
    message: 'Browse count reset successfully',
    timestamp: new Date().toISOString(),
  };
};

export const suspendSubscription = async (
  dto: SuspendSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  await simulateDelay();
  
  const subIndex = mockUserSubscriptions.findIndex(s => s.id === dto.userSubscriptionId);
  
  if (subIndex === -1) {
    throw new Error('User subscription not found');
  }
  
  mockUserSubscriptions[subIndex].status = 'suspended';
  mockUserSubscriptions[subIndex].notes = dto.reason;
  mockUserSubscriptions[subIndex].updatedAt = new Date().toISOString();
  
  return {
    success: true,
    data: mockUserSubscriptions[subIndex],
    message: 'Subscription suspended successfully',
    timestamp: new Date().toISOString(),
  };
};

export const reactivateSubscription = async (
  subscriptionId: string
): Promise<ApiResponse<UserSubscription>> => {
  await simulateDelay();
  
  const subIndex = mockUserSubscriptions.findIndex(s => s.id === subscriptionId);
  
  if (subIndex === -1) {
    throw new Error('User subscription not found');
  }
  
  // Check if not expired
  const daysRemaining = getDaysRemaining(mockUserSubscriptions[subIndex].endDate);
  if (daysRemaining < 0) {
    throw new Error('Cannot reactivate expired subscription. Please extend first.');
  }
  
  mockUserSubscriptions[subIndex].status = 'active';
  mockUserSubscriptions[subIndex].updatedAt = new Date().toISOString();
  
  return {
    success: true,
    data: mockUserSubscriptions[subIndex],
    message: 'Subscription reactivated successfully',
    timestamp: new Date().toISOString(),
  };
};

export const continueSubscription = async (
  subscriptionId: string,
  durationMonths: number = 1
): Promise<ApiResponse<UserSubscription>> => {
  await simulateDelay();
  
  const subIndex = mockUserSubscriptions.findIndex(s => s.id === subscriptionId);
  
  if (subIndex === -1) {
    throw new Error('User subscription not found');
  }
  
  const subscription = mockUserSubscriptions[subIndex];
  
  // Calculate new end date
  const currentEndDate = new Date(subscription.endDate);
  const newEndDate = new Date(currentEndDate);
  newEndDate.setMonth(newEndDate.getMonth() + durationMonths);
  
  // If subscription is expired, extend from today. Otherwise extend from current end date
  if (getDaysRemaining(subscription.endDate) < 0) {
    const now = new Date();
    newEndDate.setMonth(now.getMonth() + durationMonths);
  }
  
  subscription.endDate = newEndDate.toISOString();
  subscription.status = 'active';
  subscription.notes = `Subscription continued for ${durationMonths} month(s)`;
  subscription.updatedAt = new Date().toISOString();
  
  return {
    success: true,
    data: subscription,
    message: `Subscription continued successfully until ${newEndDate.toLocaleDateString()}`,
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================

export const getSubscriptionStats = async (): Promise<ApiResponse<SubscriptionStats>> => {
  await simulateDelay();
  
  const totalSubscriptions = mockUserSubscriptions.length;
  const activeSubscriptions = mockUserSubscriptions.filter(s => s.status === 'active').length;
  const expiredSubscriptions = mockUserSubscriptions.filter(s => s.status === 'expired').length;
  const suspendedSubscriptions = mockUserSubscriptions.filter(s => s.status === 'suspended').length;
  const expiringSoon = mockUserSubscriptions.filter(s => 
    s.status === 'active' && isExpiringSoon(s.endDate)
  ).length;
  
  const totalPlans = mockSubscriptionPlans.length;
  const activePlans = mockSubscriptionPlans.filter(p => p.isActive).length;
  
  // Calculate revenue projection (active subscriptions only)
  let revenueProjection = 0;
  mockUserSubscriptions
    .filter(s => s.status === 'active')
    .forEach(s => {
      const plan = getSubscriptionPlan(s.subscriptionPlanId);
      if (plan) {
        revenueProjection += plan.price;
      }
    });
  
  const stats: SubscriptionStats = {
    totalSubscriptions,
    activeSubscriptions,
    expiredSubscriptions,
    suspendedSubscriptions,
    expiringSoon,
    totalPlans,
    activePlans,
    revenueProjection,
  };
  
  return {
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  };
};

export const getSubscriptionPlanStats = async (): Promise<ApiResponse<SubscriptionPlanStats[]>> => {
  await simulateDelay();
  
  const planStats: SubscriptionPlanStats[] = mockSubscriptionPlans.map(plan => {
    const activeSubs = mockUserSubscriptions.filter(
      s => s.subscriptionPlanId === plan.id && s.status === 'active'
    );
    
    const activeUsers = activeSubs.length;
    const totalRevenue = activeUsers * plan.price;
    
    const avgBrowseUsage = activeSubs.length > 0
      ? activeSubs.reduce((sum, s) => sum + s.browseCountUsed, 0) / activeSubs.length
      : 0;
    
    const avgListingUsage = activeSubs.length > 0
      ? activeSubs.reduce((sum, s) => sum + s.listingCountUsed, 0) / activeSubs.length
      : 0;
    
    return {
      planId: plan.id,
      planName: plan.displayName,
      activeUsers,
      totalRevenue,
      averageBrowseUsage: Math.round(avgBrowseUsage),
      averageListingUsage: Math.round(avgListingUsage),
    };
  });
  
  return {
    success: true,
    data: planStats,
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// ADMIN SUBSCRIPTION LISTING
// ==========================================

export const getAllUserSubscriptions = async (
  filters?: SubscriptionFilters
): Promise<ApiResponse<PaginatedResponse<UserSubscription>>> => {
  await simulateDelay();
  
  let filtered = [...mockUserSubscriptions];
  
  // Apply filters
  if (filters?.status) {
    filtered = filtered.filter(s => s.status === filters.status);
  }
  
  if (filters?.planId) {
    filtered = filtered.filter(s => s.subscriptionPlanId === filters.planId);
  }
  
  if (filters?.expiringWithinDays) {
    filtered = filtered.filter(s => {
      const days = getDaysRemaining(s.endDate);
      return days >= 0 && days <= filters.expiringWithinDays!;
    });
  }
  
  // Sort by creation date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Pagination
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 20;
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
      hasMore: endIndex < filtered.length,
    },
    timestamp: new Date().toISOString(),
  };
};
