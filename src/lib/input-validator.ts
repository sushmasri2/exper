/**
 * Utility functions for validating and detecting input types
 */

/**
 * Check if input is a valid email format
 */
export function isValidEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.trim());
}

/**
 * Check if input is a valid mobile number format
 * Supports formats: +911234567890, 911234567890, 1234567890
 */
export function isValidMobile(input: string): boolean {
  // Remove all spaces and dashes
  const cleaned = input.replace(/[\s-]/g, '');
  
  // Check for mobile number patterns
  const mobilePatterns = [
    /^\+91[6-9]\d{9}$/, // +91xxxxxxxxxx (Indian format)
    /^91[6-9]\d{9}$/, // 91xxxxxxxxxx (Indian without +)
    /^[6-9]\d{9}$/, // xxxxxxxxxx (10 digits starting with 6-9)
    /^\+\d{10,15}$/, // International format +xxxxxxxxxxxx
  ];
  
  return mobilePatterns.some(pattern => pattern.test(cleaned));
}

/**
 * Detect input type and return formatted value
 */
export function detectInputType(input: string): {
  type: 'email' | 'mobile' | 'invalid';
  formatted: string;
  original: string;
} {
  const trimmed = input.trim();
  
  if (isValidEmail(trimmed)) {
    return {
      type: 'email',
      formatted: trimmed.toLowerCase(),
      original: trimmed
    };
  }
  
  if (isValidMobile(trimmed)) {
    // Format mobile number - ensure it has country code
    let formatted = trimmed.replace(/[\s-]/g, '');
    
    // Add +91 if it's a 10-digit Indian number
    if (/^[6-9]\d{9}$/.test(formatted)) {
      formatted = `+91${formatted}`;
    }
    // Add + if country code exists but no +
    else if (/^91[6-9]\d{9}$/.test(formatted)) {
      formatted = `+${formatted}`;
    }
    
    return {
      type: 'mobile',
      formatted,
      original: trimmed
    };
  }
  
  return {
    type: 'invalid',
    formatted: trimmed,
    original: trimmed
  };
}

/**
 * Mask email for display (user@example.com -> u***@example.com)
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 1) return email;
  
  const masked = username[0] + '*'.repeat(Math.min(username.length - 1, 3));
  return `${masked}@${domain}`;
}

/**
 * Mask mobile for display (+911234567890 -> +91***567890)
 */
export function maskMobile(mobile: string): string {
  if (mobile.length <= 4) return mobile;
  
  const start = mobile.substring(0, 3);
  const end = mobile.substring(mobile.length - 4);
  const stars = '*'.repeat(Math.min(mobile.length - 7, 6));
  
  return `${start}${stars}${end}`;
}