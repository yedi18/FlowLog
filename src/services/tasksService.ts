// src/services/tasksService.ts
// שירותי משימות Firebase

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Task } from '../types';
import { COLLECTIONS } from '../utils/constants';

/**
 * יצירת משימה חדשה
 */
export const createTask = async (userId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Task> => {
  try {
    const now = new Date().toISOString();
    const newTask = {
      ...taskData,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), newTask);
    
    return {
      id: docRef.id,
      ...newTask,
    };
  } catch (error: any) {
    console.error('Create task error:', error);
    throw new Error(error.message || 'Failed to create task');
  }
};

/**
 * עדכון משימה
 */
export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    throw new Error(error.message || 'Failed to update task');
  }
};

/**
 * מחיקת משימה
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TASKS, taskId));
  } catch (error: any) {
    console.error('Delete task error:', error);
    throw new Error(error.message || 'Failed to delete task');
  }
};

/**
 * קבלת כל המשימות של משתמש
 */
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      } as Task);
    });
    
    return tasks;
  } catch (error: any) {
    console.error('Get user tasks error:', error);
    throw new Error(error.message || 'Failed to fetch tasks');
  }
};

/**
 * קבלת משימות להיום
 */
export const getTodayTasks = async (userId: string): Promise<Task[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('userId', '==', userId),
      where('dueDate', '>=', today.toISOString()),
      where('dueDate', '<', tomorrow.toISOString()),
      orderBy('dueDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      } as Task);
    });
    
    return tasks;
  } catch (error: any) {
    console.error('Get today tasks error:', error);
    // אם יש בעיה עם השאילתה, ננסה בלי תאריכים
    return getUserTasks(userId);
  }
};

/**
 * סימון משימה כהושלמה/לא הושלמה
 */
export const toggleTaskCompletion = async (taskId: string, completed: boolean): Promise<void> => {
  try {
    await updateTask(taskId, { completed });
  } catch (error: any) {
    console.error('Toggle task completion error:', error);
    throw new Error(error.message || 'Failed to update task status');
  }
};

/**
 * האזנה בזמן אמת לשינויים במשימות
 */
export const onTasksChange = (userId: string, callback: (tasks: Task[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.TASKS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      } as Task);
    });
    callback(tasks);
  }, (error) => {
    console.error('Tasks listener error:', error);
  });
};