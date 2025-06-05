// src/hooks/useAuth.ts
// Hook לניהול אימות אוטומטי וזכירת משתמש - תיקון שגיאות

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { setUser, clearError, selectUser, selectAuthLoading } from '../store/slices/authSlice';
import { AppDispatch } from '../store';

interface SavedCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('useAuth: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      console.log('useAuth: Auth state changed:', !!firebaseUser);
      
      try {
        if (firebaseUser) {
          // המשתמש מחובר
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
          };
          
          dispatch(setUser(userData));
          setIsAuthenticated(true);
          setError(null);
          
          console.log('useAuth: User authenticated:', userData.email);
        } else {
          // המשתמש לא מחובר - נסה כניסה אוטומטית
          console.log('useAuth: No user, checking for saved credentials');
          
          const autoLoginSuccess = await attemptAutoLogin();
          if (!autoLoginSuccess) {
            dispatch(setUser(null));
            setIsAuthenticated(false);
            console.log('useAuth: Auto login failed, user not authenticated');
          }
        }
      } catch (error: any) {
        console.error('useAuth: Error in auth state change:', error);
        setError(error.message);
        dispatch(setUser(null));
        setIsAuthenticated(false);
      }
    });

    return unsubscribe;
  }, [dispatch]);

  // ניסיון כניסה אוטומטית
  const attemptAutoLogin = async (): Promise<boolean> => {
    try {
      console.log('useAuth: Attempting auto login');
      
      const savedData = await AsyncStorage.getItem('loginCredentials');
      if (!savedData) {
        console.log('useAuth: No saved credentials found');
        return false;
      }

      const credentials: SavedCredentials = JSON.parse(savedData);
      if (!credentials.rememberMe || !credentials.email || !credentials.password) {
        console.log('useAuth: Invalid saved credentials');
        return false;
      }

      console.log('useAuth: Found saved credentials, attempting login for:', credentials.email);
      
      // ייבוא הפונקציה כאן כדי למנוע circular dependency
      const { signInWithEmailAndPassword } = require('firebase/auth');
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );

      if (userCredential.user) {
        console.log('useAuth: Auto login successful');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.log('useAuth: Auto login failed:', error.message);
      
      // אם יש שגיאה, מחק נתונים שמורים לא תקינים
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-email') {
        await AsyncStorage.removeItem('loginCredentials');
        console.log('useAuth: Removed invalid saved credentials');
      }
      
      return false;
    }
  };

  // התנתקות עם מחיקת נתונים שמורים
  const logout = async () => {
    try {
      console.log('useAuth: Logging out');
      
      await auth.signOut();
      
      // שאל את המשתמש אם הוא רוצה למחוק נתונים שמורים
      const savedData = await AsyncStorage.getItem('loginCredentials');
      if (savedData) {
        // במקרה זה נשאיר את הנתונים, המשתמש יכול לבחור בפעם הבאה
        // אפשר להוסיף dialog לשאול את המשתמש
      }
      
      dispatch(setUser(null));
      setIsAuthenticated(false);
      setError(null);
      
      console.log('useAuth: Logout successful');
    } catch (error: any) {
      console.error('useAuth: Logout error:', error);
      setError(error.message);
    }
  };

  // מחיקת נתונים שמורים
  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem('loginCredentials');
      console.log('useAuth: Cleared saved credentials');
    } catch (error) {
      console.log('useAuth: Error clearing saved credentials:', error);
    }
  };

  // בדיקה אם יש נתונים שמורים
  const hasSavedCredentials = async (): Promise<boolean> => {
    try {
      const savedData = await AsyncStorage.getItem('loginCredentials');
      if (savedData) {
        const credentials: SavedCredentials = JSON.parse(savedData);
        return credentials.rememberMe && !!credentials.email && !!credentials.password;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
    clearSavedCredentials,
    hasSavedCredentials,
    attemptAutoLogin,
  };
};