"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse } from '@/lib/api-client';
import { showToast } from '@/lib/toast';
import { authCookies } from '@/lib/cookie-utils';
import { detectInputType } from '@/lib/input-validator';

// Base API URL for Medvarsity API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Define the shape of the user object
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  mobile?: string;
  avatar?: string;
  token?: string; // This will store the accessToken from the server
  lastLogin?: string;
  roles?: string[]; // User roles
  permissions?: string[]; // User permissions
  isGoogleAuth?: boolean; // Whether user authenticated with Google
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sendEmailOTP: (email: string) => Promise<{ success: boolean; message: string }>;
  sendMobileOTP: (mobile: string) => Promise<{ success: boolean; message: string }>;
  verifyEmailOTP: (email: string, otp: string) => Promise<AuthResponse | { success: false, message: string }>;
  verifyMobileOTP: (mobile: string, otp: string) => Promise<AuthResponse | { success: false, message: string }>;
  googleLogin: (credential: string) => Promise<{ success: boolean; message?: string }>;
  loginWithPassword: (identifier: string, password: string) => Promise<AuthResponse | { success: false, message: string }>;
  logout: () => Promise<void>;

  refreshToken: (force?: boolean) => Promise<string | null>;
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

// Initial user is always null to avoid hydration mismatch
// (Client-side hydration happens in the useEffect inside AuthProvider)

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with null to avoid hydration mismatch
  const [user, setUser] = useState<User | null>(null);
  // Always start with loading=true to avoid hydration mismatch
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only run on client-side
    const SESSION_CACHE_KEY = 'medai_sso_session_cache';
    const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    const checkSession = async () => {
      // 1. Try to load user from local storage (for fast hydration)
      const storedUser = userStorage.getItem();
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse user from storage", error);
          userStorage.removeItem();
        }
      }

      // 2. Check session cache in sessionStorage
      let shouldFetchSession = true;
      if (typeof window !== 'undefined') {
        const cacheRaw = sessionStorage.getItem(SESSION_CACHE_KEY);
        if (cacheRaw) {
          try {
            const cache = JSON.parse(cacheRaw);
            if (cache.timestamp && Date.now() - cache.timestamp < SESSION_CACHE_TTL && cache.user) {
              setUser(cache.user);
              if (cache.accessToken) sessionStorage.setItem('accessToken', cache.accessToken);
              userStorage.setItem(JSON.stringify(cache.user));
              setLoading(false);
              shouldFetchSession = false;
            }
          } catch {
            // Ignore parse errors, will fetch session
          }
        }
      }

      if (!shouldFetchSession) return;

      // 3. Fetch backend session for SSO (auto-login)
      try {
        const apiBase = API_BASE_URL;
        const response = await fetch(`${apiBase}/auth/session`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            if (data.accessToken && typeof window !== 'undefined') {
              sessionStorage.setItem('accessToken', data.accessToken);
            }
            userStorage.setItem(JSON.stringify(data.user));
            // Cache session result
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
                user: data.user,
                accessToken: data.accessToken,
                timestamp: Date.now(),
              }));
            }
          } else {
            setUser(null);
            userStorage.removeItem();
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('accessToken');
              sessionStorage.removeItem(SESSION_CACHE_KEY);
            }
          }
        } else {
          setUser(null);
          userStorage.removeItem();
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem(SESSION_CACHE_KEY);
          }
        }
      } catch {
        setUser(null);
        userStorage.removeItem();
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem(SESSION_CACHE_KEY);
        }
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Authentication functions moved directly from api-client.ts

  /**
   * Send login request to get email OTP
   * @param email User's email address
   * @returns Response indicating OTP has been sent
   */
  const sendEmailOTP = async (email: string) => {
    setLoading(true);
    try {
      const { fetchWithInterceptor } = await import('@/lib/api-interceptor');
      const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        // Simplified error handling
        const errorMessage = data?.message || data?.detail || `Failed to send OTP (${response.status})`;
        setLoading(false);
        return {
          success: false,
          message: errorMessage,
        };
      }

      const successMessage = data.message || 'OTP sent successfully';
      setLoading(false);
      return {
        success: true,
        message: successMessage,
      };
    } catch (error) {
      setLoading(false);
      console.error('Error requesting OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  };

  /**
   * Send login request to get mobile OTP
   * @param mobile User's mobile number
   * @returns Response indicating OTP has been sent
   */
  const sendMobileOTP = async (mobile: string) => {
    setLoading(true);
    try {
      const { fetchWithInterceptor } = await import('@/lib/api-interceptor');
      const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ mobile }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        // Simplified error handling
        const errorMessage = data?.message || data?.detail || `Failed to send mobile OTP (${response.status})`;
        setLoading(false);
        return {
          success: false,
          message: errorMessage,
        };
      }

      const successMessage = data.message || 'Mobile OTP sent successfully';
      setLoading(false);
      return {
        success: true,
        message: successMessage,
      };
    } catch (error) {
      setLoading(false);
      console.error('Error requesting mobile OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send mobile OTP'
      };
    }
  };

  /**
   * Verify Email OTP and get authentication token
   * @param email User's email address
   * @param otp OTP code received by user
   * @returns Authentication data including token and user info
   */
  const verifyEmailOTP = async (email: string, otp: string): Promise<AuthResponse | { success: false, message: string }> => {
    setLoading(true);
    try {
      // API call for email OTP verification
      const url = `${API_BASE_URL}/auth/otp/verify`;
      const { fetchWithInterceptor } = await import('@/lib/api-interceptor');

      const response = await fetchWithInterceptor(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp, purpose: 'login' }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        // Simplified error handling
        const errorMessage = data?.message || data?.detail || `Failed to verify OTP (${response.status})`;
        setLoading(false);
        showToast(errorMessage, 'error');
        return {
          success: false as const,
          message: errorMessage,
        };
      }

      showToast('Login successful', 'success');
      const authResponse = {
        accessToken: data.accessToken || data.token || data.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          mobile: data.user.mobile,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          avatar: data.user.avatar,
          isGoogleAuth: data.user.isGoogleAuth,
          lastLogin: data.user.lastLogin,
          roles: data.user.roles,
          permissions: data.user.permissions,
          token: data.accessToken || data.token || data.access_token, // For backward compatibility
        }
      };

      // Set the auth token in cookie for SSO
      if (authResponse.accessToken) {
        authCookies.setAuthToken(authResponse.accessToken);
      }

      setUser(authResponse.user);
      userStorage.setItem(JSON.stringify(authResponse.user));
      setLoading(false);

      router.push('/dashboard');

      return authResponse;
    } catch (error) {
      setLoading(false);
      console.error('Error verifying OTP:', error);
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
      showToast(errorMessage, 'error');
      return {
        success: false as const,
        message: errorMessage,
      };
    }
  };

  /**
   * Verify Mobile OTP and get authentication token
   * @param mobile User's mobile number
   * @param otp OTP code received by user
   * @returns Authentication data including token and user info
   */
  const verifyMobileOTP = async (mobile: string, otp: string): Promise<AuthResponse | { success: false, message: string }> => {
    setLoading(true);
    try {
      console.log(`Calling verifyMobileOTP API for mobile: ${mobile.substring(0, 4)}****`);
      const url = `${API_BASE_URL}/auth/otp/verify`;
      const { fetchWithInterceptor } = await import('@/lib/api-interceptor');

      const response = await fetchWithInterceptor(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ mobile, otp, purpose: 'login' }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        // Simplified error handling
        const errorMessage = data?.message || data?.detail || `Failed to verify mobile OTP (${response.status})`;
        setLoading(false);
        showToast(errorMessage, 'error');
        return {
          success: false as const,
          message: errorMessage,
        };
      }

      showToast('Login successful', 'success');
      const authResponse = {
        accessToken: data.accessToken || data.token || data.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          mobile: data.user.mobile,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          avatar: data.user.avatar,
          isGoogleAuth: data.user.isGoogleAuth,
          lastLogin: data.user.lastLogin,
          roles: data.user.roles,
          permissions: data.user.permissions,
          token: data.accessToken || data.token || data.access_token, // For backward compatibility
        }
      };

      // Set the auth token in cookie for SSO
      if (authResponse.accessToken) {
        authCookies.setAuthToken(authResponse.accessToken);
      }

      setUser(authResponse.user);
      userStorage.setItem(JSON.stringify(authResponse.user));
      setLoading(false);

      router.push('/dashboard');

      return authResponse;

    } catch (error) {
      setLoading(false);
      console.error('Error verifying mobile OTP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Mobile OTP verification failed';
      showToast(errorMessage, 'error');
      return {
        success: false as const,
        message: errorMessage,
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const storedUserData = userStorage.getItem();
      let tokenToUse = user?.token;
      if (!tokenToUse && storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData);
          tokenToUse = parsedUser.token;
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }

      if (tokenToUse) {
        try {
          const { fetchWithInterceptor } = await import('@/lib/api-interceptor');
          const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include'
          });

          const success = response.ok;
          if (success) {
            // Remove the auth token cookie
            authCookies.removeAuthToken();
            showToast('Successfully logged out from all devices', 'success');
          } else {
            // Clean up local cookie even if the server logout failed
            authCookies.removeAuthToken();
            showToast('Logged out locally. Server sync may have failed.', 'info');
          }
        } catch (error) {
          console.error("Error during logout API call:", error);
          // Clean up local cookie even if the API call failed
          authCookies.removeAuthToken();
          showToast('Logged out locally. Server sync may have failed.', 'info');
        }
      } else {
        // Clean up any existing cookie even if no token was found in storage
        if (authCookies.hasAuthToken()) {
          authCookies.removeAuthToken();
        }
      }
    } catch (error) {
      console.error("Error during logout process:", error);
    } finally {
      setUser(null);
      userStorage.removeItem();
      setLoading(false);
      router.push('/login');
    }
  };


  const googleLogin = async (credential: string) => {
    setLoading(true);
    try {
      console.log('Google login initiated with credential');
      // Use the API client function to authenticate with Google
      const { fetchWithInterceptor } = await import('@/lib/api-interceptor');

      // Call the Google auth endpoint directly with interceptor to ensure consistent handling
      const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ id_token: credential }),
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data?.message || `Failed to authenticate with Google (${response.status})`;
        console.log('Google login failed:', errorMessage);
        setLoading(false);
        return { success: false, message: errorMessage };
      }

      const data = await response.json();

      // Create an AuthResponse from the data
      const authResponse: AuthResponse = {
        accessToken: data.accessToken || data.token || data.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          avatar: data.user.avatar,
          isGoogleAuth: data.user.isGoogleAuth,
          lastLogin: data.user.lastLogin,
          roles: data.user.roles,
          permissions: data.user.permissions
        }
      };

      // Set the user data and token
      const userData: User = {
        id: String(authResponse.user.id), // Convert to string if it's a number
        email: authResponse.user.email,
        mobile: authResponse.user.mobile || '',
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        avatar: authResponse.user.avatar,
        token: authResponse.accessToken, // Updated to use accessToken
        lastLogin: authResponse.user.lastLogin,
        roles: authResponse.user.roles,
        permissions: authResponse.user.permissions,
        isGoogleAuth: authResponse.user.isGoogleAuth
      };

      console.log('Setting user data in state and storage:', {
        ...userData,
        token: userData.token ? '***TOKEN***' : undefined
      });

      // Set the auth token in cookie for SSO
      if (authResponse.accessToken) {
        authCookies.setAuthToken(authResponse.accessToken);
      }

      setUser(userData);
      userStorage.setItem(JSON.stringify(userData));
      setLoading(false);
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error("Failed to login with Google", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to login with Google'
      };
    }
  };

  /**
   * Refresh the authentication token
   * @param force Force a refresh even if the token is not near expiration
   * @returns New access token or null if refresh fails
   */
  const refreshToken = async (force: boolean = false): Promise<string | null> => {
    try {
      // If not forcing, use the check and refresh function
      if (!force) {
        const { checkAndRefreshToken } = await import('@/lib/api-interceptor');

        // First check if we need to refresh
        const wasRefreshed = await checkAndRefreshToken();

        if (wasRefreshed) {
          // Token was refreshed, get it from cookies
          const newToken = authCookies.getAuthToken();

          if (newToken && user) {
            const updatedUser = { ...user, token: newToken };
            setUser(updatedUser);
            userStorage.setItem(JSON.stringify(updatedUser));
          }

          return newToken;
        } else {
          // No refresh was needed or it failed
          return user?.token || null;
        }
      } else {
        // Force refresh
        const { refreshAccessToken } = await import('@/lib/api-interceptor');
        const newToken = await refreshAccessToken();

        // Update the user object with the new token
        if (user) {
          const updatedUser = { ...user, token: newToken };
          setUser(updatedUser);
          userStorage.setItem(JSON.stringify(updatedUser));
        }

        return newToken;
      }
    } catch (error) {
      console.error('Failed to refresh token in auth context:', error);

      // If token refresh fails, log the user out
      await logout();
      return null;
    }
  };
  /**
 * Login with password (email or mobile + password)
 */
  const loginWithPassword = async (identifier: string, password: string): Promise<AuthResponse | { success: false, message: string }> => {
    setLoading(true);
    try {
      const { fetchWithInterceptor } = await import('@/lib/api-interceptor');

      // Detect if identifier is email or mobile
      const detection = detectInputType(identifier);
      if (detection.type === 'invalid') {
        setLoading(false);
        return {
          success: false,
          message: 'Please enter a valid email or mobile number'
        };
      }

      const body = detection.type === 'email'
        ? { email: detection.formatted, password }
        : { mobile: detection.formatted, password };

      const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/login-with-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.message || data?.detail || `Login failed (${response.status})`;
        setLoading(false);
        showToast(errorMessage, 'error');
        return {
          success: false,
          message: errorMessage,
        };
      }

      showToast('Login successful', 'success');
      const authResponse = {
        accessToken: data.accessToken || data.token || data.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          mobile: data.user.mobile,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          avatar: data.user.avatar,
          isGoogleAuth: data.user.isGoogleAuth,
          lastLogin: data.user.lastLogin,
          roles: data.user.roles,
          permissions: data.user.permissions,
          token: data.accessToken || data.token || data.access_token,
        }
      };

      if (authResponse.accessToken) {
        authCookies.setAuthToken(authResponse.accessToken);
        console.log(`Set ${authCookies.getAuthCookieName()} cookie for password login`);
      }

      setUser(authResponse.user);
      userStorage.setItem(JSON.stringify(authResponse.user));
      setLoading(false);
      router.push('/dashboard');
      return authResponse;
    } catch (error) {
      setLoading(false);
      console.error('Error logging in with password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password login failed';
      showToast(errorMessage, 'error');
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    sendEmailOTP,
    sendMobileOTP,
    verifyEmailOTP,
    verifyMobileOTP,
    googleLogin,
    logout,
    refreshToken,
    loginWithPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
