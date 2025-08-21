"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendOTP: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for stored auth token
    const checkAuth = async () => {
      try {
        // Use a safer approach with try-catch for localStorage in case of SSR
        let token = null;
        let storedEmail = null;

        if (typeof window !== 'undefined') {
          token = localStorage.getItem('auth-token');
          storedEmail = localStorage.getItem('user-email');
        }

        if (token) {
          try {
            // In a real app, validate the token with your API
            // For now, just simulate a successful auth check
            const mockUser = {
              id: '123',
              email: storedEmail || 'user@example.com',
              role: 'admin' as const,
            };
            setUser(mockUser);
          } catch (error) {
            console.error('Auth verification failed:', error);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-token');
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Redirect logic for protected and public routes
    if (!isLoading) {
      // Routes that don't require authentication
      const publicRoutes = ['/login', '/register', '/forgot-password'];
      const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
      const isRootRoute = pathname === '/';

      if (user && (isPublicRoute || isRootRoute)) {
        // Redirect to dashboard if already logged in and accessing public route
        router.replace('/dashboard');
      } else if (!user && isRootRoute) {
        // Redirect to login if not authenticated and accessing root route
        router.replace('/login');
      }
      // Note: Other redirections for protected routes are now handled by ProtectedRoute component
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string): Promise<void> => {
    setIsLoading(true);

    try {
      // In a real app, make an API call here
      // For now, simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUser = {
        id: '123',
        email,
        role: 'admin' as const,
      };

      localStorage.setItem('auth-token', 'mock-jwt-token');
      localStorage.setItem('user-email', email);

      setUser(mockUser);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // In a real app, implement Google OAuth
      // For now, simulate a successful Google login
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser = {
        id: '456',
        email: 'google-user@example.com',
        name: 'Google User',
        role: 'editor' as const,
      };

      localStorage.setItem('auth-token', 'mock-google-jwt-token');
      localStorage.setItem('user-email', mockUser.email);

      setUser(mockUser);
      router.push('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // In a real app, invalidate the token on the server
      // For now, just clear local storage
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-email');

      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string): Promise<boolean> => {
    try {
      // In a real app, make an API call to send an OTP
      console.log(`Sending OTP to ${email}`);
      // For now, simulate a successful OTP send
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      // In a real app, verify the OTP with your API
      // For now, accept any OTP (in real app, NEVER do this!)
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (otp === '123456') {
        // Mock successful verification
        return true;
      } else {
        // Mock failed verification
        return false;
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        sendOTP,
        verifyOTP
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
