export interface User {
  _id: string
  id?: string // Legacy support for backward compatibility
  email: string
  displayName?: string
  role: 'admin' | 'school'
  avatar?: string
  metadata?: {
    instituteName?: string
    instituteAddress?: string
    institutePhone?: string
    registrationNumber?: string
    approvalStatus?: 'pending' | 'approved' | 'rejected'
  }
}

export interface Institute {
  _id: string
  id?: string // Legacy support for backward compatibility
  userId: string
  instituteName: string
  registrationNumber: string
  instituteAddress: string
  institutePhone: string
  instituteEmail: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  isPriorityUser?: boolean
  priorityExpiresAt?: string
  priorityStartedAt?: string
  subscriptionPlan?: 'Silver' | 'Gold' | 'Platinum'
  subscriptionStatus?: 'active' | 'inactive' | 'expired' | 'cancelled'
  subscriptionStartDate?: string
  subscriptionEndDate?: string
  isVerified?: boolean
  verificationDate?: string
  verificationExpiresAt?: string
  verificationDocuments?: string[]
  createdAt: string
  updatedAt: string
}

export interface VerificationStatus {
  isVerified: boolean
  verificationDate?: string
  expiresAt?: string
  needsRenewal?: boolean
}

export interface VerificationOrder {
  orderId: string
  amount: number
  currency: string
  keyId: string
  verificationType: 'oneTime' | 'renewal'
  description: string
}

export interface Vehicle {
  _id: string
  id?: string // Legacy support for backward compatibility
  instituteId: string
  instituteName: string
  instituteVerified?: boolean
  instituteVerificationExpiresAt?: string
  vehicleType: 'bus' | 'van' | 'minibus' | 'car' | 'other'
  brand: string
  model: string
  vehicleModel?: string // Alternative property name from backend
  year: number
  registrationNumber: string
  seatingCapacity: number
  fuelType: 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid'
  mileage: number
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair'
  price: number
  description: string
  features: string[] | string
  images: string[] | string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  soldStatus: 'available' | 'sold'
  isPromotedAd?: boolean
  isFeatured?: boolean
  featuredUntil?: string
  adPlacements?: ('landing' | 'browse' | 'detail')[]
  adPrice?: number
  totalViews?: number
  totalClicks?: number
  adBudget?: number
  adSpent?: number
  isPlaceholder?: boolean
  createdAt: string
  updatedAt: string
}

export interface ContactInquiry {
  _id: string
  id?: string // Legacy support for backward compatibility
  vehicleId: string
  vehicleBrand?: string
  vehicleModel?: string
  vehiclePrice?: number
  senderInstituteId: string
  senderInstituteName: string
  senderEmail: string
  senderPhone: string
  receiverInstituteId: string
  message: string
  status: 'unread' | 'read' | 'replied'
  replyMessage?: string
  repliedAt?: string
  createdAt: string
  updatedAt?: string
}
