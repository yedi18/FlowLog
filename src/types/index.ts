// src/types/index.ts
// הגדרות טיפוסים מתוקנות ומלאות

import { NavigatorScreenParams } from '@react-navigation/native';

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Goals: undefined;
  Calendar: undefined;
  Notes: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword?: undefined;
};

// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: 'en' | 'he';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    taskReminders: boolean;
    deadlineAlerts: boolean;
  };
  calendar: {
    startOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
    timeFormat: '12h' | '24h';
  };
}

// Auth State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Task Types
export interface Task {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  dueTime?: string;
  reminderTime?: string;
  projectId?: string;
  labels?: string[];
  tags?: string[];
  subtasks?: SubTask[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  attachments?: Attachment[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link';
  size?: number;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

// Tasks State
export interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

// Event Types
export interface Event {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
  color?: string;
  reminderTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color: string;
  allDay?: boolean;
  location?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Events State
export interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

// Note Types
export interface Note {
  id: string;
  userId?: string;
  title: string;
  content: string;
  tags?: string[];
  color?: string;
  pinned?: boolean;
  favorite?: boolean;
  createdAt: string;
  updatedAt: string;
  wordCount?: number;
  readTime?: number;
  category?: string;
  attachments?: Attachment[];
}

// Notes State
export interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

// App State (Combined)
export interface RootState {
  auth: AuthState;
  tasks: TasksState;
  events: EventsState;
  notes: NotesState;
}

// Settings Types
export interface AppSettings {
  language: 'en' | 'he';
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  calendar: CalendarSettings;
  tasks: TaskSettings;
  notes: NoteSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  deadlineAlerts: boolean;
  eventReminders: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface CalendarSettings {
  startOfWeek: 0 | 1;
  timeFormat: '12h' | '24h';
  defaultEventDuration: number;
  showWeekNumbers: boolean;
  defaultReminder: number;
}

export interface TaskSettings {
  defaultPriority: 'low' | 'medium' | 'high';
  autoCompleteSubtasks: boolean;
  showCompletedTasks: boolean;
  deleteCompletedAfterDays: number;
  defaultReminder: number;
}

export interface NoteSettings {
  defaultSortBy: 'created' | 'updated' | 'title';
  showPreview: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  enableMarkdown: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  acceptTerms: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  subtasks: string[];
}

export interface NoteFormData {
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  category?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  color: string;
  reminders: number[];
}

// Filter Types
export type TaskFilter = 'today' | 'upcoming' | 'all' | 'completed' | 'inbox';
export type EventFilter = 'today' | 'week' | 'month' | 'upcoming';
export type NoteFilter = 'recent' | 'created' | 'alphabetical' | 'pinned' | 'favorites';

// Priority Types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// View Mode Types
export type ViewMode = 'list' | 'grid' | 'calendar';

// Statistics Types
export interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalNotes: number;
  totalEvents: number;
  productivity: {
    tasksThisWeek: number;
    tasksLastWeek: number;
    completionRate: number;
    averageTasksPerDay: number;
  };
  streaks: {
    current: number;
    longest: number;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}