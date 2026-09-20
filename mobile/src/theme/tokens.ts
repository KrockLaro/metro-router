export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F2F2F7',
  gray200: '#E5E5EA',
  gray300: '#D1D1D6',
  gray400: '#C7C7CC',
  gray500: '#8E8E93',
  gray600: '#636366',
  gray700: '#3A3A3C',
  gray800: '#2C2C2E',
  gray900: '#1C1C1E',
  gray950: '#0F0F10',

  blue: '#0A84FF',
  blueDark: '#0060DF',
  red: '#FF3B30',
  redDark: '#D70015',
  green: '#34C759',
  greenDark: '#248A3D',
  yellow: '#FFCC00',
  orange: '#FF9500',

  cppkRed: '#E5231B',
  mccPink: '#D51E80',
  mcd1Yellow: '#F6A800',
  mcd2Magenta: '#E4007E',
  mcd3Orange: '#F79E1B',
  mcd4Green: '#00A651',
} as const;

export const fontFamily = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  mono: 'Menlo',
} as const;

export const fontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 32,
} as const;

export const lineHeight = {
  xs: 14, sm: 18, md: 20, lg: 22, xl: 26, xxl: 30, xxxl: 38,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const spacing = {
  xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
} as const;

export const radius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, pill: 999,
} as const;

export const shadow = {
  none: {},
  sm: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const duration = {
  fast: 150, normal: 250, slow: 450,
} as const;

export const zIndex = {
  base: 0, map: 10, overlay: 50, search: 100, sheet: 200, modal: 1000,
} as const;