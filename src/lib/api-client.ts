// API Client for making requests to the Medvarsity API with SSO support
import { showToast } from './toast';

/**
 * Base API URL for Medvarsity API
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://csapi-staging.medvarsity.com';
const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM || 'cms';

/**
 * Custom fetch function that always includes required headers and credentials
 */
export async function fetchWithHeaders(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});

  // Add required headers
  headers.set('X-Requested-With', 'cms');
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  headers.set('platform', PLATFORM);
  // Add access token if available
  const accessToken = sessionStorage.getItem('accessToken');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for cookie-based SSO
  });
}

/**
 * Handle token refresh when access token expires
 */
async function refreshToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'cms',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        sessionStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
      }
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

/**
 * Make authenticated API request with automatic token refresh
 */
export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response = await fetchWithHeaders(`${API_BASE_URL}${endpoint}`, options);

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    const newToken = await refreshToken();

    if (newToken) {
      // Update headers with new token
      const headers = new Headers(options.headers || {});
      headers.set('Authorization', `Bearer ${newToken}`);

      // Retry the request
      response = await fetchWithHeaders(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      // Refresh failed, redirect to login
      sessionStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const errorMessage = await handleApiError(response, data, 'Request failed');
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Auth response type definition
 */
export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

/**
 * Send OTP to email
 */
export async function requestEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithHeaders(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = await handleApiError(response, data, 'Failed to send OTP');
      return { success: false, message: errorMessage };
    }

    return {
      success: true,
      message: data.message || 'OTP sent to your email',
    };
  } catch (error) {
    console.error('Error requesting email OTP:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

/**
 * Send OTP to mobile
 */
export async function requestMobileOTP(mobile: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithHeaders(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = await handleApiError(response, data, 'Failed to send OTP');
      return { success: false, message: errorMessage };
    }

    return {
      success: true,
      message: data.message || 'OTP sent to your mobile',
    };
  } catch (error) {
    console.error('Error requesting mobile OTP:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

/**
 * Verify OTP and login
 */
export async function verifyOTP(
  identifier: string,
  otp: string,
  type: 'email' | 'mobile'
): Promise<AuthResponse | { success: false; message: string }> {
  try {
    const body = type === 'email'
      ? { email: identifier, otp, purpose: 'login' }
      : { mobile: identifier, otp, purpose: 'login' };

    const response = await fetchWithHeaders(`${API_BASE_URL}/api/auth/otp/verify`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = await handleApiError(response, data, 'Failed to verify OTP');
      return { success: false, message: errorMessage };
    }

    // Store access token
    if (data.accessToken) {
      sessionStorage.setItem('accessToken', data.accessToken);
    }

    showToast('Login successful', 'success');
    return {
      accessToken: data.accessToken,
      user: data.user,
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
    return { success: false, message: errorMessage };
  }
}

/**
 * Google OAuth login
 */
export async function googleLogin(id_token: string): Promise<AuthResponse | { success: false; message: string }> {
  try {
    const response = await fetchWithHeaders(`${API_BASE_URL}/api/auth/google/callback`, {
      method: 'POST',
      body: JSON.stringify({ id_token }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = await handleApiError(response, data, 'Google login failed');
      return { success: false, message: errorMessage };
    }

    // Store access token
    if (data.accessToken) {
      sessionStorage.setItem('accessToken', data.accessToken);
    }

    showToast('Login successful', 'success');
    return {
      accessToken: data.accessToken,
      user: data.user,
    };
  } catch (error) {
    console.error('Google login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Google login failed'
    };
  }
}

/**
 * Check current session status
 */
export async function checkSession(): Promise<{ user: any } | null> {
  try {
    const response = await fetchWithHeaders(`${API_BASE_URL}/api/auth/session`);

    if (response.ok) {
      const data = await response.json();

      // Update access token if provided
      if (data.accessToken) {
        sessionStorage.setItem('accessToken', data.accessToken);
      }

      return data;
    }

    return null;
  } catch (error) {
    console.error('Session check failed:', error);
    return null;
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetchWithHeaders(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
    });

    sessionStorage.removeItem('accessToken');
    showToast('Logged out successfully', 'success');
  } catch (error) {
    console.error('Logout failed:', error);
    // Still clear local tokens even if API call fails
    sessionStorage.removeItem('accessToken');
  }
}

// Keep existing error handler
async function handleApiError(
  response: Response,
  data: Record<string, unknown> | null,
  defaultMessage: string
): Promise<string> {
  if (!data) {
    try {
      data = await response.json();
    } catch {
      return `${defaultMessage}: ${response.statusText || response.status}`;
    }
  }

  data = data || {};

  const safeString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  };

  switch (response.status) {
    case 400:
      return safeString(data.detail) || safeString(data.message) || 'Invalid request';
    case 401:
      return safeString(data.detail) || safeString(data.message) || 'Authentication required';
    case 403:
      return safeString(data.detail) || safeString(data.message) || 'Access denied';
    case 404:
      return safeString(data.detail) || safeString(data.message) || 'Resource not found';
    case 422:
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        interface ValidationError {
          loc: string[];
          msg: string;
          type: string;
        }

        const validationErrors = data.detail
          .filter((error: unknown): error is ValidationError =>
            typeof error === 'object' &&
            error !== null &&
            'msg' in error &&
            typeof (error as Record<string, unknown>).msg === 'string'
          )
          .map((error: ValidationError) => safeString(error.msg));

        if (validationErrors.length > 0) {
          return validationErrors.join('\n');
        }
      }
      return safeString(data.detail) || safeString(data.message) || 'Validation error';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error. Please try again later.';
    default:
      return safeString(data.detail) || safeString(data.message) || `Error (${response.status}): ${defaultMessage}`;
  }
}