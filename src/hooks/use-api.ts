"use client";

import { useAuth } from '@/context/auth-context';

/**
 * A hook that provides methods for making authenticated API requests
 */
export function useApi() {
  const { user } = useAuth();
  const API_BASE_URL = 'https://api-staging.medvarsity.com';

  /**
   * Makes an authenticated API request
   * @param endpoint API endpoint path (without base URL)
   * @param options Fetch API options
   * @returns Response data
   */
  const fetchWithAuth = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!user?.token) {
      throw new Error('Authentication token is missing');
    }

    const headers = {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'ops',
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
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

  return {
    get,
    post,
    put,
    delete: del,
  };
}
