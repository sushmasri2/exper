"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import styles from "./custom-toast.module.css";

interface CustomToastProps {
  message: string | number | boolean | object | null | undefined;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number;
}

export function CustomToast({
  message,
  type,
  onClose,
  duration = 5000,
}: CustomToastProps) {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  // Handle close with animation using useCallback to prevent dependency array issues
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  // Auto-close after duration
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, handleClose]);

  if (!visible) return null;

  // Get class based on toast type
  const getTypeClass = () => {
    switch (type) {
      case "success":
        return styles.success;
      case "error":
        return styles.error;
      case "warning":
        return styles.warning;
      case "info":
      default:
        return styles.info;
    }
  };

  // Get icon based on toast type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="stroke-success" size={20} />;
      case "error":
        return <AlertCircle className="stroke-destructive" size={20} />;
      case "warning":
        return <AlertTriangle className="stroke-warning-200" size={20} />;
      case "info":
      default:
        return <Info className="stroke-info-200" size={20} />;
    }
  };

  return (
    <div
      className={`${styles.toast} ${getTypeClass()} ${closing ? styles.closing : ""}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={styles.iconContainer}>{getIcon()}</div>
      <div className={styles.content}>
        {typeof message === 'string'
          ? message
          : typeof message === 'object' && message !== null
            ? JSON.stringify(message)
            : String(message)}
      </div>
      <button
        onClick={handleClose}
        className={styles.closeButton}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
