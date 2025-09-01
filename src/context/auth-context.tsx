"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { requestOTP, verifyOTP, AuthResponse } from '@/lib/api-client';

// Define the shape of the user object
interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  token?: string;
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sendOTP: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyAndLogin: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Create a more secure storage utility
const createSecureStorage = (key: string) => {
  // In a real app, you might use a library like 'secure-ls' or encrypt data.
  // For this example, we'll use a simple abstraction over localStorage.
  return {
    setItem: (value: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    },
    getItem: (): string | null => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    },
    removeItem: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    },
  };
};

const userStorage = createSecureStorage('medai_user');

// Try to get user synchronously from storage if possible
const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const storedUser = userStorage.getItem();
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to parse user from storage", error);
    return null;
  }
};

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with data from storage if available to prevent unnecessary loading states
  const [user, setUser] = useState<User | null>(getInitialUser());
  // Start with loading=false if we already have a user
  const [loading, setLoading] = useState(!user);
  const router = useRouter();

  useEffect(() => {
    // If we already have a user from initial state, no need to reload
    if (user) return;

    const storedUser = userStorage.getItem();
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from storage", error);
        userStorage.removeItem();
      }
    }
    setLoading(false);
  }, [user]);

  const sendOTP = async (email: string) => {
    setLoading(true);
    try {
      const result = await requestOTP(email);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.error("Failed to send OTP", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  };

  const verifyAndLogin = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const result = await verifyOTP(email, otp);

      if ('success' in result && result.success === false) {
        setLoading(false);
        return { success: false, message: result.message };
      }

      // We know this is AuthResponse now
      const authResponse = result as AuthResponse;

      const userData: User = {
        id: authResponse.user.id,
        email: authResponse.user.email,
        name: authResponse.user.name,
        avatar: authResponse.user.avatar,
        token: authResponse.token
      };

      setUser(userData);
      userStorage.setItem(JSON.stringify(userData));
      setLoading(false);
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error("Failed to verify OTP", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify OTP'
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    setUser(null);
    userStorage.removeItem();
    setLoading(false);
    router.push('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    sendOTP,
    verifyAndLogin,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
