"use client";

import { useState } from 'react';
// Removed unused import: useRouter
import { useAuth } from '@/context/auth-context';
import styles from './login.module.css';
import PublicRoute from '@/components/public-route';
// Note: metadata is handled by metadata.ts file in this directory

export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginContent />
    </PublicRoute>
  );
}

function LoginContent() {
  //   const router = useRouter();
  const { login, loginWithGoogle, sendOTP, verifyOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');


  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Email or 10-digit mobile number is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email) && !phoneRegex.test(email)) {
      return 'Enter valid email or 10-digit mobile number';
    }
    return '';
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Real-time validation
    const error = validateEmail(value);
    setEmailError(error);
  };
  const handleSendOTP = async () => {
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    // Add loading state
    setIsLoading(true);

    try {
      // Use auth context to send OTP
      const success = await sendOTP(email);

      if (success) {
        setIsLoading(false);
        setIsSent(true);
        setOtpSent(true);

        // Show success message temporarily
        setTimeout(() => {
          setIsSent(false);
        }, 2000);
      } else {
        setIsLoading(false);
        alert('Failed to send OTP. Please try again.');
      }
      setEmailError('');
    } catch (error) {
      setIsLoading(false);
      console.error('OTP send error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      return setOtpError('Please enter the OTP sent to your email/mobile');
    }
    if (otp.length !== 6) {
      return setOtpError('OTP must be 6 digits');
    }
    setIsLoading(true);

    try {
      // ✅ CORRECT: Use verifyOTP from auth context
      const isValid = await verifyOTP(email, otp);

      if (isValid) {
        // OTP verification successful, now login
        setIsLoading(false);
        await login(email);
        // Router push is handled by the auth context
      } else {
        // OTP verification failed
        setIsLoading(false);
        setOtpError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('OTP verification error:', error);
      alert('An error occurred during OTP verification. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Use auth context to handle Google login
      await loginWithGoogle();
      // Router push is handled by the auth context
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed. Please try again.');
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.bgShapes}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.heroSection}>
          <h1>Content Management Made Simple</h1>
          <p>Streamline your workflow with our powerful, intuitive content management system designed for modern teams.</p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⚡</div>
              <span>Lightning Fast</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔒</div>
              <span>Secure & Safe</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📱</div>
              <span>Mobile Ready</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🚀</div>
              <span>Easy to Use</span>
            </div>
          </div>
        </div>

        <div className={styles.loginSection}>
          <div className={styles.loginHeader}>
            <h2>Welcome Back</h2>
            <p>Sign in to access your content management dashboard</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email or Mobile Number</label>
            <input
              type="text"
              id="email"
              className={styles.formInput}
              placeholder="Enter your email or mobile number"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError && (
              <p className='error-email mt-3 text-red-500'>{emailError}</p>
            )}
          </div>

          {otpSent && (
            <div className={styles.formGroup}>
              <label htmlFor="otp" className={styles.formLabel}>Enter OTP</label>
              <input
                type="text"
                id="otp"
                className={styles.formInput}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                inputMode="numeric"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setOtpError(''); // Clear error when typing
                }}
                required
              />
              {otpError && (
                <p className='error-otp mt-3 text-red-500'>{otpError}</p>
              )}
            </div>
          )}

          <div className={styles.formCheckbox}>
            <input type="checkbox" id="remember" className={styles.checkbox} />
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
            Powered by <a href="#" target="_blank">Medvarsity </a>
          </div>
        </div>
      </div>
    </div>
  );
}
