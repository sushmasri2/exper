"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { showToast } from '@/lib/toast';
import styles from '../app/login/login.module.css';
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
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogle = async () => {
      // Load Google Identity Services script
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          initializeGoogleSignIn();
        };
        
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    };

    const initializeGoogleSignIn = () => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.error('Google Client ID not found');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
        });
      }
    };

    initializeGoogle();
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const result = await googleLogin(response.credential);
      
      if (result.success) {
        onSuccess?.();
      } else {
        const errorMsg = result.message || 'Google login failed';
        showToast(errorMsg, 'error');
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Google authentication failed';
      showToast(errorMsg, 'error');
      onError?.(errorMsg);
    }
  };

  return (
    <div 
    className={styles.socialLogin}
      ref={googleButtonRef} 
      style={{ 
        opacity: disabled ? 0.6 : 1, 
        pointerEvents: disabled ? 'none' : 'auto',
        border: 'none'
      }}
    />
  );
}