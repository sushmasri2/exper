"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
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
  const [formattedValue, setFormattedValue] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Resend OTP states
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const identifierInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Detect input type as user types
  useEffect(() => {
    const detection = detectInputType(identifier);
    setDetectedType(detection.type);
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

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(30);
  };

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

    let result;
    if (detection.type === 'email') {
      result = await sendEmailOTP(detection.formatted);
    } else {
      result = await sendMobileOTP(detection.formatted);
    }

    setIsLoading(false);

    if (result.success) {
      setOtpSent(true);
      startResendTimer();
      showToast(result.message, 'success');
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } else {
      showToast(result.message, 'error');
      identifierInputRef.current?.focus();
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

    if (pasteData.length === 6) {
      const newOtpDigits = pasteData.split('');
      setOtpDigits(newOtpDigits);
      setOtp(pasteData);
      // Auto-verify on paste
      handleVerifyOTP(pasteData);
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

    let result;
    if (detection.type === 'email') {
      result = await verifyEmailOTP(detection.formatted, otpToVerify);
    } else {
      result = await verifyMobileOTP(detection.formatted, otpToVerify);
    }

    setIsLoading(false);

    if (!result.success) {
      showToast(result.message || 'OTP verification failed', 'error');
      otpInputRef.current?.focus();
    }
  };
  const handleVerifyButtonClick = () => {
    handleVerifyOTP();
  };
  const handleResendOTP = async () => {
    if (!canResend) return;

    const detection = detectInputType(identifier);

    setIsLoading(true);

    let result;
    if (detection.type === 'email') {
      result = await sendEmailOTP(detection.formatted);
    } else {
      result = await sendMobileOTP(detection.formatted);
    }

    setIsLoading(false);

    if (result.success) {
      startResendTimer();
      showToast('OTP resent successfully', 'success');
    } else {
      showToast(result.message, 'error');
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
      return <span className={styles.inputHint}>Email detected</span>;
    } else if (detectedType === 'mobile') {
      return <span className={styles.inputHint}>Mobile detected</span>;
    } else {
      return <span className={styles.inputHintError}>⚠️ Invalid format</span>;
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
                type="text"
                className={styles.otpInput}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
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
              className={styles.resendButton}
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
              Change {detectedType === 'email' ? 'Email' : 'Mobile'}
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
          {getInputTypeHint()}
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
          Remember me for 30 days
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
        onError={(error) => {
          // Optional: additional error handling
        }}
      />

      <div className={styles.poweredBy}>
        Powered by <a href="https://medvarsity.com" target="_blank">Medvarsity</a>
      </div>
    </>
  );
}