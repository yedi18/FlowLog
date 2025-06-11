// src/types/index.ts - Updated Types to Match Existing Files
import { NavigatorScreenParams } from '@react-navigation/native';

// ===============================
// Navigation Types
// ===============================

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
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

// ===============================
// User Types
// ===============================

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
  notifications: NotificationSettings;
  calendar: CalendarSettings;
  tasks: TaskSettings;
  notes: NoteSettings;
}

// ===============================
// Auth State
// ===============================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ===============================
// Task Types (Updated to match existing)
// ===============================

export type Priority = 1 | 2 | 3 | 4;

export interface SubTask {
  id?: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: Priority; // Changed to match Todoist (1-4, optional)
  dueDate?: string; // ISO string
  dueTime?: string; // HH:MM format
  reminderTime?: string; // HH:MM format
  projectId?: string;
  labels?: string[];
  subtasks?: SubTask[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  attachments?: Attachment[];
  recurrence?: TaskRecurrence;
  tags?: string[]; // For backward compatibility
  notificationId?: string;
  assigneeId?: string; // Added for collaboration
  assignedBy?: string;
  assignedAt?: string;
  parentId?: string; // For subtasks
  sortOrder?: number;
  source?: 'manual' | 'email' | 'integration' | 'template';
  location?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: Date;
  tags?: string[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link' | 'file';
  size?: number; // in bytes
  mimeType?: string;
  createdAt: string;
}

export interface TaskRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  endAfterOccurrences?: number;
  skipWeekends?: boolean;
  skipHolidays?: boolean;
}

// ===============================
// Project Types
// ===============================

export interface Project {
  id: string;
  userId?: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  isArchived?: boolean;
  isFavorite?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTaskCount?: number;
  parentProjectId?: string;
}

// ===============================
// Label Types
// ===============================

export interface Label {
  id: string;
  userId?: string;
  name: string;
  color: string;
  description?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

// ===============================
// Notes Types (Updated to match existing)
// ===============================

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  userId: string;
  isPinned: boolean;
  // Additional fields for compatibility
  color?: string;
  favorite?: boolean;
  archived?: boolean;
  wordCount?: number;
  readTime?: number;
  category?: string;
  attachments?: Attachment[];
  projectId?: string;
  taskIds?: string[];
}

export interface CreateNoteDTO {
  title: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface AIInsight {
  id: string;
  type: 'summary' | 'suggestion' | 'analysis';
  content: string;
  createdAt: Date;
  parentId: string;
  parentType: 'task' | 'event' | 'note';
}

// ===============================
// Events Types (Updated to match existing)
// ===============================

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  attendees: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  calendarId?: string; // For Google Calendar sync
  // Additional fields for compatibility
  color?: string;
  reminderTime?: string;
  recurrence?: EventRecurrence;
  taskId?: string;
  projectId?: string;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
}

export interface EventRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  endAfterOccurrences?: number;
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

// ===============================
// Priority & Color Constants
// ===============================

export const PRIORITY_COLORS: Record<Priority, string> = {
  1: '#DC4C3E', // Priority 1 - Red (Highest)
  2: '#FF8C00', // Priority 2 - Orange
  3: '#2563EB', // Priority 3 - Blue
  4: '#8B8B8B', // Priority 4 - Gray (Default)
};

export const PRIORITY_NAMES: Record<Priority, string> = {
  1: 'Priority 1',
  2: 'Priority 2',
  3: 'Priority 3',
  4: 'Priority 4',
};

export const DEFAULT_COLORS: string[] = [
  '#DC4C3E', '#FF8C00', '#D97706', '#059669', '#2563EB',
  '#7C3AED', '#EC4899', '#8B5A3C', '#6B7280', '#1F2937',
  '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316',
  '#06B6D4', '#84CC16', '#F43F5E', '#6366F1', '#14B8A6',
];

// ===============================
// Task Filter & Tab Types
// ===============================

export type TaskTab = 'today' | 'upcoming' | 'inbox' | 'completed' | 'all';
export type TaskSortType = 'dueDate' | 'priority' | 'created' | 'alphabetical' | 'manual';
export type TaskViewType = 'list' | 'board' | 'calendar';

export interface TabData {
  key: TaskTab;
  title: string;
  count: number;
  icon?: string;
}

export interface TaskFilters {
  projects: string[];
  labels: string[];
  priorities: Priority[];
  dueDateRange: {
    start?: string;
    end?: string;
  };
  hasRecurrence?: boolean;
  isOverdue?: boolean;
  hasSubtasks?: boolean;
  hasAttachments?: boolean;
  estimatedTimeRange?: {
    min?: number;
    max?: number;
  };
}

// ===============================
// State Management
// ===============================

export interface LoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

export interface TasksState extends LoadingState {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  activeTab: TaskTab;
  searchQuery: string;
  sortBy: TaskSortType;
  viewMode: TaskViewType;
  selectedProjectId?: string;
  selectedLabelIds: string[];
  filters: TaskFilters;
  selectedTaskIds: string[];
  showBulkActions: boolean;
}

export interface EventsState extends LoadingState {
  events: Event[];
  selectedDate: string;
  viewMode: 'day' | 'week' | 'month' | 'agenda';
}

export interface NotesState extends LoadingState {
  notes: Note[];
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'created' | 'updated' | 'title' | 'wordCount';
  viewMode: 'list' | 'grid' | 'compact';
  showArchived: boolean;
}

// ===============================
// Form Data Types
// ===============================

export interface NewTaskFormData {
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string;
  dueTime?: string;
  projectId?: string;
  labels: string[];
  recurrence?: TaskRecurrence;
  reminderTime?: string;
  estimatedTime?: number;
  subtasks: string[];
}

export interface NewProjectFormData {
  name: string;
  description: string;
  color: string;
  icon?: string;
  parentProjectId?: string;
}

export interface NewLabelFormData {
  name: string;
  color: string;
  description: string;
}

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

// ===============================
// Settings Types
// ===============================

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  deadlineAlerts: boolean;
  eventReminders: boolean;
  projectUpdates: boolean;
  weeklyReports: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  reminderOffsets: number[];
}

export interface CalendarSettings {
  startOfWeek: 0 | 1;
  timeFormat: '12h' | '24h';
  defaultEventDuration: number;
  showWeekNumbers: boolean;
  defaultReminder: number;
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  weekends: number[];
}

export interface TaskSettings {
  defaultPriority: Priority;
  autoCompleteSubtasks: boolean;
  showCompletedTasks: boolean;
  deleteCompletedAfterDays: number;
  defaultReminder: number;
  defaultEstimatedTime: number;
  enableTimeTracking: boolean;
  smartScheduling: boolean;
  defaultProjectId?: string;
}

export interface NoteSettings {
  defaultSortBy: 'created' | 'updated' | 'title';
  showPreview: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  enableMarkdown: boolean;
  defaultColor: string;
  wordWrapEnabled: boolean;
  showWordCount: boolean;
}

export interface AppSettings {
  language: 'en' | 'he';
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  calendar: CalendarSettings;
  tasks: TaskSettings;
  notes: NoteSettings;
  privacy: {
    analyticsEnabled: boolean;
    crashReportsEnabled: boolean;
  };
  sync: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number;
  };
}

// ===============================
// Statistics Types
// ===============================

export interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityTrend: 'up' | 'down' | 'stable';
  byPriority: Record<Priority, number>;
  byProject: Record<string, number>;
  byLabel: Record<string, number>;
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export interface ProductivityStats {
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  averageTasksPerDay: number;
  longestStreak: number;
  currentStreak: number;
  focusTime: number;
  procrastinationScore: number;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalProjects: number;
  totalLabels: number;
  totalNotes: number;
  totalEvents: number;
  productivity: ProductivityStats;
  streaks: {
    current: number;
    longest: number;
    lastUpdated: string;
  };
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

// ===============================
// API Types
// ===============================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface SearchResults {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  notes: Note[];
  events: Event[];
  totalCount: number;
}

// ===============================
// Error Types
// ===============================

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
  action?: string;
}

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'QUOTA_EXCEEDED'
  | 'UNKNOWN_ERROR';

// ===============================
// Theme Types
// ===============================

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  modal: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  textPlaceholder: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  border: string;
  divider: string;
  selected: string;
  hover: string;
  focus: string;
}

// ===============================
// Combined App State
// ===============================

export interface RootState {
  auth: AuthState;
  tasks: TasksState;
  events: EventsState;
  notes: NotesState;
  settings: AppSettings;
  ui: UIState;
}

export interface UIState {
  isLoading: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'he';
  orientation: 'portrait' | 'landscape';
  internetConnection: boolean;
  activeModal?: string;
  toast?: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  };
}

// ===============================
// Utility Types
// ===============================

export type ViewMode = 'list' | 'grid' | 'calendar' | 'compact' | 'detailed';
export type SortDirection = 'asc' | 'desc';

export type WithOptionalId<T> = Omit<T, 'id'> & { id?: string };
export type CreateData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
export type UpdateData<T> = Partial<Omit<T, 'id' | 'createdAt' | 'userId'>>
  & Partial<User>
  & { settings?: Record<string, any> };

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  timestamp: string;
}