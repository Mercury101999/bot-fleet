import type { BotStatus } from '@/lib/types';

export interface StatusTone {
  bg: string;
  ink: string;
}

export interface Palette {
  bg: string;
  elevated: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  accentSoftInk: string;
  danger: string;
  dangerSoft: string;
  focus: string;
  tabBar: string;
  shadow: string;
  mapLine: string;
  status: Record<BotStatus, StatusTone>;
}

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    bg: '#E8EEF2',
    elevated: '#F7FBFC',
    ink: '#12202A',
    muted: '#3A4C59',
    line: '#D3DEE4',
    accent: '#0C6E6A',
    accentInk: '#F4FFFD',
    accentSoft: '#D7F3EF',
    accentSoftInk: '#084743',
    danger: '#8C2F2F',
    dangerSoft: '#F8E6E4',
    focus: '#0C6E6A',
    tabBar: '#F7FBFC',
    shadow: 'rgba(16, 32, 42, 0.08)',
    mapLine: '#7E97A3',
    status: {
      active: { bg: '#E5F6EE', ink: '#0B5A36' },
      paused: { bg: '#FFF3D6', ink: '#6B4500' },
      idea: { bg: '#E6F0FA', ink: '#163E6B' },
      retired: { bg: '#ECEFF1', ink: '#3E4A51' },
    },
  },
  dark: {
    bg: '#0E1519',
    elevated: '#172127',
    ink: '#E7F0F3',
    muted: '#B7C6CE',
    line: '#2C3B44',
    accent: '#2FBFB4',
    accentInk: '#042421',
    accentSoft: '#143632',
    accentSoftInk: '#C8F6F1',
    danger: '#F0B4AC',
    dangerSoft: '#3A2422',
    focus: '#8FE0D8',
    tabBar: '#121A1F',
    shadow: 'rgba(0, 0, 0, 0.35)',
    mapLine: '#6E8794',
    status: {
      active: { bg: '#12352A', ink: '#9BE7C4' },
      paused: { bg: '#3A2E16', ink: '#F3D48A' },
      idea: { bg: '#182C44', ink: '#B9D4F5' },
      retired: { bg: '#2A3238', ink: '#C5D0D6' },
    },
  },
};

export const fonts = {
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
} as const;
