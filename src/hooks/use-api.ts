"use client";

import { useAuth } from '@/context/auth-context';
import { useState } from 'react';

/**
 * A hook that provides methods for making authenticated API requests
 * with automatic token refresh support
 */
export function useApi() {
  const [error, setError] = useState<Error | null>(null);
  const { user, refreshToken } = useAuth();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  /**
   * Makes an authenticated API request with automatic token refresh
   * @param endpoint API endpoint path (without base URL)
   * @param options Fetch API options
   * @returns Response data
   */
  const fetchWithAuth = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      if (!user?.token) {
        throw new Error('Authentication token is missing');
      }

      // Use the interceptor for this request which handles automatic token refresh
      const { fetchWithInterceptor } = await import('@/lib/api-interceptor');

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      };

      const response = await fetchWithInterceptor(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        }

        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `API request failed with status: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      throw error;
    }
  };

  /**
   * Makes a GET request to the API
   * @param endpoint API endpoint path
   * @param queryParams Optional query parameters
   * @returns Response data
   */
  const get = async <T>(endpoint: string, queryParams?: Record<string, string>): Promise<T> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return fetchWithAuth<T>(url.pathname + url.search);
  };

  /**
   * Makes a POST request to the API
   * @param endpoint API endpoint path
   * @param data Request body data
   * @returns Response data
   */
  const post = async <T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> => {
    return fetchWithAuth<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  /**
   * Makes a PUT request to the API
   * @param endpoint API endpoint path
   * @param data Request body data
   * @returns Response data
   */
  const put = async <T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> => {
    return fetchWithAuth<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };

  /**
   * Makes a DELETE request to the API
   * @param endpoint API endpoint path
   * @returns Response data
   */
  const del = async <T>(endpoint: string): Promise<T> => {
    return fetchWithAuth<T>(endpoint, {
      method: 'DELETE',
    });
  };

  /**
   * Logs out the user by invalidating the token on the server
   * This method leverages the logoutUser function from api-client
   * to maintain a single source of truth for API calls
   * @returns Promise that resolves with logout status
   */
  const logout = async (): Promise<{ success: boolean; message: string }> => {
    if (!user?.token) {
      console.warn('No authentication token available for logout');
      return {
        success: false,
        message: 'No authentication token available'
      };
    }

    // Use the centralized API client function for the actual API call
    const { logoutUser } = await import('@/lib/api-client');
    return await logoutUser();
  };

  // Authentication related functions have been removed to avoid duplication
  // These functions are already available through the AuthContext (useAuth hook)
  // See src/context/auth-context.tsx for the implementation

  /**
   * Get the current error state
   * @returns Current error or null
   */
  const getError = () => error;

  /**
   * Clear the current error state
   */
  const clearError = () => setError(null);

  /**
   * Manually refresh the access token
   * Useful for pre-emptively refreshing before critical operations
   * @returns Promise that resolves with success status
   */
  const refresh = async (): Promise<boolean> => {
    try {
      const newToken = await refreshToken();
      return !!newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      setError(error instanceof Error ? error : new Error('Token refresh failed'));
      return false;
    }
  };

  return {
    get,
    post,
    put,
    delete: del,
    logout,
    refresh,
    getError,
    clearError
  };
}
