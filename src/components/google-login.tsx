"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { showToast } from "@/lib/toast";
import styles from "../app/login/login.module.css";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function GoogleLogin({ onSuccess, onError, disabled }: GoogleLoginProps) {
  const { googleLogin } = useAuth();

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
          console.error("Google Client ID not found");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const result = await googleLogin(response.credential);

      if (result.success) {
        onSuccess?.();
      } else {
        const errorMsg = result.message || "Google login failed";
        showToast(errorMsg, "error");
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = "Google authentication failed";
      showToast(errorMsg, "error");
      onError?.(errorMsg);
    }
  };

  const handleCustomGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      // Show Google prompt
      window.google.accounts.id.prompt();
    }
  };

  return (
    <button
      type="button"
      className={styles.socialLogin}
      onClick={handleCustomGoogleLogin}
      disabled={disabled}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className={styles.googleIcon}
      />
      Continue with Google
    </button>
  );
}
