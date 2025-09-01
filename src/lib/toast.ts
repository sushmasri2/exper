import { addToast } from '@/components/toast-container';

type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Display a toast notification with customizable options
 * @param message The message to display in the toast
 * @param type The type of toast: success, error, info, or warning
 * @param duration Duration in ms before the toast disappears
 */
export function showToast(message: unknown, type: ToastType = 'info', duration = 5000) {
  // Using our custom toast implementation that includes close buttons
  if (typeof window !== 'undefined') {
    addToast(message, type, duration);
  }
}

/**
 * Display a success toast notification
 * @param message The message to display
 */
export function success(message: unknown) {
  showToast(message, 'success');
}

/**
 * Display an error toast notification
 * @param message The message to display
 */
export function error(message: unknown) {
  showToast(message, 'error');
}

/**
 * Display an info toast notification
 * @param message The message to display
 */
export function info(message: unknown) {
  showToast(message, 'info');
}

/**
 * Display a warning toast notification
 * @param message The message to display
 */
export function warning(message: unknown) {
  showToast(message, 'warning');
}
