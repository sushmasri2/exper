"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
// import { useApi } from '@/hooks/use-api'; // Not used in this component
import { showToast } from '@/lib/toast';
import { detectInputType, maskEmail, maskMobile } from '@/lib/input-validator';
import styles from './login.module.css';
import PublicRoute from '@/components/public-route';
import { LoginLayout } from './login-layout';
import { GoogleLogin } from '@/components/google-login';

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
  const { sendEmailOTP, sendMobileOTP, verifyEmailOTP, verifyMobileOTP } = useAuth();

  // Form states
  const [identifier, setIdentifier] = useState(''); // Single input for email or mobile
  const [otp, setOtp] = useState('');
  const [detectedType, setDetectedType] = useState<'email' | 'mobile' | 'invalid'>('invalid');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in useEffect
  const [formattedValue, setFormattedValue] = useState(''); // Used internally for formatting
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Resend OTP states
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Check for OAuth callback errors
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error) {
      let errorMsg = 'Authentication failed. Please try again.';

      if (error === 'google_auth_failed') {
        errorMsg = 'Google sign-in failed. Please try again or use OTP login.';
      }

      showToast(errorMsg, 'error');

      // Clean up URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const identifierInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Detect input type as user types
  useEffect(() => {
    const detection = detectInputType(identifier);
    setDetectedType(detection.type);
    // Formatted value is saved but not used elsewhere currently
    // Could be useful for display or validation in the future
    setFormattedValue(detection.formatted);
  }, [identifier]);

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpSent) {
      setCanResend(true);
    }
  }, [resendTimer, otpSent]);

  const handleSendOTP = async () => {

    if (!identifier.trim()) {
      showToast('Please enter your email or mobile number', 'warning');
      identifierInputRef.current?.focus();
      return;
    }

    const detection = detectInputType(identifier);

    if (detection.type === 'invalid') {
      showToast('Please enter a valid email or mobile number', 'warning');
      identifierInputRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (detection.type === 'email') {
        result = await sendEmailOTP(detection.formatted);
      } else {
        result = await sendMobileOTP(detection.formatted);
      }

      if (result.success) {
        setOtpSent(true);
        startResendTimer(); // Start the resend timer
        showToast('OTP sent successfully', 'success');

        // Focus on first OTP input
        setTimeout(() => {
          const firstOtpInput = document.getElementById('otp-0');
          firstOtpInput?.focus();
        }, 100);
      } else {
        showToast(result.message || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
      console.log(nextInput);
    }

    // Check if all 6 digits are entered
    if (newOtpDigits.every(digit => digit !== '')) {
      const fullOtp = newOtpDigits.join('');
      setOtp(fullOtp);
      console.log(fullOtp);
      setTimeout(() => {
        handleVerifyOTP(fullOtp);
      }, 100); // Auto-verify when all digits entered
    }
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits

    if (pasteData.length >= 6 && /^\d+$/.test(pasteData)) {
      const first6Digits = pasteData.substring(0, 6); // Take only first 6 digits
      const newOtpDigits = first6Digits.split('');
      setOtpDigits(newOtpDigits);
      setOtp(first6Digits);
      // Auto-verify on paste
      handleVerifyOTP(first6Digits);
    }
  };

  const handleVerifyOTP = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp;
    if (!otpToVerify.trim()) {
      showToast('Please enter the OTP', 'warning');
      otpInputRef.current?.focus();
      return;
    }
    console.log('Verifying OTP:', otpToVerify);

    const detection = detectInputType(identifier);

    if (detection.type === 'invalid') {
      showToast('Invalid email or mobile number', 'error');
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (detection.type === 'email') {
        result = await verifyEmailOTP(detection.formatted, otpToVerify);
      } else {
        result = await verifyMobileOTP(detection.formatted, otpToVerify);
      }

      if (!('success' in result) || result.success !== false) {
        // Redirect will happen automatically via auth context
      } else {
        otpInputRef.current?.focus();
        setOtpDigits(['', '', '', '', '', '']);
        setOtp('');

        // Focus on first OTP input
        setTimeout(() => {
          const firstOtpInput = document.getElementById('otp-0');
          firstOtpInput?.focus();
        }, 100);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
      showToast(errorMessage, 'error');

      // Reset OTP inputs
      setOtpDigits(['', '', '', '', '', '']);
      setOtp('');

      // Focus on first OTP input
      setTimeout(() => {
        const firstOtpInput = document.getElementById('otp-0');
        firstOtpInput?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyButtonClick = () => {
    handleVerifyOTP();
  };
  // Helper function to start the resend timer
  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(30); // 30 seconds cooldown
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    const detection = detectInputType(identifier);

    setIsLoading(true);
    setCanResend(false);

    try {
      let result;
      if (detection.type === 'email') {
        result = await sendEmailOTP(detection.formatted);
      } else {
        result = await sendMobileOTP(detection.formatted);
      }

      if (result.success) {
        startResendTimer();
        showToast('OTP resent successfully', 'success');
      } else {
        showToast(result.message || 'Failed to resend OTP', 'error');
        setCanResend(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
      showToast(errorMessage, 'error');
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (!otpSent) {
        handleSendOTP();
      } else {
        handleVerifyOTP();
      }
    }
  };

  const resetForm = () => {
    setOtpSent(false);
    setOtp('');
    setOtpDigits(['', '', '', '', '', '']);
    setCanResend(false);
    setResendTimer(0);
  };


  // Get input type hint
  const getInputTypeHint = () => {
    if (!identifier) return null;

    if (detectedType === 'email') {
      return <span className={styles.inputHint}>🔒 An OTP will be sent to your provided Email Address</span>;
    } else if (detectedType === 'mobile') {
      return <span className={styles.inputHint}>🔒 An OTP will be sent to your provided Phone number.</span>;
    } else {
      return <span className={styles.inputHintError}>⚠️ Invalid email or mobile format</span>;
    }
  };

  // Get masked display value for OTP sent message
  const getMaskedDisplay = () => {
    const detection = detectInputType(identifier);

    if (detection.type === 'email') {
      return maskEmail(detection.formatted);
    } else if (detection.type === 'mobile') {
      return maskMobile(detection.formatted);
    }

    return detection.original;
  };

  return (
    <>
      <div className={styles.loginHeader}>
        <h2>Welcome Back</h2>
        <p>Sign in to access your MedAI Content dashboard</p>
      </div>

      {/* Smart Input Field */}


      {/* OTP Input (shown after OTP is sent) */}
      {otpSent ? (
        <div className={styles.formGroup}>
          <label htmlFor="otp" className={styles.formLabel}>
            Enter OTP sent to {getMaskedDisplay()}
          </label>
          <div className={styles.otpContainer}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="tel"
                className={styles.otpInput}
                value={digit}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  handleOtpChange(index, value);
                }}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handleOtpPaste}
                maxLength={1}
                disabled={isLoading}
              />
            ))}
          </div>

          <div className={styles.resendContainer}>
            <button
              type="button"
              className={`${styles.resendButton} ${resendTimer > 0 ? styles.resendDisabled : styles.resendActive
                }`}
              onClick={handleResendOTP}
              disabled={!canResend || isLoading}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </button>
            <button
              type="button"
              className={styles.changeButton}
              onClick={resetForm}
              disabled={isLoading}
            >
              Use Another {detectedType === 'email' ? 'Email' : 'Phone Number'}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.formGroup}>
          <label htmlFor="identifier" className={styles.formLabel}>
            Email or Mobile Number
          </label>
          <input
            type="text"
            id="identifier"
            className={`${styles.formInput} ${detectedType === 'invalid' && identifier ? styles.inputError : ''}`}
            placeholder='Enter email or mobile number'
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyPress={handleKeyPress}
            ref={identifierInputRef}
            disabled={otpSent || isLoading}
            required
          />
          <p className='mt-5'>{getInputTypeHint()}</p>
        </div>)}

      <div className={styles.formCheckbox}>
        <input
          type="checkbox"
          id="remember"
          className={styles.checkbox}
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="remember" className={styles.checkboxLabel}>
          Remember me
        </label>
      </div>

      {/* Action Button */}
      {!otpSent ? (
        <button
          type="button"
          className={`${styles.btnPrimary} ${isLoading ? styles.btnLoading : ''}`}
          onClick={handleSendOTP}
        >
          {isLoading ? 'Sending OTP...' : `Send OTP`}
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.btnPrimary} ${isLoading ? styles.btnLoading : ''}`}
          onClick={handleVerifyButtonClick}
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      )}

      <div className={styles.divider}>
        <span>OR</span>
      </div>

      {/* <a href="#" className={styles.socialLogin} onClick={(e) => {
        e.preventDefault();
        showToast('Google login is not available. Please use OTP login.', 'info');
      }}>
        <div className={styles.googleIcon}></div>
        Continue with Google
      </a> */}

      <GoogleLogin
        disabled={isLoading}
        onSuccess={() => {
          // Optional: additional success handling
        }}
        onError={(errorMsg) => {
          // Optional: additional error handling using errorMsg
          console.error('Google login error:', errorMsg);
        }}
      />

      <div className={styles.poweredBy}>
        Powered by <a href="https://medvarsity.com" target="_blank">Medvarsity</a>
      </div>
    </>
  );
}