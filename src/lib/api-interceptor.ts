import { authCookies } from './cookie-utils';
// import { showToast } from './toast'; // Not currently used in this file

/**
 * Base API URL for Medvarsity API
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Token refresh threshold in milliseconds (1 hour before expiration)
 * This ensures we refresh tokens proactively before they expire
 */
const REFRESH_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

/**
 * Cache threshold in milliseconds (24 hours)
 * Prevents token refresh from running too frequently
 * This addresses the issue where token refresh was running on every request
 */
const REFRESH_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Interface for refresh token response
 */
interface RefreshTokenResponse {
  accessToken: string;
  user: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    email: string | null;
    mobile?: string | null;
    avatar?: string | null;
    lastLogin?: string | null;
    roles?: string[];
    permissions?: string[];
  };
}

/**
 * Interface for token refresh cache
 */
interface TokenRefreshCache {
  lastRefreshTime: number;
  tokenExpiration?: number;
}

/**
 * Flag to track if a token refresh is in progress
 */
let isRefreshing = false;

/**
 * Queue of callbacks to be called after token refresh
 */
let refreshCallbackQueue: Array<(token: string) => void> = [];

/**
 * Key for storing token refresh cache in sessionStorage
 */
const TOKEN_REFRESH_CACHE_KEY = 'medai_token_refresh_cache';

/**
 * Cache management utilities for token refresh
 */
const refreshCache = {
  /**
   * Get the current refresh cache
   */
  get(): TokenRefreshCache | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = sessionStorage.getItem(TOKEN_REFRESH_CACHE_KEY);
      if (!cached) return null;

      return JSON.parse(cached) as TokenRefreshCache;
    } catch (error) {
      console.error('Error reading token refresh cache:', error);
      return null;
    }
  },

  /**
   * Set the refresh cache with current timestamp
   */
  set(tokenExpiration?: number): void {
    if (typeof window === 'undefined') return;

    try {
      const cache: TokenRefreshCache = {
        lastRefreshTime: Date.now(),
        tokenExpiration
      };
      sessionStorage.setItem(TOKEN_REFRESH_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error setting token refresh cache:', error);
    }
  },

  /**
   * Clear the refresh cache
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(TOKEN_REFRESH_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing token refresh cache:', error);
    }
  },

  /**
   * Check if a refresh was performed recently (within cache duration)
   */
  isRecentlyRefreshed(): boolean {
    const cache = this.get();
    if (!cache) return false;

    const timeSinceLastRefresh = Date.now() - cache.lastRefreshTime;
    return timeSinceLastRefresh < REFRESH_CACHE_DURATION_MS;
  }
};

/**
 * Decodes a JWT token to get its payload
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
function decodeJwtToken(token: string): { exp?: number } | null {
  try {
    // Split the token by dots and get the second part (payload)
    const base64Payload = token.split('.')[1];
    // Replace characters for proper base64 decoding
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    // Decode and parse as JSON
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Checks if the token is approaching expiration (within refresh threshold)
 * and if a refresh hasn't been performed recently
 * @param token JWT token string
 * @returns True if token needs refresh, false otherwise
 */
function shouldRefreshToken(token: string): boolean {
  try {
    // First check if we recently refreshed the token
    if (refreshCache.isRecentlyRefreshed()) {
      return false;
    }

    const payload = decodeJwtToken(token);
    if (!payload || !payload.exp) return false;

    // Calculate time until expiration in milliseconds
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    // Check if token will expire within the threshold
    const needsRefresh = timeUntilExpiration <= REFRESH_THRESHOLD_MS;

    // Additional safety check: if token expires within the next 10 minutes,
    // refresh regardless of cache (emergency refresh)
    const emergencyThreshold = 10 * 60 * 1000; // 10 minutes
    const isEmergency = timeUntilExpiration <= emergencyThreshold;

    return needsRefresh || isEmergency;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return false;
  }
}

/**
 * Executes all pending callbacks with the new token
 * @param token New access token
 */
function processQueue(token: string): void {
  refreshCallbackQueue.forEach(callback => callback(token));
  refreshCallbackQueue = [];
}

/**
 * Attempts to refresh the access token using the refresh token stored in the HTTP-only cookie
 * @returns A promise that resolves with the new access token or rejects with an error
 */
export async function refreshAccessToken(): Promise<string> {
  try {
    if (!authCookies.hasAuthToken()) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Platform': process.env.NEXT_PUBLIC_PLATFORM || 'cms'
      },
      credentials: 'include' // Important for sending cookies
    });

    if (!response.ok) {
      console.error('Token refresh failed with status:', response.status);

      // Check for specific error scenarios
      if (response.status === 401 || response.status === 403) {
        throw new Error('Refresh token is invalid or expired');
      } else {
        throw new Error(`Token refresh failed: ${response.statusText || response.status}`);
      }
    }

    const data = await response.json() as RefreshTokenResponse;

    // Store the new access token and return it
    if (!data.accessToken) {
      console.error('Refresh token response did not contain an access token');
      throw new Error('No access token in refresh response');
    }

    // We'll update the auth cookie with the new token
    authCookies.setAuthToken(data.accessToken);

    // Get token expiration for cache
    const tokenPayload = decodeJwtToken(data.accessToken);
    const tokenExpiration = tokenPayload?.exp ? tokenPayload.exp * 1000 : undefined;

    // Update the refresh cache to prevent immediate subsequent refreshes
    refreshCache.set(tokenExpiration);

    // Update token in local storage - actual storage is done in auth-context.tsx
    // We just return the token here
    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);

    // Clear any existing auth data as it's no longer valid
    authCookies.removeAuthToken();
    refreshCache.clear();

    // We need to redirect to login, but since this is a utility function
    // we can't use router directly. The caller needs to handle this.
    throw error;
  }
}

/**
 * Enhanced fetch function with interceptors for authentication
 * @param url URL to fetch
 * @param options Fetch options
 * @returns Promise that resolves to the fetch response
 */
export async function fetchWithInterceptor(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Clone options to avoid modifying the original
  const requestOptions = { ...options };

  requestOptions.headers = new Headers(requestOptions.headers || {});
  (requestOptions.headers as Headers).set('Platform', process.env.NEXT_PUBLIC_PLATFORM || 'cms');
  (requestOptions.headers as Headers).set('X-Platform', process.env.NEXT_PUBLIC_PLATFORM || 'cms');
  (requestOptions.headers as Headers).set('Accept', 'application/json');
  if (!requestOptions.headers.has('Content-Type')) {
    (requestOptions.headers as Headers).set('Content-Type', 'application/json');
  }
  requestOptions.credentials = 'include'; // Important for sending cookies

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      const userRaw = localStorage.getItem('medai_user');
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        if (userObj && userObj.token) {
          token = userObj.token;
        }
      }
    } catch (e) {
      console.error('Error reading token from localStorage:', e);
    }
  }
  // Fallback to sessionStorage if not found in localStorage
  if (!token && typeof window !== 'undefined') {
    try {
      token = sessionStorage.getItem('accessToken');
    } catch (e) {
      console.error('Error reading token from sessionStorage:', e);
    }
  }

  // Final fallback to cookie if not found anywhere else
  if (!token) {
    token = authCookies.getAuthToken();
  }
  // Check if we have a token and if it needs refresh
  if (token && shouldRefreshToken(token)) {
    console.log('Token is approaching expiration, refreshing proactively...');
    if (isRefreshing) {
      try {
        token = await new Promise<string>((resolve) => {
          refreshCallbackQueue.push((refreshedToken: string) => {
            resolve(refreshedToken);
          });
        });
      } catch (error) {
        console.error('Failed to get refreshed token:', error);
      }
    } else {
      isRefreshing = true;
      try {
        token = await refreshAccessToken();
        processQueue(token);
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
        token = authCookies.getAuthToken();
      } finally {
        isRefreshing = false;
      }
    }
  }

  // Add Authorization header if we have a token
  if (token) {
    (requestOptions.headers as Headers).set('Authorization', `Bearer ${token}`);
  }

  // Make the initial request
  const response = await fetch(url, requestOptions);  // If response is 401 (Unauthorized), try to refresh the token
  if (response.status === 401) {
    const shouldRefresh = authCookies.hasAuthToken();
    if (!shouldRefresh) {
      return response;
    }
    let newToken: string;
    if (isRefreshing) {
      try {
        newToken = await new Promise<string>((resolve) => {
          refreshCallbackQueue.push((token: string) => {
            resolve(token);
          });
        });
      } catch {
        return response;
      }
    } else {
      isRefreshing = true;

      try {
        newToken = await refreshAccessToken();
        processQueue(newToken);
      } catch {
        return response;
      } finally {
        isRefreshing = false;
      }
    }
    (requestOptions.headers as Headers).set('Authorization', `Bearer ${newToken}`);
    return fetch(url, requestOptions);
  }
  return response;
}

/**
 * Checks and refreshes the token if necessary
 * @returns Promise that resolves with whether a refresh was performed
 */
export async function checkAndRefreshToken(): Promise<boolean> {
  const token = authCookies.getAuthToken();
  if (!token || !authCookies.hasAuthToken()) {
    return false;
  }
  if (shouldRefreshToken(token)) {
    if (isRefreshing) {
      await new Promise<void>((resolve) => {
        refreshCallbackQueue.push(() => {
          resolve();
        });
      });
      return true;
    } else {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        processQueue(newToken);
        return true;
      } catch (error) {
        console.error('Manual token refresh failed:', error);
        return false;
      } finally {
        isRefreshing = false;
      }
    }
  }

  return false;
}
