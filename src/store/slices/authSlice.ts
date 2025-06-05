// src/store/slices/authSlice.ts
// Redux Slice לניהול מצב האימות - מתוקן

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Import services
import { 
  registerUser as registerUserService,
  loginUser as loginUserService,
  logoutUser as logoutUserService,
  getCurrentUser
} from '../../services/authService';

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async Thunks - פעולות אסינכרוניות

/**
 * הרשמת משתמש חדש
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName }: { email: string; password: string; displayName?: string }) => {
    const user = await registerUserService(email, password, displayName);
    return user;
  }
);

/**
 * התחברות משתמש
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const user = await loginUserService(email, password);
    return user;
  }
);

/**
 * התנתקות משתמש
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await logoutUserService();
  }
);

/**
 * בדיקת מצב האימות הנוכחי
 */
export const checkAuthState = createAsyncThunk(
  'auth/checkState',
  async () => {
    const user = await getCurrentUser();
    return user;
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // פעולות סינכרוניות
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
        state.isAuthenticated = false;
        state.user = null;
      });

    // Login User
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout User
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Logout failed';
      });

    // Check Auth State
    builder
      .addCase(checkAuthState.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to check auth state';
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

// Actions
export const { clearError, setUser, clearUser, setLoading } = authSlice.actions;

// Selectors - פונקציות לבחירת נתונים מה-state
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;