"use client";

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  // Add a client-side only state to handle hydration
  const [hasMounted, setHasMounted] = useState(false);

  // Set hasMounted to true when component mounts (client-side only)
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router, hasMounted]);

  // During initial server render and before hydration, always render children
  // to avoid hydration mismatch
  if (!hasMounted) {
    return <>{children}</>;
  }

  // After hydration, we can safely show the loading spinner
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
