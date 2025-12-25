// API Request/Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  title: string;
  manufacturer: string;
  model: string;
  year: number;
  type: 'school-bus' | 'minibus' | 'van' | 'truck';
  price: number;
  registrationNumber: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  features: string[];
  images: string[];
  description: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  isPriority: boolean;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  insurance?: {
    valid: boolean;
    expiryDate?: string;
    provider?: string;
  };
  fitness?: {
    valid: boolean;
    expiryDate?: string;
  };
  roadTax?: {
    valid: boolean;
    expiryDate?: string;
  };
  permit?: {
    valid: boolean;
    expiryDate?: string;
    type?: string;
  };
}

export interface VehicleFilters {
  searchTerm?: string;
  type?: string;
  manufacturer?: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  condition?: string;
  status?: 'pending' | 'approved' | 'rejected';
  isPriority?: boolean;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateVehicleDto {
  title: string;
  manufacturer: string;
  model: string;
  year: number;
  type: 'school-bus' | 'minibus' | 'van' | 'truck';
  price: number;
  registrationNumber: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  features: string[];
  images: string[];
  description: string;
  insurance?: {
    valid: boolean;
    expiryDate?: string;
    provider?: string;
  };
  fitness?: {
    valid: boolean;
    expiryDate?: string;
  };
  roadTax?: {
    valid: boolean;
    expiryDate?: string;
  };
  permit?: {
    valid: boolean;
    expiryDate?: string;
    type?: string;
  };
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {
  id: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  role: 'institute' | 'admin';
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  instituteName: string;
  contactPerson: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'institute' | 'admin';
  instituteName?: string;
  contactPerson?: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Admin Types
export interface VehicleStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  priorityListings: number;
}

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  pendingApprovals: number;
  totalViews: number;
}

export interface ApprovalRequest {
  vehicleId: string;
  status: 'approved' | 'rejected';
  reason?: string;
}

export interface PriorityToggleRequest {
  vehicleId: string;
  isPriority: boolean;
}

// Upload Types
export interface UploadImageRequest {
  file: File;
  vehicleId?: string;
}

export interface UploadImageResponse {
  url: string;
  filename: string;
  size: number;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  category: 'edutech' | 'stationery' | 'furniture' | 'technology' | 'sports' | 'library' | 'lab-equipment' | 'other';
  description: string;
  services: string[];
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  logo?: string;
  certifications?: string[];
  yearsInBusiness?: number;
  clientCount?: number;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  category: 'edutech' | 'stationery' | 'furniture' | 'technology' | 'sports' | 'library' | 'lab-equipment' | 'other';
  description: string;
  services: string[];
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  logo?: string;
  certifications?: string[];
  yearsInBusiness?: number;
  clientCount?: number;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {
  id: string;
}

export interface SupplierFilters {
  searchTerm?: string;
  category?: string;
  isVerified?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  pageSize?: number;
}

export interface SupplierStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  verified: number;
}

// Re-export subscription types
export type {
  SubscriptionPlan,
  UserSubscription,
  Notification,
  SubscriptionUsageStats,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  AssignSubscriptionDto,
  ExtendSubscriptionDto,
  ResetBrowseCountDto,
  SuspendSubscriptionDto,
  CreateNotificationDto,
  MarkNotificationReadDto,
  BulkMarkReadDto,
  BrowseCheckResult,
  ListingCheckResult,
  VisibilityCheckResult,
  SubscriptionStats,
  SubscriptionPlanStats,
  SubscriptionFilters,
  NotificationFilters,
} from '../types/subscriptionTypes';
