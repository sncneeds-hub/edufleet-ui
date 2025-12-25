// NOTE: Subscription features are temporarily disabled - backend implementation required
// import { apiClient } from '@/lib/apiClient';
import {
  BrowseCheckResult,
  ListingCheckResult,
  VisibilityCheckResult,
  ApiResponse,
} from '../types';

// ==========================================
// HELPER FUNCTIONS (STUBS)
// ==========================================

const simulateDelay = async (min: number, max: number) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const getUserSubscription = (userId: string) => {
  // Stub: Always return null for now
  return null;
};

const DEFAULT_FREE_PLAN = {
  browseLimit: 10,
  listingLimit: 2,
  notificationLimit: 5,
};

const getSubscriptionPlan = (planId: string) => {
  // Stub: Return default plan
  return DEFAULT_FREE_PLAN;
};

const getDaysRemaining = (expiresAt: string) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ==========================================
// BROWSE LIMIT ENFORCEMENT
// ==========================================

// STUB: Always allows browsing until backend implements subscription limits
export const checkBrowseLimit = async (userId: string): Promise<ApiResponse<BrowseCheckResult>> => {
  return {
    success: true,
    data: {
      allowed: true,
      remaining: 999,
      limitReached: false,
      subscription: null,
      message: 'Browse limit check disabled - backend implementation required',
    },
    timestamp: new Date().toISOString(),
  };
};

export const incrementBrowseCount = async (userId: string): Promise<ApiResponse<{ success: boolean }>> => {
  await simulateDelay(100, 300);
  
  const subscription = getUserSubscription(userId);
  
  if (!subscription || subscription.status !== 'active') {
    return {
      success: true,
      data: { success: false },
      message: 'No active subscription',
      timestamp: new Date().toISOString(),
    };
  }
  
  // Increment counter
  subscription.browseCountUsed += 1;
  subscription.updatedAt = new Date().toISOString();
  
  return {
    success: true,
    data: { success: true },
    message: 'Browse count incremented',
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// LISTING LIMIT ENFORCEMENT
// ==========================================

export const checkListingLimit = async (userId: string): Promise<ApiResponse<ListingCheckResult>> => {
  await simulateDelay(100, 300);
  
  const subscription = getUserSubscription(userId);
  
  // No subscription - use free plan limits
  if (!subscription) {
    return {
      success: true,
      data: {
        allowed: false,
        remaining: DEFAULT_FREE_PLAN.maxListingCount,
        limitReached: true,
        subscription: null,
        message: 'No active subscription. Listing creation not allowed.',
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  // Check if subscription is active
  if (subscription.status !== 'active') {
    return {
      success: true,
      data: {
        allowed: false,
        remaining: 0,
        limitReached: true,
        subscription,
        message: `Subscription is ${subscription.status}. Cannot create listings.`,
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  // Check if expired
  const daysRemaining = getDaysRemaining(subscription.endDate);
  if (daysRemaining < 0) {
    subscription.status = 'expired';
    return {
      success: true,
      data: {
        allowed: false,
        remaining: 0,
        limitReached: true,
        subscription,
        message: 'Subscription has expired. Cannot create listings.',
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  const plan = getSubscriptionPlan(subscription.subscriptionPlanId);
  
  if (!plan) {
    return {
      success: true,
      data: {
        allowed: false,
        remaining: 0,
        limitReached: true,
        subscription,
        message: 'Subscription plan not found.',
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  const remaining = plan.maxListingCount - subscription.listingCountUsed;
  const limitReached = remaining <= 0;
  
  return {
    success: true,
    data: {
      allowed: !limitReached,
      remaining: Math.max(0, remaining),
      limitReached,
      subscription,
      message: limitReached 
        ? `Listing limit reached (${plan.maxListingCount}). Please contact admin to upgrade.` 
        : undefined,
    },
    timestamp: new Date().toISOString(),
  };
};

export const incrementListingCount = async (userId: string): Promise<ApiResponse<{ success: boolean }>> => {
  await simulateDelay(100, 300);
  
  const subscription = getUserSubscription(userId);
  
  if (!subscription || subscription.status !== 'active') {
    return {
      success: true,
      data: { success: false },
      message: 'No active subscription',
      timestamp: new Date().toISOString(),
    };
  }
  
  subscription.listingCountUsed += 1;
  subscription.updatedAt = new Date().toISOString();
  
  return {
    success: true,
    data: { success: true },
    message: 'Listing count incremented',
    timestamp: new Date().toISOString(),
  };
};

export const decrementListingCount = async (userId: string): Promise<ApiResponse<{ success: boolean }>> => {
  await simulateDelay(100, 300);
  
  const subscription = getUserSubscription(userId);
  
  if (!subscription) {
    return {
      success: true,
      data: { success: false },
      message: 'No subscription found',
      timestamp: new Date().toISOString(),
    };
  }
  
  if (subscription.listingCountUsed > 0) {
    subscription.listingCountUsed -= 1;
    subscription.updatedAt = new Date().toISOString();
  }
  
  return {
    success: true,
    data: { success: true },
    message: 'Listing count decremented',
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// LISTING VISIBILITY ENFORCEMENT
// ==========================================

export const checkListingVisibility = async (
  listingCreatedAt: string,
  userId: string
): Promise<ApiResponse<VisibilityCheckResult>> => {
  await simulateDelay(100, 300);
  
  const subscription = getUserSubscription(userId);
  
  // No subscription - use free plan delay
  if (!subscription) {
    const delayHours = DEFAULT_FREE_PLAN.listingVisibilityDelayHours;
    const createdTime = new Date(listingCreatedAt).getTime();
    const availableTime = createdTime + (delayHours * 60 * 60 * 1000);
    const now = Date.now();
    const visible = now >= availableTime;
    
    return {
      success: true,
      data: {
        visible,
        delayHours,
        availableAt: new Date(availableTime).toISOString(),
        subscription: null,
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  // Inactive subscription - default to highest delay
  if (subscription.status !== 'active') {
    return {
      success: true,
      data: {
        visible: false,
        delayHours: 168,
        availableAt: new Date(Date.now() + 168 * 60 * 60 * 1000).toISOString(),
        subscription,
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  const plan = getSubscriptionPlan(subscription.subscriptionPlanId);
  
  if (!plan) {
    return {
      success: true,
      data: {
        visible: false,
        delayHours: 168,
        availableAt: new Date(Date.now() + 168 * 60 * 60 * 1000).toISOString(),
        subscription,
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  const delayHours = plan.listingVisibilityDelayHours;
  const createdTime = new Date(listingCreatedAt).getTime();
  const availableTime = createdTime + (delayHours * 60 * 60 * 1000);
  const now = Date.now();
  const visible = now >= availableTime;
  
  return {
    success: true,
    data: {
      visible,
      delayHours,
      availableAt: new Date(availableTime).toISOString(),
      subscription,
    },
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// NOTIFICATION PERMISSION CHECK
// ==========================================

export const checkNotificationPermission = async (
  userId: string
): Promise<ApiResponse<{ allowed: boolean; subscription: any }>> => {
  await simulateDelay(100, 300);
  
  const subscription = getUserSubscription(userId);
  
  if (!subscription || subscription.status !== 'active') {
    return {
      success: true,
      data: {
        allowed: false,
        subscription,
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  const plan = getSubscriptionPlan(subscription.subscriptionPlanId);
  
  if (!plan) {
    return {
      success: true,
      data: {
        allowed: false,
        subscription,
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    success: true,
    data: {
      allowed: plan.notificationsEnabled,
      subscription,
    },
    timestamp: new Date().toISOString(),
  };
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

export const filterListingsByVisibility = async <T extends { id: string; createdAt: string }>(
  listings: T[],
  userId: string
): Promise<ApiResponse<T[]>> => {
  await simulateDelay(100, 300);
  
  const subscription = getUserSubscription(userId);
  let delayHours = DEFAULT_FREE_PLAN.listingVisibilityDelayHours;
  
  if (subscription && subscription.status === 'active') {
    const plan = getSubscriptionPlan(subscription.subscriptionPlanId);
    if (plan) {
      delayHours = plan.listingVisibilityDelayHours;
    }
  }
  
  const now = Date.now();
  
  const filtered = listings.filter(listing => {
    const createdTime = new Date(listing.createdAt).getTime();
    const availableTime = createdTime + (delayHours * 60 * 60 * 1000);
    return now >= availableTime;
  });
  
  return {
    success: true,
    data: filtered,
    message: `Filtered ${listings.length - filtered.length} items based on visibility delay`,
    timestamp: new Date().toISOString(),
  };
};
