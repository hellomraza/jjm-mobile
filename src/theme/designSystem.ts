import { perfectSize } from '../utils/perfectSize';

export const fontSize = {
  xs: perfectSize(12),
  sm: perfectSize(14),
  md: perfectSize(16),
  lg: perfectSize(18),
  xl: perfectSize(22),
  xxl: perfectSize(28),
  xxxl: perfectSize(32),
} as const;

export const spacing = {
  xxs: perfectSize(4),
  xs: perfectSize(8),
  sm: perfectSize(12),
  md: perfectSize(16),
  lg: perfectSize(20),
  xl: perfectSize(24),
  xxl: perfectSize(32),
  xxxl: perfectSize(40),
} as const;

export const radius = {
  sm: perfectSize(8),
  md: perfectSize(12),
  lg: perfectSize(16),
  pill: perfectSize(999),
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const size = {
  buttonHeight: perfectSize(48),
  inputHeight: perfectSize(48),
  cardMinHeight: perfectSize(72),
} as const;
