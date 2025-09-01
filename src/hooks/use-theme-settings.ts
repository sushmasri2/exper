"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useState, useEffect } from "react";

export function useThemeSettings() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [mounted, setMounted] = useState(false);

  // Local state to track pending theme changes
  const [pendingTheme, setPendingTheme] = useState(theme);
  const [pendingDensity, setPendingDensity] = useState(density);

  // Update when theme changes externally
  useEffect(() => {
    if (theme) {
      setPendingTheme(theme);
    }
  }, [theme]);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  const applyChanges = () => {
    if (pendingTheme) {
      setTheme(pendingTheme);
    }
    setDensity(pendingDensity);
  };

  // Return everything as undefined during SSR
  if (!mounted) {
    return {
      theme: undefined,
      systemTheme: undefined,
      pendingTheme: undefined,
      pendingDensity: undefined,
      density,
      setTheme: () => {},
      setPendingTheme: () => {},
      setDensity: () => {},
      setPendingDensity: () => {},
      applyChanges: () => {},
    };
  }

  return {
    theme,
    systemTheme,
    pendingTheme,
    pendingDensity,
    density,
    setTheme,
    setPendingTheme,
    setDensity,
    setPendingDensity,
    applyChanges,
  };
}
