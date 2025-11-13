import { useEffect, useState, ReactNode } from 'react'
import { api } from '@/lib/api'
import { User } from '@/types'
import { SessionManager } from '@/lib/session'
import { AuthContext } from './auth-context'

export { AuthContext } from './auth-context'
export type { AuthContextType } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Restore user from session on mount
    return SessionManager.getUser()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const userData = await api.auth.me()
          const userWithMetadata = {
            ...userData,
            id: userData.id,
            email: userData.email,
            displayName: userData.displayName,
            role: userData.role,
            metadata: userData.metadata,
          } as User
          setUser(userWithMetadata)
          setIsAuthenticated(true)
          SessionManager.saveUser(userWithMetadata)
          SessionManager.saveAuthState(true, false)
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('authToken')
          setUser(null)
          setIsAuthenticated(false)
          SessionManager.clearAll()
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { user: userData, token } = await api.auth.login(email, password)
    const userWithMetadata = {
      ...userData,
      id: userData.id,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      metadata: userData.metadata,
    } as User
    setUser(userWithMetadata)
    setIsAuthenticated(true)
    SessionManager.saveUser(userWithMetadata)
    SessionManager.saveAuthState(true, false)
    return userWithMetadata
  }

  const signUp = async (email: string, password: string, role: 'admin' | 'school', displayName: string, subscriptionPlan?: 'Silver' | 'Gold' | 'Platinum') => {
    const { user: userData, token } = await api.auth.signup({
      email,
      password,
      displayName,
      role,
      subscriptionPlan,
    })
    const userWithMetadata = {
      ...userData,
      id: userData.id,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      metadata: userData.metadata,
    } as User
    setUser(userWithMetadata)
    setIsAuthenticated(true)
    SessionManager.saveUser(userWithMetadata)
    SessionManager.saveAuthState(true, false)
    return userWithMetadata
  }

  const signOut = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      // Ignore logout errors, just clear local state
    }
    setUser(null)
    setIsAuthenticated(false)
    // Clear all persisted session data on logout
    SessionManager.clearAll()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
