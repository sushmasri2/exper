"use client";

import { ReactNode, useEffect, useState } from 'react';
import styles from './login.module.css';

interface LoginLayoutProps {
  children: ReactNode;
}

export function LoginLayout({ children }: LoginLayoutProps) {
  // This state ensures the layout is always rendered, even during hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Always render the layout structure, even if not mounted yet
  // This prevents layout shifts and flashing
  return (
    <div className={styles.body} style={{ opacity: mounted ? 1 : 0.8, transition: 'opacity 0.3s' }}>
      <div className={styles.bgShapes}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.heroSection}>
          <h1>Content Made Simple</h1>
          <p>Streamline your workflow with our powerful, intuitive content platform designed for modern teams.</p>

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
          {children}
        </div>
      </div>
    </div>
  );
}
