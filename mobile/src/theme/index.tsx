import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';
import {
  darkColors,
  lightColors,
  radius,
  shadow,
  space,
  type,
  type ThemeColors,
} from './tokens';

export interface Theme {
  colors: ThemeColors;
  space: typeof space;
  radius: typeof radius;
  type: typeof type;
  shadow: ReturnType<typeof shadow>;
  isDark: boolean;
}

const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

const ThemeContext = createContext<Theme | null>(null);

/**
 * Follows the OS light/dark setting. The app has no in-app theme switch by design —
 * "light and dark modes" means respecting the device, which is what users expect.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  // Match the static HTML on hydration, then apply the device preference.
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const isDark = hydrated && scheme === 'dark';
  const value = useMemo<Theme>(() => {
    const colors = isDark ? darkColors : lightColors;
    return { colors, space, radius, type, shadow: shadow(colors.shadow), isDark };
  }, [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export * from './tokens';
