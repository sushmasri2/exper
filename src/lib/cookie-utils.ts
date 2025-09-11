/**
 * Cookie utility functions for managing cookies in the application
 * Uses modern methods for cookie handling with proper security measures
 */

/**
 * Sets a cookie with the specified options
 * @param name Cookie name
 * @param value Cookie value
 * @param options Additional cookie options (expires, path, domain, secure, sameSite)
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    expires?: Date | number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    httpOnly?: boolean; // Note: httpOnly will only work server-side
  } = {}
): void {
  if (typeof window === 'undefined') {
    return; // Don't try to set cookies during SSR
  }

  const {
    expires,
    path = '/',
    domain,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    if (typeof expires === 'number') {
      // If expires is a number, treat it as days from now
      const date = new Date();
      date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    } else {
      cookieString += `; expires=${expires.toUTCString()}`;
    }
  }

  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * Gets a cookie by name
 * @param name The cookie name
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null; // Don't try to get cookies during SSR
  }

  const nameEncoded = encodeURIComponent(name);
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    // Check if this cookie starts with the name we're looking for
    if (cookie.indexOf(nameEncoded + '=') === 0) {
      return decodeURIComponent(cookie.substring(nameEncoded.length + 1));
    }
  }

  return null;
}

/**
 * Deletes a cookie by setting its expiration date to the past
 * @param name The cookie name
 * @param options Additional cookie options (path, domain)
 */
export function deleteCookie(
  name: string,
  options: {
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  if (typeof window === 'undefined') {
    return; // Don't try to delete cookies during SSR
  }

  const { path = '/', domain, secure = false, sameSite = 'lax' } = options;

  // Set expiration to a past date to delete the cookie
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${
    domain ? `; domain=${domain}` : ''
  }${secure ? '; secure' : ''}; samesite=${sameSite}`;
}

/**
 * Checks if a cookie exists
 * @param name The cookie name
 * @returns Whether the cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Get all cookies as an object
 * @returns An object containing all cookies
 */
export function getAllCookies(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}; // Return empty object during SSR
  }

  return document.cookie
    .split(';')
    .reduce((cookies, cookie) => {
      if (cookie.trim()) {
        const [name, value] = cookie.trim().split('=').map(decodeURIComponent);
        cookies[name] = value;
      }
      return cookies;
    }, {} as Record<string, string>);
}

/**
 * Deletes all cookies
 * @param options Additional cookie options (path, domain)
 */
export function deleteAllCookies(
  options: {
    path?: string;
    domain?: string;
  } = {}
): void {
  const cookies = getAllCookies();
  Object.keys(cookies).forEach(name => {
    deleteCookie(name, options);
  });
}

/**
 * Handle authentication cookies specifically
 */
export const authCookies = {
  /**
   * Get the auth cookie name from environment variable
   */
  getAuthCookieName(): string {
    return process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'sso_token';
  },

  /**
   * Set the authentication token cookie
   * @param token The auth token value
   * @param options Cookie options
   */
  setAuthToken(token: string, options: { expires?: number; [key: string]: unknown } = {}): void {
    setCookie(this.getAuthCookieName(), token, {
      // Secure by default in production
      secure: process.env.NODE_ENV === 'production',
      // Use 'strict' SameSite in production for better security
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      // Set path to root by default
      path: '/',
      // Default to 7 days expiry if not specified
      expires: options.expires || 7,
      ...options,
    });
  },

  /**
   * Get the authentication token from cookie
   * @returns The auth token or null if not found
   */
  getAuthToken(): string | null {
    return getCookie(this.getAuthCookieName());
  },

  /**
   * Remove the authentication token cookie
   */
  removeAuthToken(options: { [key: string]: unknown } = {}): void {
    deleteCookie(this.getAuthCookieName(), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      ...options,
    });
  },

  /**
   * Check if the user has an auth token cookie
   * @returns Whether the auth token cookie exists
   */
  hasAuthToken(): boolean {
    return hasCookie(this.getAuthCookieName());
  }
};
