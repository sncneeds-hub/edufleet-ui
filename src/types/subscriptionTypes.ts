// Subscription Plan Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  planType: 'teacher' | 'institute' | 'vendor';
  price: number;
  currency: string;
  duration: number; // in days
  features: {
    maxListings: number;
    maxJobPosts: number;
    maxBrowsesPerMonth: number;
    dataDelayDays: number;
    teacherDataDelayDays: number;
    canAdvertiseVehicles: boolean;
    instantVehicleAlerts: boolean;
    instantJobAlerts: boolean;
    priorityListings: boolean;
    analytics: boolean;
    supportLevel: 'basic' | 'priority' | 'premium';
  };
  isActive: boolean;
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
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  browseCountUsed: number;
  lastBrowseResetAt: string;
  listingCountUsed: number; // Track current listings
  jobPostsUsed: number;
  assignedBy: string; // Admin user ID who assigned
  notes?: string; // Admin notes
  createdAt: string;
  updatedAt: string;
  
  // UI Display fields (joined)
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type:
    | 'approval'
    | 'rejection'
    | 'priority'
    | 'message'
    | 'system'
    | 'listing_approved'
    | 'listing_rejected'
    | 'subscription_expiring'
    | 'browse_limit_warning'
    | 'listing_limit_reached'
    | 'subscription_expired'
    | 'new_feature'
    | 'system_alert';
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
  jobPostsCount: {
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
  planType: 'teacher' | 'institute' | 'vendor';
  price: number;
  currency?: string;
  duration: number;
  features: {
    maxListings: number;
    maxJobPosts: number;
    maxBrowsesPerMonth: number;
    dataDelayDays: number;
    teacherDataDelayDays: number;
    canAdvertiseVehicles: boolean;
    instantVehicleAlerts: boolean;
    instantJobAlerts: boolean;
    priorityListings: boolean;
    analytics: boolean;
    supportLevel: 'basic' | 'priority' | 'premium';
  };
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
  paymentStatus?: 'pending' | 'completed' | 'failed';
  transactionId?: string;
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

export interface JobPostCheckResult {
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
  averageJobPostUsage: number;
}

// Subscription Request Types
export interface SubscriptionRequest {
  id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  currentPlanId: string;
  currentPlan?: {
    displayName: string;
    name: string;
  };
  requestedPlanId: string;
  requestedPlan?: {
    displayName: string;
    name: string;
  };
  requestType: 'upgrade' | 'downgrade' | 'renewal';
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  userNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequestDto {
  requestedPlanId: string;
  requestType: 'upgrade' | 'downgrade' | 'renewal';
  userNotes?: string;
}

export interface UpdateSubscriptionRequestDto {
  status: 'approved' | 'rejected';
  adminNotes?: string;
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
