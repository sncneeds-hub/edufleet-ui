import { useEffect, useState, ReactNode } from 'react'
import { blink } from '@/lib/blink'
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
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      const userData = state.user as User | null
      setUser(userData)
      setIsLoading(state.isLoading)
      setIsAuthenticated(state.isAuthenticated)

      // Persist auth state and user data to session
      SessionManager.saveAuthState(state.isAuthenticated, state.isLoading)
      if (userData) {
        SessionManager.saveUser(userData)
      }
    })
    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    const userData = await blink.auth.signInWithEmail(email, password)
    setUser(userData as User)
    return userData
  }

  const signUp = async (email: string, password: string, role: 'admin' | 'school', displayName: string) => {
    const userData = await blink.auth.signUp({
      email,
      password,
      displayName,
      metadata: {
        role,
        approvalStatus: role === 'school' ? 'pending' : 'approved'
      }
    } as any)
    setUser(userData as User)
    return userData
  }

  const signOut = async () => {
    await blink.auth.logout()
    setUser(null)
    // Clear all persisted session data on logout
    SessionManager.clearAll()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
