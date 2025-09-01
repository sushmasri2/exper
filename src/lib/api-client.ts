// API Client for making requests to the Medvarsity API
import { showToast } from './toast';

/**
 * Base API URL for Medvarsity API
 */
const API_BASE_URL = 'https://api-staging.medvarsity.com';

/**
 * Custom fetch function that always includes the X-Requested-With header
 * @param url URL to fetch
 * @param options Fetch options
 * @returns Fetch response
 */
export async function fetchWithHeaders(url: string, options: RequestInit = {}): Promise<Response> {
  // Ensure headers exist
  const headers = new Headers(options.headers || {});

  // Add the X-Requested-With header
  headers.set('X-Requested-With', 'ops');

  // Return the fetch with updated headers
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Handles API error responses and returns appropriate error message
 * @param response The fetch Response object
 * @param data The parsed JSON data (if available)
 * @param defaultMessage Default error message to show if no specific message is found
 * @returns Formatted error message
 */
async function handleApiError(
  response: Response,
  data: Record<string, unknown> | null,
  defaultMessage: string
): Promise<string> {
  // If data wasn't provided, try to parse it
  if (!data) {
    try {
      data = await response.json();
    } catch {
      // If we can't parse JSON, use status text
      return `${defaultMessage}: ${response.statusText || response.status}`;
    }
  }

  // Ensure data is not null or undefined before accessing properties
  data = data || {};  // Helper function to ensure we return a string
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

  // Handle specific status codes
  switch (response.status) {
    case 400:
      // Bad request - could have validation errors
      return safeString(data.detail) || safeString(data.message) || 'Invalid request';
    case 401:
      return safeString(data.detail) || safeString(data.message) || 'Authentication required. Please login again.';
    case 403:
      return safeString(data.detail) || safeString(data.message) || 'You do not have permission to access this resource.';
    case 404:
      return safeString(data.detail) || safeString(data.message) || 'Resource not found';
    case 422:
      // Validation errors - common in APIs
      // Handle FastAPI validation errors which have a specific structure
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        // Define a type for FastAPI validation error structure
        interface ValidationError {
          loc: string[];
          msg: string;
          type: string;
        }

        // Extract all validation errors
        const validationErrors = data.detail
          .filter((error: unknown): error is ValidationError =>
            typeof error === 'object' &&
            error !== null &&
            'msg' in error &&
            typeof (error as Record<string, unknown>).msg === 'string'
          )
          .map((error: ValidationError) => safeString(error.msg));

        if (validationErrors.length > 0) {
          // Return all errors, separated by line breaks for better readability
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

/**
 * Auth response type definition
 */
export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name?: string;
        avatar?: string;
    };
}

/**
 * Error response type definition
 */
export interface ErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

/**
 * Send login request to get OTP
 * @param email User's email address
 * @returns Response indicating OTP has been sent
 */
export async function requestOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'ops',
            },
            body: JSON.stringify({ email }),
        });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = await handleApiError(response, data, 'Failed to send OTP');
      return {
        success: false,
        message: errorMessage,
      };
    }
    const successMessage = data.message || 'OTP sent successfully';
        return {
            success: true,
            message: successMessage,
        };
    } catch (error) {
        console.error('Error requesting OTP:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
        return {
            success: false,
            message: errorMessage,
        };
    }
}

/**
 * Verify OTP and get authentication token
 * @param email User's email address
 * @param otp OTP code received by user
 * @returns Authentication data including token and user info
 */
export async function verifyOTP(email: string, otp: string): Promise<AuthResponse | { success: false, message: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'ops',
            },
            body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = await handleApiError(response, data, 'Failed to verify OTP');
            showToast(errorMessage, 'error');
            return {
                success: false,
                message: errorMessage,
            };
        }

        showToast('Login successful', 'success');
        return {
            token: data.token,
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                avatar: data.user.avatar,
            }
        };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
        showToast(errorMessage, 'error');
        return {
            success: false,
            message: errorMessage,
        };
    }
}

/**
 * Get currently authenticated user profile
 * @param token Authentication token
 * @returns User profile data
 */
export async function getUserProfile(token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'X-Requested-With': 'ops',
            },
        });

        if (!response.ok) {
            const errorMessage = await handleApiError(response, null, 'Failed to fetch user profile');
            showToast(errorMessage, 'error');
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error: unknown) {
        console.error('Error fetching user profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile';
        showToast(errorMessage, 'error');
        throw error;
    }
}
