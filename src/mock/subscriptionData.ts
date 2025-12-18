import { SubscriptionPlan, UserSubscription } from '../types/subscriptionTypes';

// Predefined Subscription Plans
export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    name: 'basic',
    displayName: 'Basic Plan',
    description: 'Entry-level access for occasional users',
    maxBrowseCount: 10,
    maxListingCount: 2,
    listingVisibilityDelayHours: 168, // 7 days
    notificationsEnabled: false,
    isActive: true,
    features: [
      '10 item views per month',
      'List up to 2 items',
      'See listings after 7 days',
      'No notifications',
      'Email support',
    ],
    price: 0,
    billingPeriod: 'monthly',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'plan-standard',
    name: 'standard',
    displayName: 'Standard Plan',
    description: 'Perfect for regular users and small institutes',
    maxBrowseCount: 50,
    maxListingCount: 10,
    listingVisibilityDelayHours: 24, // 1 day
    notificationsEnabled: true,
    isActive: true,
    features: [
      '50 item views per month',
      'List up to 10 items',
      'See listings after 24 hours',
      'Email notifications',
      'Priority email support',
      'Verification badge',
    ],
    price: 499,
    billingPeriod: 'monthly',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'plan-premium',
    name: 'premium',
    displayName: 'Premium Plan',
    description: 'Unlimited access for power users and large institutes',
    maxBrowseCount: 999999,
    maxListingCount: 50,
    listingVisibilityDelayHours: 0, // Instant
    notificationsEnabled: true,
    isActive: true,
    features: [
      'Unlimited item views',
      'List up to 50 items',
      'Instant listing visibility',
      'Real-time notifications',
      'Priority listings (coming soon)',
      'Dedicated account manager',
      'Phone support',
      'Verification badge',
    ],
    price: 1999,
    billingPeriod: 'monthly',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'plan-enterprise',
    name: 'enterprise',
    displayName: 'Enterprise Plan',
    description: 'Custom solution for large organizations',
    maxBrowseCount: 999999,
    maxListingCount: 999999,
    listingVisibilityDelayHours: 0,
    notificationsEnabled: true,
    isActive: true,
    features: [
      'Unlimited everything',
      'Instant visibility',
      'Custom integrations',
      'API access',
      'White-label options',
      'Dedicated support team',
      'SLA guarantee',
      'Custom training',
    ],
    price: 9999,
    billingPeriod: 'monthly',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

// Mock User Subscriptions
export const mockUserSubscriptions: UserSubscription[] = [
  {
    id: 'sub-1',
    userId: 'inst-1', // Active listings institute
    subscriptionPlanId: 'plan-premium',
    planName: 'Premium Plan',
    startDate: new Date('2024-11-01').toISOString(),
    endDate: new Date('2025-11-01').toISOString(),
    status: 'active',
    browseCountUsed: 25,
    lastBrowseResetAt: new Date('2024-12-01').toISOString(),
    listingCountUsed: 8,
    assignedBy: 'admin-1',
    notes: 'Valued customer - premium access',
    createdAt: new Date('2024-11-01').toISOString(),
    updatedAt: new Date('2024-12-10').toISOString(),
  },
  {
    id: 'sub-2',
    userId: 'inst-7', // Pending listings institute
    subscriptionPlanId: 'plan-standard',
    planName: 'Standard Plan',
    startDate: new Date('2024-10-01').toISOString(),
    endDate: new Date('2025-01-01').toISOString(),
    status: 'active',
    browseCountUsed: 35,
    lastBrowseResetAt: new Date('2024-12-01').toISOString(),
    listingCountUsed: 5,
    assignedBy: 'admin-1',
    notes: 'Trial period - standard access',
    createdAt: new Date('2024-10-01').toISOString(),
    updatedAt: new Date('2024-12-10').toISOString(),
  },
  {
    id: 'sub-3',
    userId: 'teacher-1',
    subscriptionPlanId: 'plan-basic',
    planName: 'Basic Plan',
    startDate: new Date('2024-12-01').toISOString(),
    endDate: new Date('2025-01-01').toISOString(),
    status: 'active',
    browseCountUsed: 8,
    lastBrowseResetAt: new Date('2024-12-01').toISOString(),
    listingCountUsed: 0,
    assignedBy: 'admin-1',
    notes: 'Basic access for job browsing',
    createdAt: new Date('2024-12-01').toISOString(),
    updatedAt: new Date('2024-12-05').toISOString(),
  },
  {
    id: 'sub-4',
    userId: 'inst-expired',
    subscriptionPlanId: 'plan-standard',
    planName: 'Standard Plan',
    startDate: new Date('2024-06-01').toISOString(),
    endDate: new Date('2024-12-01').toISOString(),
    status: 'expired',
    browseCountUsed: 50,
    lastBrowseResetAt: new Date('2024-11-01').toISOString(),
    listingCountUsed: 10,
    assignedBy: 'admin-1',
    notes: 'Expired - needs renewal',
    createdAt: new Date('2024-06-01').toISOString(),
    updatedAt: new Date('2024-12-01').toISOString(),
  },
  {
    id: 'sub-5',
    userId: 'inst-suspended',
    subscriptionPlanId: 'plan-premium',
    planName: 'Premium Plan',
    startDate: new Date('2024-09-01').toISOString(),
    endDate: new Date('2025-09-01').toISOString(),
    status: 'suspended',
    browseCountUsed: 100,
    lastBrowseResetAt: new Date('2024-12-01').toISOString(),
    listingCountUsed: 15,
    assignedBy: 'admin-1',
    notes: 'Suspended due to policy violation',
    createdAt: new Date('2024-09-01').toISOString(),
    updatedAt: new Date('2024-11-15').toISOString(),
  },
];

// Helper function to get subscription by user ID
export const getUserSubscription = (userId: string): UserSubscription | null => {
  return mockUserSubscriptions.find(sub => sub.userId === userId) || null;
};

// Helper function to get plan by ID
export const getSubscriptionPlan = (planId: string): SubscriptionPlan | null => {
  return mockSubscriptionPlans.find(plan => plan.id === planId) || null;
};

// Helper function to get active plans
export const getActivePlans = (): SubscriptionPlan[] => {
  return mockSubscriptionPlans.filter(plan => plan.isActive);
};

// Helper function to calculate days remaining
export const getDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Helper function to check if subscription is expiring soon
export const isExpiringSoon = (endDate: string): boolean => {
  return getDaysRemaining(endDate) <= 7 && getDaysRemaining(endDate) > 0;
};

// Default free plan for users without subscription
export const DEFAULT_FREE_PLAN: SubscriptionPlan = {
  id: 'plan-free',
  name: 'free',
  displayName: 'Free (Limited Access)',
  description: 'Guest access with severe limitations',
  maxBrowseCount: 3,
  maxListingCount: 0,
  listingVisibilityDelayHours: 168,
  notificationsEnabled: false,
  isActive: true,
  features: [
    '3 item views per month',
    'No listing creation',
    'Masked details',
    'No notifications',
  ],
  price: 0,
  billingPeriod: 'monthly',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
