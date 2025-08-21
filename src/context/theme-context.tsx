"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type ThemeType = 'light' | 'dark' | 'system';
type LayoutDensity = 'compact' | 'comfortable' | 'spacious';

interface ThemeContextType {
  theme: ThemeType;
  density: LayoutDensity;
  currentTheme: 'light' | 'dark'; // actual applied theme after system preference is considered
  setTheme: (theme: ThemeType) => void;
  setDensity: (density: LayoutDensity) => void;
  applyChanges: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Always use default values for the initial render to avoid hydration mismatches
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [pendingTheme, setPendingTheme] = useState<ThemeType>('system');

  // Get saved density from localStorage or default to 'comfortable'
  const [density, setDensityState] = useState<LayoutDensity>('comfortable');
  const [pendingDensity, setPendingDensity] = useState<LayoutDensity>('comfortable');

  // Always use 'light' as initial value to prevent hydration mismatch
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Track if we're hydrated
  const [isHydrated, setIsHydrated] = useState(false);  // Mark as hydrated after the first render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize theme from localStorage on mount with hydration safety
  useEffect(() => {
    // Only run this after we're hydrated to avoid mismatches
    if (!isHydrated) return;

    try {
      const savedTheme = localStorage.getItem('theme') as ThemeType;
      const savedDensity = localStorage.getItem('density') as LayoutDensity;

      if (savedTheme) {
        setThemeState(savedTheme);
        setPendingTheme(savedTheme);
      }

      if (savedDensity) {
        setDensityState(savedDensity);
        setPendingDensity(savedDensity);
      }
    } catch {
      // Fail silently
    }
  }, [isHydrated]);

  // Update actual theme when theme preference changes or system preference changes
  useEffect(() => {
    // Only run after hydration to avoid mismatches
    if (!isHydrated) return;

    try {
      // Handle system theme preference
      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Set initial value
        setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');

        // Update theme when system preference changes
        const handleChange = (e: MediaQueryListEvent) => {
          setCurrentTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Directly use the selected theme
        setCurrentTheme(theme === 'dark' ? 'dark' : 'light');
      }
    } catch {
      // Fail silently
    }
  }, [theme, isHydrated]);

  // Apply theme to document with anti-flash measures
  useEffect(() => {
    // Only run after hydration to avoid mismatches
    if (!isHydrated) return;

    try {
      // First disable transitions
      document.documentElement.classList.add('no-transitions');

      // Add or remove dark class based on current theme
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Apply density class
      document.documentElement.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
      document.documentElement.classList.add(`density-${density}`);

      // Re-enable transitions after a short delay
      setTimeout(() => {
        document.documentElement.classList.remove('no-transitions');
        document.documentElement.classList.add('theme-transition-ready');
      }, 5);
    } catch (e) {
      // Fail silently
      console.error('Theme context error:', e);
    }
  }, [currentTheme, density, isHydrated]);

  // Set theme with pending state
  const setTheme = (newTheme: ThemeType) => {
    setPendingTheme(newTheme);
  };

  // Set density with pending state
  const setDensity = (newDensity: LayoutDensity) => {
    setPendingDensity(newDensity);
  };

  // Apply pending changes with anti-flash protection
  const applyChanges = () => {
    try {
      // First disable transitions to prevent flash
      document.documentElement.classList.add('no-transitions');

      // Update actual theme and density
      setThemeState(pendingTheme);
      setDensityState(pendingDensity);

      // Save to localStorage
      localStorage.setItem('theme', pendingTheme);
      localStorage.setItem('density', pendingDensity);

      // Re-enable transitions after a brief delay
      setTimeout(() => {
        document.documentElement.classList.remove('no-transitions');
      }, 5);
    } catch (e) {
      console.error('Error applying theme changes:', e);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      density,
      currentTheme,
      setTheme,
      setDensity,
      applyChanges
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
