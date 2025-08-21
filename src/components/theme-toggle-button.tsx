"use client";

import { useTheme } from "@/context/theme-context";
import { useState, useEffect } from "react";

export default function ThemeToggleButton() {
  const { setTheme, applyChanges } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light');

  // After mounting, we can safely show the button
  useEffect(() => {
    setMounted(true);

    // Initialize local theme state from localStorage directly
    try {
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = storedTheme === 'dark' || (storedTheme !== 'light' && systemPrefersDark);
      setLocalTheme(isDark ? 'dark' : 'light');
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
  }, []);

  const toggleTheme = () => {
    // Use local state to update immediately
    const newTheme = localTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(newTheme);

    // Update localStorage directly for immediate effect
    try {
      localStorage.setItem('theme', newTheme);

      // Apply the theme class directly to HTML element
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Also update context if available
      try {
        setTheme(newTheme);
        applyChanges();
      } catch {
        console.log("Context methods not available, using direct DOM manipulation");
      }
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  // Don't render anything until after mounting to prevent hydration mismatch
  if (!mounted) {
    return <div className="w-9 h-9"></div>;
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
      aria-label={`Switch to ${localTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {localTheme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
