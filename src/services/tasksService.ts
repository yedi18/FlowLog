// src/services/tasksService.ts - מתוקן עם ניקוי נתונים מלא
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
  writeBatch,
  getDoc,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, Project, Label } from '../types';

// Import helper functions
const cleanDataForFirestore = (data: any): any => {
  if (data === null || data === undefined) {
    return null;
  }

  if (Array.isArray(data)) {
    return data
      .filter(item => item !== null && item !== undefined)
      .map(item => cleanDataForFirestore(item));
  }

  if (typeof data === 'object' && data !== null) {
    const cleanedData: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (value !== undefined) {
        if (value === null) {
          cleanedData[key] = null;
        } else if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue !== '') {
            cleanedData[key] = trimmedValue;
          }
        } else if (Array.isArray(value)) {
          const cleanedArray = cleanDataForFirestore(value);
          if (cleanedArray.length > 0) {
            cleanedData[key] = cleanedArray;
          }
        } else if (typeof value === 'object') {
          const cleanedObject = cleanDataForFirestore(value);
          if (Object.keys(cleanedObject).length > 0) {
            cleanedData[key] = cleanedObject;
          }
        } else {
          cleanedData[key] = value;
        }
      }
    });
    
    return cleanedData;
  }

  return data;
};

// ====================== CONSTANTS ======================
const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  LABELS: 'labels',
};

// ====================== HELPER FUNCTIONS ======================
const handleFirebaseError = (error: any, operation: string) => {
  console.error(`❌ ${operation} error:`, error);
  
  // Handle specific Firebase errors
  if (error.code === 'permission-denied') {
    throw new Error('Access denied. Please check your permissions.');
  } else if (error.code === 'unavailable') {
    throw new Error('Service temporarily unavailable. Please try again.');
  } else if (error.code === 'not-found') {
    throw new Error('Document not found.');
  } else if (error.code === 'already-exists') {
    throw new Error('Document already exists.');
  }
  
  throw new Error(error.message || `Failed to ${operation.toLowerCase()}`);
};

const validateUserId = (userId: string) => {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('Valid user ID is required');
  }
};

// ====================== TASKS ======================

/**
 * יצירת משימה חדשה
 */
export const createTask = async (userId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Task> => {
  try {
    validateUserId(userId);
    
    if (!taskData.title || taskData.title.trim() === '') {
      throw new Error('Task title is required');
    }

    const now = new Date();
    
    // Build clean task data without spread to avoid conflicts
    const cleanTaskData: any = {
      userId: userId.trim(),
      title: taskData.title.trim(),
      completed: false,
      priority: taskData.priority || 3,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Add optional fields only if they exist and have valid values
    if (taskData.description && taskData.description.trim()) {
      cleanTaskData.description = taskData.description.trim();
    }

    if (taskData.projectId && taskData.projectId.trim()) {
      cleanTaskData.projectId = taskData.projectId.trim();
    }

    if (taskData.labels && Array.isArray(taskData.labels) && taskData.labels.length > 0) {
      cleanTaskData.labels = taskData.labels.filter(id => id && typeof id === 'string' && id.trim());
    }

    if (taskData.dueDate) {
      cleanTaskData.dueDate = taskData.dueDate;
    }

    if (taskData.dueTime && taskData.dueTime.trim()) {
      cleanTaskData.dueTime = taskData.dueTime.trim();
    }

    if (taskData.reminderTime && taskData.reminderTime.trim()) {
      cleanTaskData.reminderTime = taskData.reminderTime.trim();
    }

    if (taskData.recurrence && typeof taskData.recurrence === 'object') {
      cleanTaskData.recurrence = taskData.recurrence;
    }

    if (taskData.notificationId && taskData.notificationId.trim()) {
      cleanTaskData.notificationId = taskData.notificationId.trim();
    }

    if (taskData.estimatedTime && taskData.estimatedTime > 0) {
      cleanTaskData.estimatedTime = taskData.estimatedTime;
    }

    if (taskData.subtasks && Array.isArray(taskData.subtasks) && taskData.subtasks.length > 0) {
      cleanTaskData.subtasks = taskData.subtasks;
    }

    console.log('🔥 Creating task:', cleanTaskData.title);
    const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), cleanTaskData);
    
    const createdTask = {
      id: docRef.id,
      ...cleanTaskData,
    };

    console.log('✅ Task created successfully:', createdTask.id);
    return createdTask;
  } catch (error: any) {
    handleFirebaseError(error, 'Create task');
    throw error;
  }
};

/**
 * עדכון משימה
 */
export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  try {
    if (!taskId || taskId.trim() === '') {
      throw new Error('Task ID is required');
    }

    console.log('🔥 Updating task:', taskId);
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    
    // Build clean updates object
    const cleanUpdates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Add only valid fields to the update
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      
      if (value !== undefined) {
        if (value === null) {
          // Explicitly setting to null (for clearing fields)
          cleanUpdates[key] = null;
        } else if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue !== '') {
            cleanUpdates[key] = trimmedValue;
          }
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            cleanUpdates[key] = value.filter(item => item !== undefined && item !== null);
          } else {
            cleanUpdates[key] = []; // Empty array for clearing
          }
        } else if (typeof value === 'object' && value !== null) {
          cleanUpdates[key] = value;
        } else {
          cleanUpdates[key] = value;
        }
      }
    });

    await updateDoc(taskRef, cleanUpdates);
    console.log('✅ Task updated successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Update task');
  }
};

/**
 * מחיקת משימה
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    if (!taskId || taskId.trim() === '') {
      throw new Error('Task ID is required');
    }

    console.log('🔥 Deleting task:', taskId);
    await deleteDoc(doc(db, COLLECTIONS.TASKS, taskId));
    console.log('✅ Task deleted successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Delete task');
  }
};

/**
 * קבלת כל המשימות של משתמש
 */
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  try {
    validateUserId(userId);
    
    console.log('🔥 Fetching tasks for user:', userId);
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('userId', '==', userId.trim())
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
      } as Task);
    });
    
    // Sort locally by creation date (newest first)
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('✅ Tasks fetched successfully:', tasks.length);
    return tasks;
  } catch (error: any) {
    handleFirebaseError(error, 'Get user tasks');
    return []; // Fallback to empty array
  }
};

/**
 * סימון משימה כהושלמה/לא הושלמה
 */
export const toggleTaskCompletion = async (taskId: string, completed: boolean): Promise<void> => {
  try {
    if (!taskId || taskId.trim() === '') {
      throw new Error('Task ID is required');
    }

    console.log('🔥 Toggling task completion:', taskId, completed);
    const updates: any = { 
      completed,
      updatedAt: new Date().toISOString()
    };
    
    if (completed) {
      updates.completedAt = new Date().toISOString();
    } else {
      updates.completedAt = null;
    }
    
    await updateTask(taskId, updates);
    console.log('✅ Task completion toggled successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Toggle task completion');
  }
};

/**
 * האזנה בזמן אמת לשינויים במשימות
 */
export const onTasksChange = (userId: string, callback: (tasks: Task[]) => void) => {
  try {
    validateUserId(userId);
    
    console.log('🔥 Setting up tasks listener for user:', userId);
    
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('userId', '==', userId.trim())
    );
    
    return onSnapshot(q, (querySnapshot) => {
      try {
        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({
            id: doc.id,
            ...data,
          } as Task);
        });
        
        // Sort locally by creation date (newest first)
        tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('📱 Tasks updated via listener:', tasks.length);
        callback(tasks);
      } catch (error) {
        console.error('❌ Error processing tasks snapshot:', error);
        callback([]); // Return empty array on error
      }
    }, (error) => {
      console.error('❌ Tasks listener error:', error);
      callback([]); // Return empty array on error
    });
  } catch (error) {
    console.error('❌ Error setting up tasks listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// ====================== PROJECTS ======================

/**
 * יצירת פרויקט חדש
 */
export const createProject = async (userId: string, projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Project> => {
  try {
    validateUserId(userId);
    
    if (!projectData.name || projectData.name.trim() === '') {
      throw new Error('Project name is required');
    }

    console.log('🔥 Creating project:', projectData.name);
    const now = new Date();
    
    const cleanProjectData: any = {
      userId: userId.trim(),
      name: projectData.name.trim(),
      color: projectData.color || '#2979FF',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isArchived: false,
      sortOrder: projectData.sortOrder || 0,
    };

    // Add optional fields
    if (projectData.description && projectData.description.trim()) {
      cleanProjectData.description = projectData.description.trim();
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), cleanProjectData);
    
    const createdProject = {
      id: docRef.id,
      ...cleanProjectData,
    };

    console.log('✅ Project created successfully:', createdProject.id);
    return createdProject;
  } catch (error: any) {
    handleFirebaseError(error, 'Create project');
    throw error;
  }
};

/**
 * עדכון פרויקט
 */
export const updateProject = async (projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  try {
    if (!projectId || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    console.log('🔥 Updating project:', projectId);
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    
    // Build clean updates object
    const cleanUpdates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Add only valid fields to the update
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      
      if (value !== undefined) {
        if (value === null) {
          cleanUpdates[key] = null;
        } else if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue !== '') {
            cleanUpdates[key] = trimmedValue;
          }
        } else {
          cleanUpdates[key] = value;
        }
      }
    });

    await updateDoc(projectRef, cleanUpdates);
    console.log('✅ Project updated successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Update project');
  }
};

/**
 * מחיקת פרויקט וניתוק המשימות שלו
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    if (!projectId || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    console.log('🔥 Deleting project:', projectId);
    const batch = writeBatch(db);
    
    // מחיקת הפרויקט
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    batch.delete(projectRef);
    
    // עדכון כל המשימות של הפרויקט (הסרת projectId)
    const tasksQuery = query(
      collection(db, COLLECTIONS.TASKS),
      where('projectId', '==', projectId)
    );
    
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.forEach((taskDoc) => {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskDoc.id);
      batch.update(taskRef, {
        projectId: null,
        updatedAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
    console.log('✅ Project deleted successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Delete project');
  }
};

/**
 * קבלת כל הפרויקטים של משתמש
 */
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    validateUserId(userId);
    
    console.log('🔥 Fetching projects for user:', userId);
    const q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where('userId', '==', userId.trim()),
      where('isArchived', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        ...data,
      } as Project);
    });
    
    // Sort locally by sortOrder, then by name
    projects.sort((a, b) => {
      const orderA = a.sortOrder ?? 0;
      const orderB = b.sortOrder ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    });
    
    console.log('✅ Projects fetched successfully:', projects.length);
    return projects;
  } catch (error: any) {
    handleFirebaseError(error, 'Get user projects');
    return []; // Fallback to empty array
  }
};

/**
 * האזנה בזמן אמת לשינויים בפרויקטים
 */
export const onProjectsChange = (userId: string, callback: (projects: Project[]) => void) => {
  try {
    validateUserId(userId);
    
    console.log('🔥 Setting up projects listener for user:', userId);
    
    const q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where('userId', '==', userId.trim()),
      where('isArchived', '==', false)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      try {
        const projects: Project[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          projects.push({
            id: doc.id,
            ...data,
          } as Project);
        });
        
        // Sort locally by sortOrder, then by name
        projects.sort((a, b) => {
          const orderA = a.sortOrder ?? 0;
          const orderB = b.sortOrder ?? 0;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return a.name.localeCompare(b.name);
        });
        
        console.log('📱 Projects updated via listener:', projects.length);
        callback(projects);
      } catch (error) {
        console.error('❌ Error processing projects snapshot:', error);
        callback([]);
      }
    }, (error) => {
      console.error('❌ Projects listener error:', error);
      callback([]);
    });
  } catch (error) {
    console.error('❌ Error setting up projects listener:', error);
    return () => {};
  }
};

// ====================== LABELS ======================

/**
 * יצירת תווית חדשה
 */
export const createLabel = async (userId: string, labelData: Omit<Label, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Label> => {
  try {
    validateUserId(userId);
    
    if (!labelData.name || labelData.name.trim() === '') {
      throw new Error('Label name is required');
    }

    console.log('🔥 Creating label:', labelData.name);
    const now = new Date();
    
    const cleanLabelData: any = {
      userId: userId.trim(),
      name: labelData.name.trim(),
      color: labelData.color || '#2979FF',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isArchived: false,
    };

    // Add optional fields
    if (labelData.description && labelData.description.trim()) {
      cleanLabelData.description = labelData.description.trim();
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.LABELS), cleanLabelData);
    
    const createdLabel = {
      id: docRef.id,
      ...cleanLabelData,
    };

    console.log('✅ Label created successfully:', createdLabel.id);
    return createdLabel;
  } catch (error: any) {
    handleFirebaseError(error, 'Create label');
    throw error;
  }
};

/**
 * עדכון תווית
 */
export const updateLabel = async (labelId: string, updates: Partial<Omit<Label, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  try {
    if (!labelId || labelId.trim() === '') {
      throw new Error('Label ID is required');
    }

    console.log('🔥 Updating label:', labelId);
    const labelRef = doc(db, COLLECTIONS.LABELS, labelId);
    
    // Build clean updates object
    const cleanUpdates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Add only valid fields to the update
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      
      if (value !== undefined) {
        if (value === null) {
          cleanUpdates[key] = null;
        } else if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue !== '') {
            cleanUpdates[key] = trimmedValue;
          }
        } else {
          cleanUpdates[key] = value;
        }
      }
    });

    await updateDoc(labelRef, cleanUpdates);
    console.log('✅ Label updated successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Update label');
  }
};

/**
 * מחיקת תווית והסרתה מכל המשימות
 */
export const deleteLabel = async (labelId: string): Promise<void> => {
  try {
    if (!labelId || labelId.trim() === '') {
      throw new Error('Label ID is required');
    }

    console.log('🔥 Deleting label:', labelId);
    const batch = writeBatch(db);
    
    // מחיקת התווית
    const labelRef = doc(db, COLLECTIONS.LABELS, labelId);
    batch.delete(labelRef);
    
    // עדכון כל המשימות שיש להן את התווית (הסרת התווית מהמערך)
    const tasksQuery = query(
      collection(db, COLLECTIONS.TASKS),
      where('labels', 'array-contains', labelId)
    );
    
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.forEach((taskDoc) => {
      const taskData = taskDoc.data();
      const updatedLabels = (taskData.labels || []).filter((id: string) => id !== labelId);
      
      const taskRef = doc(db, COLLECTIONS.TASKS, taskDoc.id);
      batch.update(taskRef, {
        labels: updatedLabels,
        updatedAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
    console.log('✅ Label deleted successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Delete label');
  }
};

/**
 * קבלת כל התוויות של משתמש
 */
export const getUserLabels = async (userId: string): Promise<Label[]> => {
  try {
    validateUserId(userId);
    
    console.log('🔥 Fetching labels for user:', userId);
    const q = query(
      collection(db, COLLECTIONS.LABELS),
      where('userId', '==', userId.trim()),
      where('isArchived', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const labels: Label[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      labels.push({
        id: doc.id,
        ...data,
      } as Label);
    });
    
    // Sort locally by name
    labels.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('✅ Labels fetched successfully:', labels.length);
    return labels;
  } catch (error: any) {
    handleFirebaseError(error, 'Get user labels');
    return []; // Fallback to empty array
  }
};

/**
 * האזנה בזמן אמת לשינויים בתוויות
 */
export const onLabelsChange = (userId: string, callback: (labels: Label[]) => void) => {
  try {
    validateUserId(userId);
    
    console.log('🔥 Setting up labels listener for user:', userId);
    
    const q = query(
      collection(db, COLLECTIONS.LABELS),
      where('userId', '==', userId.trim()),
      where('isArchived', '==', false)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      try {
        const labels: Label[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          labels.push({
            id: doc.id,
            ...data,
          } as Label);
        });
        
        // Sort locally by name
        labels.sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('📱 Labels updated via listener:', labels.length);
        callback(labels);
      } catch (error) {
        console.error('❌ Error processing labels snapshot:', error);
        callback([]);
      }
    }, (error) => {
      console.error('❌ Labels listener error:', error);
      callback([]);
    });
  } catch (error) {
    console.error('❌ Error setting up labels listener:', error);
    return () => {};
  }
};

// ====================== BULK OPERATIONS ======================

/**
 * מחיקת מספר משימות בבת אחת
 */
export const deleteTasks = async (taskIds: string[]): Promise<void> => {
  try {
    if (!taskIds || taskIds.length === 0) {
      throw new Error('Task IDs are required');
    }

    console.log('🔥 Bulk deleting tasks:', taskIds.length);
    const batch = writeBatch(db);
    
    taskIds.forEach(taskId => {
      if (taskId && taskId.trim() !== '') {
        const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
        batch.delete(taskRef);
      }
    });
    
    await batch.commit();
    console.log('✅ Tasks bulk deleted successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Bulk delete tasks');
  }
};

/**
 * עדכון מספר משימות בבת אחת
 */
export const updateTasks = async (updates: Array<{ id: string; data: Partial<Task> }>): Promise<void> => {
  try {
    if (!updates || updates.length === 0) {
      throw new Error('Updates are required');
    }

    console.log('🔥 Bulk updating tasks:', updates.length);
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      if (id && id.trim() !== '') {
        const taskRef = doc(db, COLLECTIONS.TASKS, id);
        
        // Build clean update data
        const cleanUpdateData: any = {
          updatedAt: new Date().toISOString()
        };

        // Add only valid fields to the update
        Object.keys(data).forEach(key => {
          const value = (data as any)[key];
          
          if (value !== undefined) {
            if (value === null) {
              cleanUpdateData[key] = null;
            } else if (typeof value === 'string') {
              const trimmedValue = value.trim();
              if (trimmedValue !== '') {
                cleanUpdateData[key] = trimmedValue;
              }
            } else if (Array.isArray(value)) {
              if (value.length > 0) {
                cleanUpdateData[key] = value.filter(item => item !== undefined && item !== null);
              } else {
                cleanUpdateData[key] = [];
              }
            } else {
              cleanUpdateData[key] = value;
            }
          }
        });

        batch.update(taskRef, cleanUpdateData);
      }
    });
    
    await batch.commit();
    console.log('✅ Tasks bulk updated successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Bulk update tasks');
  }
};

// ====================== HELPER FUNCTIONS ======================

/**
 * בדיקה אם משתמש קיים
 */
export const checkUserExists = async (userId: string): Promise<boolean> => {
  try {
    validateUserId(userId);
    
    const userRef = doc(db, COLLECTIONS.USERS, userId.trim());
    const userDoc = await getDoc(userRef);
    return userDoc.exists();
  } catch (error) {
    console.error('❌ Check user exists error:', error);
    return false;
  }
};

/**
 * ספירת משימות לפי סטטוס
 */
export const getTasksCounts = async (userId: string) => {
  try {
    validateUserId(userId);
    
    console.log('🔥 Calculating task counts for user:', userId);
    const tasks = await getUserTasks(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const counts = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
      today: tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      }).length,
      upcoming: tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= tomorrow;
      }).length,
      overdue: tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate < today;
      }).length,
    };

    console.log('✅ Task counts calculated:', counts);
    return counts;
  } catch (error: any) {
    console.error('❌ Get tasks counts error:', error);
    return {
      total: 0,
      completed: 0,
      pending: 0,
      today: 0,
      upcoming: 0,
      overdue: 0,
    };
  }
};

/**
 * יצירת משתמש חדש במסד הנתונים
 */
export const createUser = async (userId: string, userData: { email: string; displayName: string }): Promise<void> => {
  try {
    validateUserId(userId);
    
    if (!userData.email || userData.email.trim() === '') {
      throw new Error('User email is required');
    }

    console.log('🔥 Creating user profile:', userId);
    const userRef = doc(db, COLLECTIONS.USERS, userId.trim());
    
    const cleanUserDocument = {
      email: userData.email.trim(),
      displayName: userData.displayName?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, cleanUserDocument);
    console.log('✅ User profile created successfully');
  } catch (error: any) {
    handleFirebaseError(error, 'Create user');
  }
};

// ====================== SEARCH FUNCTIONS ======================

/**
 * חיפוש משימות
 */
export const searchTasks = async (userId: string, searchQuery: string): Promise<Task[]> => {
  try {
    validateUserId(userId);
    
    if (!searchQuery || searchQuery.trim() === '') {
      return [];
    }

    console.log('🔥 Searching tasks for user:', userId, 'query:', searchQuery);
    const tasks = await getUserTasks(userId);
    const query = searchQuery.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query) || false;
      
      return titleMatch || descriptionMatch;
    });

    console.log('✅ Search completed:', filteredTasks.length, 'results');
    return filteredTasks;
  } catch (error: any) {
    console.error('❌ Search tasks error:', error);
    return [];
  }
};

/**
 * קבלת משימות לפי פרויקט
 */
export const getTasksByProject = async (userId: string, projectId: string): Promise<Task[]> => {
  try {
    validateUserId(userId);
    
    if (!projectId || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    console.log('🔥 Fetching tasks for project:', projectId);
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('userId', '==', userId.trim()),
      where('projectId', '==', projectId.trim())
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
      } as Task);
    });
    
    // Sort by creation date
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('✅ Project tasks fetched successfully:', tasks.length);
    return tasks;
  } catch (error: any) {
    handleFirebaseError(error, 'Get tasks by project');
    return [];
  }
};

/**
 * קבלת משימות לפי תווית
 */
export const getTasksByLabel = async (userId: string, labelId: string): Promise<Task[]> => {
  try {
    validateUserId(userId);
    
    if (!labelId || labelId.trim() === '') {
      throw new Error('Label ID is required');
    }

    console.log('🔥 Fetching tasks for label:', labelId);
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('userId', '==', userId.trim()),
      where('labels', 'array-contains', labelId.trim())
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
      } as Task);
    });
    
    // Sort by creation date
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('✅ Label tasks fetched successfully:', tasks.length);
    return tasks;
  } catch (error: any) {
    handleFirebaseError(error, 'Get tasks by label');
    return [];
  }
};