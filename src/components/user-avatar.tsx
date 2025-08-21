"use client";

import { useAuth } from "@/context/auth-context";
import styles from '@/app/dashboard/dashboard-layout.module.css';

export default function UserAvatar() {
  const { user } = useAuth();
  const letter = (user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();

  // Completely reset styles and apply precise centering
  return (
    <div className={styles.userAvatar} style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        lineHeight: '1',
        textAlign: 'center',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {letter}
      </span>
    </div>
  );
}
