// API Configuration
export const API_CONFIG = {
  // Base URL for API (mock for now)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Simulated network delay (milliseconds)
  MOCK_DELAY: {
    MIN: 100,
    MAX: 300,
  },
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 12,
  
  // Enable mock mode (set to false to use real backend)
  MOCK_MODE: true,
  
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
    MY_LISTINGS: '/vehicles/my-listings',
    
    // Admin
    ADMIN_STATS: '/admin/stats',
    ADMIN_PENDING: '/admin/pending',
    ADMIN_APPROVE: '/admin/approve',
    ADMIN_TOGGLE_PRIORITY: '/admin/toggle-priority',
  },
};

// Simulated network delay
export const simulateDelay = (min = API_CONFIG.MOCK_DELAY.MIN, max = API_CONFIG.MOCK_DELAY.MAX): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};
