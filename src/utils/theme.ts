// src/utils/theme.ts
// עיצוב Dark Mode מעודכן בהתאם לדרישות החדשות

import { I18nManager } from 'react-native';

export const theme = {
  colors: {
    // Primary Colors - בהתאם לדרישות החדשות
    primary: '#2979FF',        // Soft blue for primary actions
    primaryLight: '#5AC8FA',   
    primaryDark: '#0051D5',    
    
    // Background Colors - כהים בהתאם לדרישות
    background: '#121212',     // Very dark charcoal/black בדיוק כמו בדרישות
    surface: '#1E1E1E',        // Slightly lighter dark gray לכרטיסים
    surfaceSecondary: '#2A2A2A', // אפור בינוני
    card: '#1E1E1E',           // כרטיסים
    
    // Text Colors - ברורים על רקע כהה
    text: '#FFFFFF',           // White לטקסט ראשי
    textSecondary: '#CCCCCC',  // Light gray לטקסט משני (בדיוק כמו בדרישות)
    textTertiary: '#6D6D70',   
    
    // Accent Colors בהתאם לדרישות
    workColor: '#2979FF',      // Soft blue - Work/Primary Actions
    personalColor: '#81C784',  // Soft green - Personal/Secondary Actions
    highPriority: '#FFA726',   // Warm orange - High Priority/Alerts
    alertColor: '#E57373',     // Gentle red - Alternative alert
    
    // Status Colors
    success: '#81C784',        // Soft green
    warning: '#FFA726',        // Warm orange
    error: '#E57373',          // Gentle red
    info: '#2979FF',           // Soft blue
    
    // Border & Divider
    border: '#38383A',         
    divider: '#2C2C2E',        
    
    // Pastel variations for categories/tags
    pastelTeal: '#4DB6AC',
    pastelCoral: '#F8BBD9',
    pastelYellow: '#FFF59D',
    pastelPurple: '#CE93D8',
    pastelMint: '#A5D6A7',
    pastelBlue: '#90CAF9',
    pastelPeach: '#FFCC80',
    pastelLavender: '#E1BEE7',
    
    // Special Colors
    accent: '#5856D6',         
    shadow: 'rgba(0, 0, 0, 0.3)', 
    overlay: 'rgba(0, 0, 0, 0.7)', 
    
    // Note Colors - pastel shades for notes
    noteColors: [
      '#1E1E1E',    // Default surface
      '#FFE4E1',    // Light mint
      '#E3F2FD',    // Pale blue  
      '#FFF3E0',    // Soft peach
      '#F3E5F5',    // Gentle lavender
      '#E8F5E8',    // Light green
      '#FFF8E1',    // Pale yellow
    ],
  },

  // Typography בהתאם לדרישות - "Inter" font
  fontSize: {
    xs: 10,     // לתגיות קטנות
    sm: 12,     // 12 pt כמו בדרישות
    md: 14,     // 14 pt כמו בדרישות  
    lg: 16,     // 16 pt כמו בדרישות
    xl: 18,     // 18 pt כמו בדרישות
    xxl: 20,
    xxxl: 24,
    xxxxl: 28,
    hero: 32,
  },

  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,    // Medium weight כמו בדרישות
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Spacing - consistent עם דרישות
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,      // 12 pt vertical padding כמו בדרישות
    lg: 16,      // 16 pt gap כמו בדרישות
    xl: 20,
    xxl: 24,     // 24 pt margins כמו בדרישות
    xxxl: 32,
    xxxxl: 40,
  },

  // Border Radius - ≈12px radius כמו בדרישות
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,       // 8 pt כמו בדרישות
    lg: 12,      // ≈12px radius כמו בדרישות
    xl: 18,
    xxl: 22,
    circle: 50,
  },

  // Touch targets - 44×44 pt כמו בדרישות
  touchTarget: {
    min: 44,     // Minimum 44×44 pt tappable areas
  },

  // Component sizes בהתאם לדרישות
  componentSizes: {
    // Profile icon sizes
    profileIconSmall: 32,    // ~32 × 32 pt כמו בדרישות
    profileIconMedium: 56,   // ~56 × 56 pt כמו בדרישות
    
    // FAB sizes  
    fabSize: 56,             // ≈56 × 56 pt כמו בדרישות
    
    // Card heights
    eventCardHeight: 64,     // ≈64–72 pt כמו בדרישות
    taskCardHeight: 56,      // ≈56 pt כמו בדרישות
    
    // Bar heights
    currentEventHeight: 40,  // ≈40 pt כמו בדרישות
    tabHeight: 36,          // ≈36 pt כמו בדרישות
    searchBarHeight: 40,    // ≈40 pt כמו בדרישות
    progressBarHeight: 8,   // ≈8 pt כמו בדרישות
    tabBarHeight: 60,       // ≈60 pt כמו בדרישות
    
    // Border widths
    accentStripe: 4,        // 4 px כמו בדרישות
    borderOutline: 2,       // 2 px כמו בדרישות
    
    // Checkbox size
    checkbox: 20,           // 20 px diameter כמו בדרישות
  },

  // Shadows - מתאימים ל-dark mode עם elevation
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    // Soft drop shadow for elevation כמו בדרישות
    cardShadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
  },

  // Animation timing
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // RTL Support - primary direction RTL for Hebrew
  isRTL: I18nManager.isRTL,
  
  // Helper functions for RTL כמו בדרישות
  rtl: {
    textAlign: I18nManager.isRTL ? 'right' as const : 'left' as const,
    flexDirection: I18nManager.isRTL ? 'row-reverse' as const : 'row' as const,
    alignSelf: I18nManager.isRTL ? 'flex-end' as const : 'flex-start' as const,
    
    // RTL-aware positioning
    marginLeft: (value: number) => I18nManager.isRTL ? { marginRight: value } : { marginLeft: value },
    marginRight: (value: number) => I18nManager.isRTL ? { marginLeft: value } : { marginRight: value },
    paddingLeft: (value: number) => I18nManager.isRTL ? { paddingRight: value } : { paddingLeft: value },
    paddingRight: (value: number) => I18nManager.isRTL ? { paddingLeft: value } : { paddingRight: value },
    left: (value: number) => I18nManager.isRTL ? { right: value } : { left: value },
    right: (value: number) => I18nManager.isRTL ? { left: value } : { right: value },
  },

  // Category colors mapping
  categoryColors: {
    work: '#2979FF',      // Soft blue
    personal: '#81C784',  // Soft green  
    health: '#E57373',    // Gentle red
    shopping: '#FFA726',  // Warm orange
    default: '#2979FF',
  },

  // Priority colors
  priorityColors: {
    high: '#FFA726',      // Warm orange for high priority
    medium: '#2979FF',    // Soft blue for medium
    low: '#81C784',       // Soft green for low
  },

  // Dark mode specific styles
  darkMode: {
    statusBar: 'light-content' as const,
    keyboardAppearance: 'dark' as const,
    modalBackground: 'rgba(0, 0, 0, 0.8)',
  },
};

export default theme;