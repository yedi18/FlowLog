// src/store/slices/tasksSlice.ts
// Redux Slice לניהול משימות

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TasksState, Task } from '../../types';
import { 
  createTask as createTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  getUserTasks,
  getTodayTasks,
  toggleTaskCompletion as toggleTaskCompletionService
} from '../../services/tasksService';

// Initial State
const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
};

// Async Thunks

/**
 * טעינת כל המשימות של המשתמש
 */
export const loadUserTasks = createAsyncThunk(
  'tasks/loadUserTasks',
  async (userId: string) => {
    const tasks = await getUserTasks(userId);
    return tasks;
  }
);

/**
 * טעינת משימות היום
 */
export const loadTodayTasks = createAsyncThunk(
  'tasks/loadTodayTasks',
  async (userId: string) => {
    const tasks = await getTodayTasks(userId);
    return tasks;
  }
);

/**
 * יצירת משימה חדשה
 */
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ userId, taskData }: { userId: string; taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'> }) => {
    const task = await createTaskService(userId, taskData);
    return task;
  }
);

/**
 * עדכון משימה
 */
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updates }: { taskId: string; updates: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>> }) => {
    await updateTaskService(taskId, updates);
    return { taskId, updates };
  }
);

/**
 * מחיקת משימה
 */
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    await deleteTaskService(taskId);
    return taskId;
  }
);

/**
 * סימון משימה כהושלמה/לא הושלמה
 */
export const toggleTaskCompletion = createAsyncThunk(
  'tasks/toggleCompletion',
  async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
    await toggleTaskCompletionService(taskId, completed);
    return { taskId, completed };
  }
);

// Tasks Slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // פעולות סינכרוניות
    clearError: (state) => {
      state.error = null;
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload); // הוספה לתחילת הרשימה
    },
    updateTaskLocal: (state, action: PayloadAction<{ taskId: string; updates: Partial<Task> }>) => {
      const { taskId, updates } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    // Load User Tasks
    builder
      .addCase(loadUserTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(loadUserTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load tasks';
      });

    // Load Today Tasks
    builder
      .addCase(loadTodayTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTodayTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(loadTodayTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load today tasks';
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload); // הוספה לתחילת הרשימה
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create task';
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { taskId, updates } = action.payload;
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update task';
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete task';
      });

    // Toggle Task Completion
    builder
      .addCase(toggleTaskCompletion.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const { taskId, completed } = action.payload;
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].completed = completed;
          state.tasks[taskIndex].updatedAt = new Date().toISOString();
        }
        state.error = null;
      })
      .addCase(toggleTaskCompletion.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle task completion';
      });
  },
});

// Actions
export const { 
  clearError, 
  setTasks, 
  addTask, 
  updateTaskLocal, 
  removeTask, 
  clearTasks 
} = tasksSlice.actions;

// Selectors
export const selectTasks = (state: { tasks: TasksState }) => state.tasks.tasks;
export const selectTasksLoading = (state: { tasks: TasksState }) => state.tasks.isLoading;
export const selectTasksError = (state: { tasks: TasksState }) => state.tasks.error;

// מותאמים אישית
export const selectCompletedTasks = (state: { tasks: TasksState }) => 
  state.tasks.tasks.filter(task => task.completed);

export const selectPendingTasks = (state: { tasks: TasksState }) => 
  state.tasks.tasks.filter(task => !task.completed);

export const selectTasksByPriority = (state: { tasks: TasksState }, priority: 'low' | 'medium' | 'high') =>
  state.tasks.tasks.filter(task => task.priority === priority);

export const selectTasksCount = (state: { tasks: TasksState }) => ({
  total: state.tasks.tasks.length,
  completed: state.tasks.tasks.filter(task => task.completed).length,
  pending: state.tasks.tasks.filter(task => !task.completed).length,
});

export default tasksSlice.reducer;