// src/utils/constants.ts
// קבועים עבור האפליקציה

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  EVENTS: 'events',
  NOTES: 'notes',
  PROJECTS: 'projects',
  LABELS: 'labels',
} as const;

// AsyncStorage Keys
export const STORAGE_KEYS = {
  USER_LANGUAGE: 'user-language',
  LOGIN_CREDENTIALS: 'loginCredentials',
  USER_SETTINGS: 'userSettings',
  THEME_MODE: 'themeMode',
  FIRST_TIME_USER: 'firstTimeUser',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'FlowLog',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'he'],
  PAGINATION_LIMIT: 20,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  BASE_URL: process.env.REACT_NATIVE_API_URL || 'https://api.flowlog.app',
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  TASK_TITLE_MAX_LENGTH: 200,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  NOTE_TITLE_MAX_LENGTH: 200,
  NOTE_CONTENT_MAX_LENGTH: 10000,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_TIME: 'HH:mm',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
} as const;

// Default Values
export const DEFAULTS = {
  TASK_PRIORITY: 'medium' as const,
  EVENT_DURATION: 60, // minutes
  NOTE_COLOR: '#FFFFFF',
  REMINDER_TIME: 15, // minutes before
  PAGINATION_SIZE: 20,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please check your access rights.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  EVENT_CREATED: 'Event created successfully',
  EVENT_UPDATED: 'Event updated successfully',
  EVENT_DELETED: 'Event deleted successfully',
  NOTE_CREATED: 'Note created successfully',
  NOTE_UPDATED: 'Note updated successfully',
  NOTE_DELETED: 'Note deleted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// Priority Colors
export const PRIORITY_COLORS = {
  low: '#10B981',     // Green
  medium: '#F59E0B',  // Yellow/Orange
  high: '#EF4444',    // Red
  urgent: '#DC2626',  // Dark Red
} as const;

// Status Colors
export const STATUS_COLORS = {
  completed: '#10B981',   // Green
  pending: '#F59E0B',     // Yellow
  overdue: '#EF4444',     // Red
  cancelled: '#6B7280',   // Gray
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
} as const;

// Screen Breakpoints
export const BREAKPOINTS = {
  SMALL: 480,
  MEDIUM: 768,
  LARGE: 1024,
  EXTRA_LARGE: 1280,
} as const;

// Feature Flags
export const FEATURES = {
  GOOGLE_CALENDAR_SYNC: false,
  SOCIAL_LOGIN: true,
  DARK_MODE: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: false,
  ANALYTICS: true,
} as const;

// Social Login Providers
export const SOCIAL_PROVIDERS = {
  GOOGLE: 'google',
  APPLE: 'apple',
  FACEBOOK: 'facebook',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  TASK_REMINDER: 'task_reminder',
  EVENT_REMINDER: 'event_reminder',
  DAILY_SUMMARY: 'daily_summary',
  WEEKLY_REPORT: 'weekly_report',
} as const;

// File Types
export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  SPREADSHEETS: ['xls', 'xlsx', 'csv'],
} as const;

// Export specific constants for easy access
export { COLLECTIONS as default };