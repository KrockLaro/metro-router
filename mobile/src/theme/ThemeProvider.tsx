import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette } from './tokens';

export interface Theme {
  name: 'light' | 'dark';
  bg: string;
  mapBg: string;
  card: string;
  text: string;
  textMuted: string;
  icon: string;
  iconMuted: string;
  border: string;
  accent: string;
  danger: string;
  success: string;
  stationFill: string;
  stationStroke: string;
  sheetBg: string;
}

export const LIGHT: Theme = {
  name: 'light',
  bg: palette.white,
  mapBg: palette.gray50,
  card: palette.white,
  text: palette.gray900,
  textMuted: palette.gray500,
  icon: palette.gray800,
  iconMuted: palette.gray400,
  border: palette.gray200,
  accent: palette.blue,
  danger: palette.red,
  success: palette.green,
  stationFill: palette.white,
  stationStroke: palette.gray900,
  sheetBg: palette.white,
};

export const DARK: Theme = {
  name: 'dark',
  bg: palette.gray950,
  mapBg: '#151517',
  card: palette.gray900,
  text: '#F2F2F7',
  textMuted: palette.gray500,
  icon: '#E5E5EA',
  iconMuted: '#7C7C82',
  border: palette.gray800,
  accent: palette.blue,
  danger: '#FF453A',
  success: '#32D74B',
  stationFill: palette.gray800,
  stationStroke: '#E5E5EA',
  sheetBg: palette.gray900,
};

interface Ctx {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<Ctx>({ theme: LIGHT, toggle: () => {} });

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const [mode, setMode] = useState<'light' | 'dark'>(system === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    });
  }, []);

  const toggle = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    AsyncStorage.setItem('theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme: mode === 'dark' ? DARK : LIGHT, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);