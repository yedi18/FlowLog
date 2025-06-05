// src/services/authService.ts
// שירותי אימות Firebase - גרסה פשוטה ועובדת

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';
import { COLLECTIONS } from '../utils/constants';

/**
 * יצירת משתמש חדש
 */
export const registerUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    // יצירת המשתמש ב-Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // עדכון פרופיל אם יש שם
    if (displayName) {
      await updateProfile(firebaseUser, { displayName });
    }

    // יצירת אובייקט המשתמש שלנו
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName || firebaseUser.displayName || undefined,
      createdAt: new Date().toISOString(),
    };

    // שמירת נתוני המשתמש ב-Firestore
    await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userData);

    return userData;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register user');
  }
};

/**
 * התחברות משתמש קיים
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // טעינת נתוני המשתמש מ-Firestore
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      // אם אין נתונים ב-Firestore, ניצור אותם
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userData);
      return userData;
    }
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to login');
  }
};

/**
 * התנתקות משתמש
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'Failed to logout');
  }
};

/**
 * קבלת המשתמש הנוכחי
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
    return userDoc.exists() ? (userDoc.data() as User) : null;
  } catch (error: any) {
    console.error('Get current user error:', error);
    return null;
  }
};