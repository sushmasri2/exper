"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { showToast } from '@/lib/toast';
import styles from './login.module.css';
import PublicRoute from '@/components/public-route';
import { LoginLayout } from './login-layout';

export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginLayout>
        <LoginContent />
      </LoginLayout>
    </PublicRoute>
  );
}

function LoginContent() {
  const { sendOTP, verifyAndLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  // Reference to email input for focusing
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showToast('Please enter your email', 'warning');
      // Focus the email field
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
      return;
    }
    setIsLoading(true);
    const result = await sendOTP(email);
    setIsLoading(false);
    if (result.success) {
      setIsSent(true);
      setOtpSent(true);
      setTimeout(() => setIsSent(false), 2000);
    } else {
      // Show toast for all errors
      const errorMsg = result.message || 'An error occurred during login';
      showToast(errorMsg, 'error');

      // Focus the email field on error (Task 2)
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      showToast('Please enter the OTP', 'warning');
      return;
    }
    setIsLoading(true);
    const result = await verifyAndLogin(email, otp);
    setIsLoading(false);

    if (!result.success) {
      // Show toast for all errors
      const errorMsg = result.message || 'An error occurred during OTP verification';
      showToast(errorMsg, 'error');
    }
  };

  const handleGoogleLogin = async () => {
    // Google login is not implemented in this version
    showToast('Google login is not available. Please use OTP login.', 'info');
  };

  // Handle Enter key press to submit the form
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (!otpSent) {
        // If we're on the email field, submit OTP request
        handleSendOTP();
      } else {
        // If we're on the OTP field, verify OTP
        handleVerifyOTP();
      }
    }
  };

  return (
    <>
      <div className={styles.loginHeader}>
        <h2>Welcome Back</h2>
        <p>Sign in to access your MedAI Content dashboard</p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.formLabel}>Email</label>
        <input
          type="email"
          id="email"
          className={styles.formInput}
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          ref={emailInputRef}
          required
        />
      </div>

      {otpSent && (
        <div className={styles.formGroup}>
          <label htmlFor="otp" className={styles.formLabel}>Enter OTP</label>
          <input
            type="text"
            id="otp"
            className={styles.formInput}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            onKeyPress={handleKeyPress}
            required
          />
        </div>
      )}

      <div className={styles.formCheckbox}>
        <input
          type="checkbox"
          id="remember"
          className={styles.checkbox}
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="remember" className={styles.checkboxLabel}>Remember me for 30 days</label>
      </div>

      {!otpSent ? (
        <button
          type="button"
          className={`${styles.btnPrimary} ${isLoading ? styles.btnLoading : ''} ${isSent ? styles.btnSuccess : ''}`}
          onClick={handleSendOTP}
          disabled={isLoading || isSent}
        >
          {isLoading ? 'Sending OTP...' : isSent ? 'OTP Sent!' : 'Get OTP'}
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.btnPrimary} ${isLoading ? styles.btnLoading : ''}`}
          onClick={handleVerifyOTP}
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      )}

      <div className={styles.divider}>
        <span>OR</span>
      </div>

      <a href="#" className={styles.socialLogin} onClick={(e) => { e.preventDefault(); handleGoogleLogin(); }}>
        <div className={styles.googleIcon}></div>
        Continue with Google
      </a>

      <div className={styles.poweredBy}>
        Powered by <a href="https://medvarsity.com" target="_blank">Medvarsity </a>
      </div>
    </>
  );
}
