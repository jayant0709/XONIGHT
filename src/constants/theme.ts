export const colors = {
  // Brand Colors (from web app)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Purple shades (for gradients)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Orange shades (for promotional gradients)
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Pink shades (for gradients)
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  
  // Green shades (for success/eco themes)
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Teal shades (for gradients)
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  
  // Red shades (for discounts/alerts)
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Yellow shades (for ratings/highlights)
  yellow: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // White and Black
  white: '#ffffff',
  black: '#000000',
};

export const gradients = {
  // Hero banner gradients (matching web app)
  heroBanner: [
    { colors: ['#f97316', '#ec4899'] as const, name: 'orange-pink' }, // Orange to Pink
    { colors: ['#a855f7', '#3b82f6'] as const, name: 'purple-blue' }, // Purple to Blue
    { colors: ['#22c55e', '#14b8a6'] as const, name: 'green-teal' }, // Green to Teal
  ],
  
  // Brand gradient (primary)
  brand: ['#3b82f6', '#a855f7'] as const, // Blue to Purple
  
  // Promotional gradients
  promo: {
    primary: ['#f97316', '#fbbf24'] as const, // Orange to Yellow
    secondary: ['#ec4899', '#f472b6'] as const, // Pink gradient
    tertiary: ['#22c55e', '#4ade80'] as const, // Green gradient
    accent: ['#a855f7', '#c084fc'] as const, // Purple gradient
  },
  
  // Background gradients
  background: {
    light: ['#ffffff', '#f9fafb'] as const,
    primary: ['#dbeafe', '#e9d5ff'] as const, // Light blue to light purple
    warm: ['#fed7aa', '#fecaca'] as const, // Light orange to light pink
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// Theme variants for different components
export const componentThemes = {
  button: {
    primary: {
      background: colors.primary[500],
      backgroundHover: colors.primary[600],
      text: colors.white,
    },
    secondary: {
      background: colors.gray[100],
      backgroundHover: colors.gray[200],
      text: colors.gray[700],
    },
    gradient: {
      colors: gradients.brand,
      text: colors.white,
    },
  },
  
  card: {
    default: {
      background: colors.white,
      border: colors.gray[200],
      shadow: shadows.small,
    },
    elevated: {
      background: colors.white,
      border: colors.gray[100],
      shadow: shadows.medium,
    },
  },
  
  chip: {
    inactive: {
      background: colors.white,
      border: colors.gray[200],
      text: colors.gray[600],
    },
    active: {
      background: colors.primary[500],
      border: colors.primary[500],
      text: colors.white,
    },
    gradient: {
      colors: gradients.brand,
      text: colors.white,
    },
  },
};

export default {
  colors,
  gradients,
  spacing,
  borderRadius,
  shadows,
  typography,
  componentThemes,
};