import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '@/api/services/authService';
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
  login: (email: string, password: string, role: 'institute' | 'admin' | 'teacher', otp?: string) => Promise<void>;
  signup: (name: string, email: string, password: string, instituteName: string, contactPerson: string, instituteCode: string, phone: string, otp?: string) => Promise<void>;
  signupTeacher: (data: TeacherSignupData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => string | null;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const token = authService.getStoredToken();

        if (storedUser && token) {
          // Validate token
          const isValid = await authService.validateToken();
          if (isValid) {
            setUser(storedUser);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, role: 'institute' | 'admin' | 'teacher', otp?: string) => {
    try {
      setIsLoading(true);
      // Traditional login (OTP verification can be added later if needed)
      const response = await authService.login({ email, password });
      
      setUser(response.user);
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
      const response = await authService.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'teacher',
        phone: data.phone,
      });
      setUser(response.user);
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
      
      // Update user locally
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      signup, 
      signupTeacher, 
      updateProfile, 
      logout,
      getToken,
      refreshToken
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
