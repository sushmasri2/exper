"use client";

import { ToastContainer } from './toast-container';

/**
 * ToastProvider component
 *
 * This component sets up toast notifications for the entire application.
 * It uses a custom toast implementation with close buttons.
 *
 * Place this component in your app layout to make toast notifications
 * available throughout your application.
 *
 * Usage:
 * ```tsx
 * // In your layout component
 * import { ToastProvider } from '@/components/toast-provider';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       <ToastProvider />
 *       {children}
 *     </>
 *   );
 * }
 * ```
 *
 * Then in your components:
 * ```tsx
 * import { showToast } from '@/lib/toast';
 *
 * function MyComponent() {
 *   const handleAction = () => {
 *     showToast('Action completed successfully!', 'success');
 *   };
 *
 *   return <button onClick={handleAction}>Click me</button>;
 * }
 * ```
 */
export function ToastProvider() {
  return <ToastContainer />;
}
