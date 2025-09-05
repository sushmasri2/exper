"use client";

import { useEffect, useState } from "react";
import { CustomToast } from "./custom-toast";
import styles from "./custom-toast.module.css";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Create a global event system for toast notifications
type ToastEvent = CustomEvent<{ toast: Omit<ToastItem, "id"> }>;

// Store this on the window object
declare global {
  interface WindowEventMap {
    "toast:add": ToastEvent;
  }
}

// Helper function to ensure message is a string
function ensureString(value: unknown): string {
  if (value === null || value === undefined) {
    return "Unknown message";
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    try {
      if (value instanceof Error) {
        return value.message || String(value);
      }
      return JSON.stringify(value);
    } catch {
      return "[Object cannot be displayed]";
    }
  }

  return String(value);
}

// Create a toast handler function
export function addToast(message: unknown, type: ToastType = "info", duration = 5000) {
  // Convert message to a safe string
  const stringMessage = ensureString(message);

  const event = new CustomEvent("toast:add", {
    detail: {
      toast: {
        message: stringMessage,
        type,
        duration,
      },
    },
  });

  window.dispatchEvent(event);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    // Listen for toast:add events
    const handleAddToast = (event: ToastEvent) => {
      const { toast } = event.detail;

      // Add a unique ID to the toast
      const newToast: ToastItem = {
        ...toast,
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      setToasts((prevToasts) => [...prevToasts, newToast]);
    };

    // Add event listener
    window.addEventListener("toast:add", handleAddToast);

    // Clean up event listener
    return () => {
      window.removeEventListener("toast:add", handleAddToast);
    };
  }, []);

  // Remove a toast by ID
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <CustomToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}
