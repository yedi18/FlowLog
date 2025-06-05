// src/services/calendarService.ts
// שירותי לוח שנה - TODO: להוסיף סנכרון עם גוגל בהמשך

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
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Event } from '../types';
import { COLLECTIONS } from '../utils/constants';

/**
 * יצירת אירוע חדש
 */
export const createEvent = async (userId: string, eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Event> => {
  try {
    const now = new Date().toISOString();
    const newEvent = {
      ...eventData,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), newEvent);
    
    return {
      id: docRef.id,
      ...newEvent,
    };
  } catch (error: any) {
    console.error('Create event error:', error);
    throw new Error(error.message || 'Failed to create event');
  }
};

/**
 * עדכון אירוע
 */
export const updateEvent = async (eventId: string, updates: Partial<Omit<Event, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  try {
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    throw new Error(error.message || 'Failed to update event');
  }
};

/**
 * מחיקת אירוע
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));
  } catch (error: any) {
    console.error('Delete event error:', error);
    throw new Error(error.message || 'Failed to delete event');
  }
};

/**
 * קבלת כל האירועים של משתמש
 */
export const getUserEvents = async (userId: string): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('userId', '==', userId),
      orderBy('startDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      } as Event);
    });
    
    return events;
  } catch (error: any) {
    console.error('Get user events error:', error);
    throw new Error(error.message || 'Failed to fetch events');
  }
};

/**
 * קבלת אירועים להיום
 */
export const getTodayEvents = async (userId: string): Promise<Event[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('userId', '==', userId),
      where('startDate', '>=', today.toISOString()),
      where('startDate', '<', tomorrow.toISOString()),
      orderBy('startDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      } as Event);
    });
    
    return events;
  } catch (error: any) {
    console.error('Get today events error:', error);
    // אם יש בעיה עם השאילתה, ננסה בלי תאריכים
    return getUserEvents(userId);
  }
};

/**
 * קבלת אירועים לשבוע
 */
export const getWeekEvents = async (userId: string, startOfWeek: Date): Promise<Event[]> => {
  try {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('userId', '==', userId),
      where('startDate', '>=', startOfWeek.toISOString()),
      where('startDate', '<', endOfWeek.toISOString()),
      orderBy('startDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      } as Event);
    });
    
    return events;
  } catch (error: any) {
    console.error('Get week events error:', error);
    return getUserEvents(userId);
  }
};

/**
 * האזנה בזמן אמת לשינויים באירועים
 */
export const onEventsChange = (userId: string, callback: (events: Event[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.EVENTS),
    where('userId', '==', userId),
    orderBy('startDate', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      } as Event);
    });
    callback(events);
  }, (error) => {
    console.error('Events listener error:', error);
  });
};

// TODO: סנכרון עם Google Calendar
/**
 * סנכרון עם גוגל קלנדר - להמשך
 */
export const syncWithGoogleCalendar = async (userId: string): Promise<void> => {
  // TODO: לממש בהמשך
  console.log('Google Calendar sync - Coming soon!');
  // 1. הוספת Google Calendar API
  // 2. אימות עם Google
  // 3. משיכת אירועים
  // 4. סנכרון דו-כיווני
};