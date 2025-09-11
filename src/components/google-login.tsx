"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { showToast } from "@/lib/toast";
import styles from "../app/login/login.module.css";

interface GoogleLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

// Load the Google API library
const loadGoogleScript = () => {
  return new Promise<void>((resolve) => {
    if (typeof window !== 'undefined' && document.getElementById('google-script')) {
      resolve();
      return;
    }

    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.id = 'google-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    } else {
      resolve(); // Resolve immediately on server side
    }
  });
};

function GoogleLoginComponent({ onSuccess, onError, disabled }: GoogleLoginProps) {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const buttonRef = React.useRef<HTMLDivElement>(null);

  // Keep track of initialization status to prevent re-initialization
  const [isInitialized, setIsInitialized] = useState(false);

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    if (!response.credential) return;

    setIsLoading(true);
    try {
      // Send the credential to our authentication context
      const result = await googleLogin(response.credential);

      if (result.success) {
        onSuccess?.();
      } else {
        showToast(result.message || "Google authentication failed", "error");
        onError?.(result.message || "Google authentication failed");
      }
    } catch (error) {
      console.error('Google authentication failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Google authentication failed';
      showToast(errorMsg, "error");
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [googleLogin, onSuccess, onError]);

  useEffect(() => {
    // Skip if already initialized or disabled
    if (isInitialized || typeof window === 'undefined') return;

    const initGoogleLogin = async () => {
      try {
        await loadGoogleScript();

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId) {
          const errorMsg = "Google Client ID not found";
          showToast(errorMsg, "error");
          setError(errorMsg);
          onError?.(errorMsg);
          return;
        }

        // Initialize Google Sign-In
        window.google?.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button
        if (buttonRef.current) {
          window.google?.accounts.id.renderButton(
            buttonRef.current,
            { theme: 'outline', size: 'large', width: 250 }
          );
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Failed to initialize Google Sign-In', err);
        const errorMsg = 'Failed to load Google Sign-In. Please try another login method.';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    };

    initGoogleLogin();

    return () => {
      // Clean up if needed
      if (typeof window !== 'undefined' && window.google?.accounts) {
        window.google.accounts.id.cancel();
      }
    };
  }, [isInitialized, onError, handleCredentialResponse]);

  // handleCredentialResponse is defined above using useCallback and included in the dependency array

  return (
    <div className={styles.googleSigninContainer}>
      <div
        ref={buttonRef}
        id="google-signin-button"
        className={disabled || isLoading ? styles.disabled : ''}
      ></div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

// Export a memoized version to prevent unnecessary re-renders
export const GoogleLogin = React.memo(GoogleLoginComponent);