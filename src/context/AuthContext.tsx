import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authService, User } from '@/api/services/authService';
import { 
  getUserSubscription, 
  getActiveSubscriptionPlans, 
  getSubscriptionUsageStats 
} from '@/api/services/subscriptionService';
import { toast } from 'sonner';

export interface TeacherSignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  qualifications: string[];
  experience: number;
  subjects: string[];
  bio?: string;
  location: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: {
    data: any;
    plans: any[];
    stats: any;
    loading: boolean;
  };
  login: (email: string, password: string, role: 'institute' | 'admin' | 'teacher', otp?: string) => Promise<void>;
  signup: (name: string, email: string, password: string, instituteName: string, contactPerson: string, instituteCode: string, phone: string, otp?: string) => Promise<void>;
  signupTeacher: (data: TeacherSignupData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => string | null;
  refreshToken: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  ensureSubscription: (force?: boolean) => Promise<void> | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<{
    data: any;
    plans: any[];
    stats: any;
    loading: boolean;
    hasLoaded: boolean;
  }>({
    data: null,
    plans: [],
    stats: null,
    loading: false,
    hasLoaded: false
  });

  const isFetchingSubscription = useRef(false);

  const loadSubscriptionData = useCallback(async (userId: string, force = false) => {
    // Guard against undefined/null userId
    if (!userId) {
      console.warn('[AuthContext] loadSubscriptionData called with no userId');
      return;
    }
    
    // If already fetching and not forced, don't trigger another fetch
    if (isFetchingSubscription.current && !force) return;
    
    // Use a ref-based check to avoid stale closure issues
    // We'll use a promise-based pattern to get current state
    let shouldFetch = force;
    
    if (!force) {
      // Check current state synchronously using a getter pattern
      await new Promise<void>((resolve) => {
        setSubscription(prev => {
          if (prev.hasLoaded) {
            shouldFetch = false;
          } else {
            shouldFetch = true;
          }
          resolve();
          return { ...prev, loading: shouldFetch };
        });
      });
      
      if (!shouldFetch) return;
    } else {
      // Force mode - mark as loading
      setSubscription(prev => ({ ...prev, loading: true }));
    }

    try {
      isFetchingSubscription.current = true;
      
      // Fetch each piece of data independently to ensure one failure doesn't block others
      const [subscriptionResponse, plansResponse, statsResponse] = await Promise.allSettled([
        getUserSubscription(userId),
        getActiveSubscriptionPlans(force), // Force refresh plans too
        getSubscriptionUsageStats(userId)
      ]);

      setSubscription({
        data: subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.success 
          ? subscriptionResponse.value.data 
          : null,
        plans: plansResponse.status === 'fulfilled' && plansResponse.value.success 
          ? plansResponse.value.data 
          : [],
        stats: statsResponse.status === 'fulfilled' && statsResponse.value.success 
          ? statsResponse.value.data 
          : null,
        loading: false,
        hasLoaded: true
      });
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      setSubscription(prev => ({ ...prev, loading: false, hasLoaded: true }));
    } finally {
      isFetchingSubscription.current = false;
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (user?.id) {
      await loadSubscriptionData(user.id, true);
    }
  }, [user?.id, loadSubscriptionData]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const token = authService.getStoredToken();

        if (token) {
          try {
            // Get fresh user data instead of just validating
            const freshUser = await authService.getCurrentUser();
            if (freshUser) {
              setUser(freshUser);
              // Update local storage with fresh data
              localStorage.setItem('user', JSON.stringify(freshUser));
              // Fetch subscription data immediately after restoring session
              loadSubscriptionData(freshUser.id, true);
            } else {
              throw new Error('No user data returned');
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            // Token invalid or request failed, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          // No token, clear any stale user data
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [loadSubscriptionData]);

  const login = async (email: string, password: string, role: 'institute' | 'admin' | 'teacher', otp?: string) => {
    try {
      setIsLoading(true);
      // Traditional login (OTP verification can be added later if needed)
      const response = await authService.login({ email, password });
      
      setUser(response.user);
      // Fetch subscription data after login
      loadSubscriptionData(response.user.id, true);
      toast.success('Login successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, instituteName: string, contactPerson: string, instituteCode: string, phone: string, otp?: string) => {
    try {
      setIsLoading(true);
      // Traditional signup (OTP verification can be added later if needed)
      const response = await authService.signup({
        name,
        email,
        password,
        role: 'institute',
        instituteName,
        contactPerson,
        instituteCode,
        phone,
      });
      
      setUser(response.user);
      // Fetch subscription data after signup
      loadSubscriptionData(response.user.id, true);
      toast.success('Signup successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signupTeacher = async (data: TeacherSignupData) => {
    try {
      setIsLoading(true);
      const response = await authService.signupTeacher({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        qualifications: data.qualifications,
        experience: data.experience,
        subjects: data.subjects,
        bio: data.bio,
        location: data.location,
      });
      setUser(response.user);
      // Fetch subscription data after teacher signup
      loadSubscriptionData(response.user.id, true);
      toast.success('Teacher signup successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) return;
      
      const response = await authService.updateProfile(data);
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, []);

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setSubscription({ data: null, plans: [], stats: null, loading: false, hasLoaded: false });
      toast.success('Logged out successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = (): string | null => {
    return authService.getStoredToken();
  };

  const refreshToken = async () => {
    try {
      // Validate token instead of refreshing (refresh can be added if backend supports it)
      const isValid = await authService.validateToken();
      if (!isValid) {
        await logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      await logout();
    }
  };

  const ensureSubscription = useCallback((force?: boolean) => {
    if (user?.id) {
      return loadSubscriptionData(user.id, force);
    }
  }, [user?.id, loadSubscriptionData]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      subscription,
      login, 
      signup, 
      signupTeacher, 
      updateProfile, 
      refreshProfile,
      logout,
      getToken,
      refreshToken,
      refreshSubscription,
      ensureSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};