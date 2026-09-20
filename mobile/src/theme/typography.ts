import { StyleSheet } from 'react-native';
import { fontFamily, fontSize, lineHeight, fontWeight } from './tokens';
import type { Theme } from './ThemeProvider';

export const makeTypography = (theme: Theme) =>
  StyleSheet.create({
    h1: {
      fontFamily: fontFamily.bold,
      fontSize: fontSize.xxxl,
      lineHeight: lineHeight.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.text,
    },
    h2: {
      fontFamily: fontFamily.bold,
      fontSize: fontSize.xxl,
      lineHeight: lineHeight.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text,
    },
    h3: {
      fontFamily: fontFamily.semibold,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      fontWeight: fontWeight.semibold,
      color: theme.text,
    },
    bodyLg: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      color: theme.text,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
    },
    bodySm: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
    },
    caption: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
    },
    button: {
      fontFamily: fontFamily.semibold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      fontWeight: fontWeight.semibold,
      color: theme.accent,
    },
  });