import { simulateDelay } from '../config';
import {
  BrowseCheckResult,
  ListingCheckResult,
  VisibilityCheckResult,
  ApiResponse,
} from '../types';
import {
  getUserSubscription,
  getSubscriptionPlan,
  getDaysRemaining,
  DEFAULT_FREE_PLAN,
} from '../../mock/subscriptionData';
import { mockUserSubscriptions } from '../../mock/subscriptionData';

// ==========================================
// BROWSE LIMIT ENFORCEMENT
// ==========================================

export const checkBrowseLimit = async (userId: string): Promise<ApiResponse<BrowseCheckResult>> => {
  await simulateDelay(100, 300); // Faster for checks
  
  const subscription = getUserSubscription(userId);
  
  // No subscription - use free plan limits
  if (!subscription) {
    return {
      success: true,
      data: {
        allowed: false,
        remaining: DEFAULT_FREE_PLAN.maxBrowseCount,
        limitReached: true,
        subscription: null,
        message: 'No active subscription. Please contact admin to get access.',
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
        message: `Subscription is ${subscription.status}. Please contact admin.`,
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  // Check if expired
  const daysRemaining = getDaysRemaining(subscription.endDate);
  if (daysRemaining < 0) {
    // Auto-expire the subscription
    subscription.status = 'expired';
    return {
      success: true,
      data: {
        allowed: false,
        remaining: 0,
        limitReached: true,
        subscription,
        message: 'Subscription has expired. Please contact admin to renew.',
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
  
  const remaining = plan.maxBrowseCount - subscription.browseCountUsed;
  const limitReached = remaining <= 0;
  
  return {
    success: true,
    data: {
      allowed: !limitReached,
      remaining: Math.max(0, remaining),
      limitReached,
      subscription,
      message: limitReached 
        ? 'Browse limit reached for this period. Please contact admin to upgrade.' 
        : undefined,
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
