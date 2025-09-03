"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  requestEmailOTP,
  requestMobileOTP,
  verifyOTP,
  checkSession,
  logoutUser,
  googleLogin,
  AuthResponse
} from '@/lib/api-client';

interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  // OTP-based login methods
  sendEmailOTP: (email: string) => Promise<{ success: boolean; message: string }>;
  sendMobileOTP: (mobile: string) => Promise<{ success: boolean; message: string }>;
  verifyEmailOTP: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  verifyMobileOTP: (mobile: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (id_token: string) => Promise<{ success: boolean; message?: string }>;

  // Session management
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    checkCurrentSession();
  }, []);

  const checkCurrentSession = async () => {
    try {
      const sessionData = await checkSession();
      if (sessionData?.user) {
        setUser(sessionData.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      // Clear any stale tokens
      sessionStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOTP = async (email: string) => {
    setLoading(true);
    try {
      const result = await requestEmailOTP(email);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const sendMobileOTP = async (mobile: string) => {
    setLoading(true);
    try {
      const result = await requestMobileOTP(mobile);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOTP = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const result = await verifyOTP(email, otp, 'email');

      if ('accessToken' in result) {
        setUser(result.user);
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOTP = async (mobile: string, otp: string) => {
    setLoading(true);
    try {
      const result = await verifyOTP(mobile, otp, 'mobile');

      if ('accessToken' in result) {
        setUser(result.user);
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async (id_token: string) => {
    setLoading(true);
    try {
      const result = await googleLogin(id_token);

      if ('accessToken' in result) {
        setUser(result.user);
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if API call fails
      setUser(null);
      sessionStorage.removeItem('accessToken');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    await checkCurrentSession();
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    sendEmailOTP,
    sendMobileOTP,
    verifyEmailOTP,
    verifyMobileOTP,
    logout,
    refreshSession,
    googleLogin: handleGoogleLogin,

  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}