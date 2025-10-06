// API Client for making requests to the Medvarsity API
import { showToast } from './toast';

/**
 * Base API URL for Medvarsity API
 * Uses environment variable or falls back to a default
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Import the interceptor at the top level
import { fetchWithInterceptor } from './api-interceptor';

/**
 * Custom fetch function that always includes the Platform header
 * @param url URL to fetch
 * @param options Fetch options
 * @returns Fetch response
 */
export async function fetchWithHeaders(url: string, options: RequestInit = {}): Promise<Response> {
  // Use the interceptor which handles auth headers and token refresh
  return fetchWithInterceptor(url, options);
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
  accessToken: string; // Changed from token to accessToken to match server response
  user: {
    id: number | string; // ID can be number or string
    firstName?: string;
    lastName?: string;
    email: string;
    mobile?: string;
    avatar?: string;
    isGoogleAuth?: boolean;
    lastLogin?: string;
    roles?: string[]; // Array of roles
    permissions?: string[]; // Array of permissions
    token?: string; // Optional token field for backward compatibility
  };
  message?: string; // Optional message from the server
}

/**
 * Error response type definition
 */
export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Google authentication handler
 * @param idToken Google ID token from OAuth response
 * @returns Authentication response with user token and profile
 */
export async function authenticateWithGoogle(idToken: string): Promise<AuthResponse | { success: false, message: string }> {
  try {
    const response = await fetchWithHeaders(`${API_BASE_URL}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id_token: idToken }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = await handleApiError(response, data, 'Google authentication failed');
      showToast(errorMessage, 'error');
      return {
        success: false,
        message: errorMessage,
      };
    }

    showToast('Login successful', 'success');

    return {
      accessToken: data.accessToken || data.token || data.access_token, // Support multiple formats for backward compatibility
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
  } catch (error) {
    console.error('Error authenticating with Google:', error);
    const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
    showToast(errorMessage, 'error');
    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Logout the user by invalidating the token on the server
 * This ensures logout from all applications using the same authentication service
 * Token is automatically handled by the interceptor
 * @returns Success status of the logout operation
 */
export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  try {
    const logoutUrl = `${API_BASE_URL}/auth/logout`;

    const response = await fetchWithHeaders(logoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // JSON parsing failed, use default error message
        errorData = { error: 'Failed to parse response JSON' };
      }

      console.warn('Server logout returned an error:', errorData);
      return {
        success: true, // Still consider it success from client side
        message: 'Logged out locally. Server sync failed.'
      };
    }

    return {
      success: true,
      message: 'Logged out successfully'
    };

  } catch (error) {
    console.error('Error during logout API call:', error);
    return {
      success: true,
      message: 'Logged out locally. Server sync failed.'
    };
  }
}
