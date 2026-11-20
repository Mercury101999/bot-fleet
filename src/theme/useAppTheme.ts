import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';

import type { ThemePreference } from '@/lib/types';
import { useFleet } from '@/store/FleetStore';
import { palettes, type Palette } from '@/theme/tokens';
import { useReducedMotion } from '@/theme/useReducedMotion';

export function useAppTheme(): {
  mode: 'light' | 'dark';
  colors: Palette;
  preference: ThemePreference;
  setPreference: (theme: ThemePreference) => void;
  reducedMotion: boolean;
} {
  const { state, dispatch } = useFleet();
  const system = useColorScheme();
  const reducedMotion = useReducedMotion();
  const preference = state.settings.theme;
  const mode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const colors = palettes[mode];

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg);
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = colors.bg;
    document.body.style.backgroundColor = colors.bg;
    document.documentElement.style.setProperty('--focus', colors.focus);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', colors.bg);
  }, [colors]);

  return {
    mode,
    colors,
    preference,
    reducedMotion,
    setPreference: (theme) => dispatch({ type: 'setTheme', theme }),
  };
}
