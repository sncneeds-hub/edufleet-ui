export interface User {
  id: string
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
  id: string
  userId: string
  instituteName: string
  registrationNumber: string
  instituteAddress: string
  institutePhone: string
  instituteEmail: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  id: string
  instituteId: string
  instituteName: string
  vehicleType: 'bus' | 'van' | 'minibus' | 'car' | 'other'
  brand: string
  model: string
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
  createdAt: string
  updatedAt: string
}

export interface ContactInquiry {
  id: string
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
