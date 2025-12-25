// Subscription Plan Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  maxBrowseCount: number; // Number of full item detail views per billing period
  maxListingCount: number; // Number of items user can create/list
  listingVisibilityDelayHours: number; // Delay before user sees new listings
  notificationsEnabled: boolean; // Whether notifications are allowed
  isActive: boolean;
  features: string[]; // List of features included in plan
  price: number; // For display only (admin-assigned, no payment)
  billingPeriod: 'monthly' | 'yearly'; // For tracking purposes
  createdAt: string;
  updatedAt: string;
}

// User Subscription Types
export interface UserSubscription {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  planName: string; // Denormalized for display
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'suspended';
  browseCountUsed: number;
  lastBrowseResetAt: string;
  listingCountUsed: number; // Track current listings
  assignedBy: string; // Admin user ID who assigned
  notes?: string; // Admin notes
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'listing_approved' | 'subscription_expiring' | 'browse_limit_warning' | 'listing_limit_reached' | 'subscription_expired' | 'new_feature' | 'system_alert';
  entityId?: string; // Related vehicle/job ID
  entityType?: 'vehicle' | 'job' | 'supplier';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string; // URL to navigate when clicked
  createdAt: string;
  readAt?: string;
}

// Subscription Usage Stats
export interface SubscriptionUsageStats {
  browseCount: {
    used: number;
    allowed: number;
    remaining: number;
    percentage: number;
    limitReached?: boolean;
  };
  listingCount: {
    used: number;
    allowed: number;
    remaining: number;
    percentage: number;
    limitReached?: boolean;
  };
  daysRemaining: number;
  isExpiringSoon: boolean; // Less than 7 days
  isExpired: boolean;
}

// API Request/Response Types
export interface CreateSubscriptionPlanDto {
  name: string;
  displayName: string;
  description: string;
  maxBrowseCount: number;
  maxListingCount: number;
  listingVisibilityDelayHours: number;
  notificationsEnabled: boolean;
  features: string[];
  price: number;
  billingPeriod: 'monthly' | 'yearly';
}

export interface UpdateSubscriptionPlanDto extends Partial<CreateSubscriptionPlanDto> {
  id: string;
  isActive?: boolean;
}

export interface AssignSubscriptionDto {
  userId: string;
  subscriptionPlanId: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface ExtendSubscriptionDto {
  userSubscriptionId: string;
  newEndDate: string;
  notes?: string;
}

export interface ResetBrowseCountDto {
  userSubscriptionId: string;
  reason?: string;
}

export interface SuspendSubscriptionDto {
  userSubscriptionId: string;
  reason: string;
}

export interface CreateNotificationDto {
  userId: string;
  type: Notification['type'];
  entityId?: string;
  entityType?: Notification['entityType'];
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface MarkNotificationReadDto {
  notificationId: string;
}

export interface BulkMarkReadDto {
  notificationIds: string[];
}

// Subscription Enforcement Check Results
export interface BrowseCheckResult {
  allowed: boolean;
  remaining: number;
  limitReached: boolean;
  subscription: UserSubscription | null;
  message?: string;
}

export interface ListingCheckResult {
  allowed: boolean;
  remaining: number;
  limitReached: boolean;
  subscription: UserSubscription | null;
  message?: string;
}

export interface VisibilityCheckResult {
  visible: boolean;
  delayHours: number;
  availableAt: string;
  subscription: UserSubscription | null;
}

// Admin Dashboard Stats
export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  suspendedSubscriptions: number;
  expiringSoon: number; // Expiring within 7 days
  totalPlans: number;
  activePlans: number;
  revenueProjection: number; // Based on active subscriptions
}

export interface SubscriptionPlanStats {
  planId: string;
  planName: string;
  activeUsers: number;
  totalRevenue: number;
  averageBrowseUsage: number;
  averageListingUsage: number;
}

// Filters
export interface SubscriptionFilters {
  status?: UserSubscription['status'];
  planId?: string;
  search?: string; // Search by user name/email
  searchTerm?: string; // Search by user name/email
  expiringWithinDays?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface NotificationFilters {
  type?: Notification['type'];
  isRead?: boolean;
  priority?: Notification['priority'];
  page?: number;
  pageSize?: number;
}
