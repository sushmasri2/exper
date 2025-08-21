"use client";

import { useEffect } from 'react';

// This component handles client-side theme logic
export function ThemeProviderClient() {
  // This effect runs before any content is visible
  useEffect(() => {
    // Apply theme immediately before anything else renders
    try {
      const storedTheme = localStorage.getItem('theme');
      const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = storedTheme ? storedTheme === 'dark' : systemDarkMode;

      // Apply theme immediately
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#0a0a0a';
        document.documentElement.style.color = '#ededed';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.backgroundColor = '#ffffff';
        document.documentElement.style.color = '#171717';
      }      // Prevent transitions initially
      document.documentElement.classList.add('no-transitions');
    } catch {
      // Silent fail for SSR
    }
  }, []);

  // This effect handles theme changes after initial render
  useEffect(() => {
    try {
      // Set up listener for theme changes from localStorage
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'theme') {
          const newTheme = event.newValue;
          const isDark = newTheme === 'dark';

          // First disable transitions
          document.documentElement.classList.add('no-transitions');

          // Update theme
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          // Re-enable transitions after a short delay
          setTimeout(() => {
            document.documentElement.classList.remove('no-transitions');
          }, 5);
        }
      };

      // Listen for changes to localStorage from other tabs/windows
      window.addEventListener('storage', handleStorageChange);

      // Get the theme preference on component mount as a backup
      const savedTheme = localStorage.getItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const wantDark = savedTheme ? savedTheme === 'dark' : systemDark;

      // Apply the theme
      if (wantDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = (e: MediaQueryListEvent) => {
        const currentTheme = localStorage.getItem('theme');
        // Only apply if theme is set to system (null or 'system')
        if (currentTheme !== 'light' && currentTheme !== 'dark') {
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      };

      mediaQuery.addEventListener('change', handleMediaChange);

      // Enable smooth transitions after a delay
      setTimeout(() => {
        document.documentElement.classList.remove('no-transitions');
        document.documentElement.classList.add('theme-transition-ready');
      }, 100);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        mediaQuery.removeEventListener('change', handleMediaChange);
      };
    } catch (e) {
      // Fail silently - SSR or other issues
      console.error('Theme provider error:', e);
    }
  }, []);

  return null;
}
