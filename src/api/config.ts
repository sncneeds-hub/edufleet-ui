// API Configuration
export const API_CONFIG = {
  // Base URL for API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 12,
  
  // API endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    
    // Vehicles
    VEHICLES: '/vehicles',
    VEHICLE_BY_ID: (id: string) => `/vehicles/${id}`,
    PRIORITY_LISTINGS: '/vehicles/priority',
    RECENT_LISTINGS: '/vehicles/recent',
    MY_LISTINGS: '/vehicles/my/listings',
    
    // Jobs
    JOBS: '/jobs',
    JOB_BY_ID: (id: string) => `/jobs/${id}`,
    MY_JOBS: '/jobs/my/listings',
    JOB_APPLICATIONS: (jobId: string) => `/jobs/${jobId}/applications`,
    MY_JOB_APPLICATIONS: '/jobs/applications/my',
    APPLY_TO_JOB: (jobId: string) => `/jobs/${jobId}/apply`,
    UPDATE_APPLICATION: (appId: string) => `/jobs/applications/${appId}/status`,
    
    // Suppliers
    SUPPLIERS: '/suppliers',
    SUPPLIER_BY_ID: (id: string) => `/suppliers/${id}`,
    MY_SUPPLIERS: '/suppliers/my/listings',
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    NOTIFICATION_BY_ID: (id: string) => `/notifications/${id}`,
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    
    // Admin
    ADMIN_STATS: '/admin/stats',
    ADMIN_PENDING: '/admin/pending',
    ADMIN_APPROVE: '/admin/approve',
    ADMIN_TOGGLE_PRIORITY: '/admin/toggle-priority',
    
    // Upload
    UPLOAD_SINGLE: '/upload/single',
    UPLOAD_MULTIPLE: '/upload/multiple',
    
    // Subscriptions
    SUBSCRIPTION_PLANS: '/subscriptions/plans',
    SUBSCRIPTION_PLAN_BY_ID: (id: string) => `/subscriptions/plans/${id}`,
    USER_SUBSCRIPTION: (userId: string) => `/subscriptions/user/${userId}`,
    SUBSCRIPTION_ASSIGN: '/subscriptions/assign',
    SUBSCRIPTION_EXTEND: (id: string) => `/subscriptions/${id}/extend`,
    SUBSCRIPTION_STATS: '/subscriptions/stats',
    SUBSCRIPTION_USAGE: (userId: string) => `/subscriptions/user/${userId}/usage`,
  },
};
