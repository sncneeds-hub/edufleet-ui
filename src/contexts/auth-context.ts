import { createContext } from 'react'
import { User } from '@/types'

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<User | undefined>
  signUp: (email: string, password: string, role: 'admin' | 'school', displayName: string, subscriptionPlan?: 'Silver' | 'Gold' | 'Platinum') => Promise<User | undefined>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
