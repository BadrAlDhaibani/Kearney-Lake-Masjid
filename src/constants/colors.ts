/**
 * App color palette
 *
 * Usage: import { colors } from '@/src/constants/colors';
 */

export const colors = {
  // Primary brand colors (green palette)
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  primaryTint: '#E8F5E9',
  primaryTintLight: '#C8E6C9',

  // Backgrounds
  background: '#f5f5f5',
  backgroundWhite: '#fff',

  // Text colors
  textPrimary: '#212121',
  textSecondary: '#666',
  textTertiary: '#757575',
  textMuted: '#999',
  textDark: '#333',
  textMedium: '#555',

  // Borders
  border: '#e0e0e0',
  borderLight: '#ddd',

  // Status colors
  error: '#d32f2f',
  warning: '#E65100',
  warningBackground: '#FFF3E0',

  // Shadows
  shadow: '#000',

  // Tab bar
  tabActive: '#1B5E20',
  tabInactive: '#8e8e93',

  // Switch/toggle
  switchTrackActive: '#C8E6C9',
  switchTrackInactive: '#ccc',
  switchThumbActive: '#1B5E20',
  switchThumbInactive: '#f4f3f4',

  // Common
  white: '#fff',
  black: '#000',
} as const;

// Type for color keys
export type ColorKey = keyof typeof colors;