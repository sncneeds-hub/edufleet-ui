import '@blinkdotnew/sdk'

declare module '@blinkdotnew/sdk' {
  interface BlinkDatabase {
    institutes: {
      create: (data: any) => Promise<any>
      list: (options?: any) => Promise<any[]>
      update: (id: string, data: any) => Promise<any>
      delete: (id: string) => Promise<void>
    }
    vehicles: {
      create: (data: any) => Promise<any>
      list: (options?: any) => Promise<any[]>
      update: (id: string, data: any) => Promise<any>
      delete: (id: string) => Promise<void>
    }
    contactInquiries: {
      create: (data: any) => Promise<any>
      list: (options?: any) => Promise<any[]>
      update: (id: string, data: any) => Promise<any>
      delete: (id: string) => Promise<void>
    }
  }

  // Extend SignUpData to include displayName
  interface SignUpData {
    email: string
    password: string
    displayName?: string
    role?: string
    metadata?: Record<string, any>
  }
}
