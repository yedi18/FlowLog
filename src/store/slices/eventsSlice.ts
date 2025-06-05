// src/store/slices/eventsSlice.ts
// Redux Slice לניהול אירועים

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EventsState, Event } from '../../types';
import { 
  createEvent as createEventService,
  updateEvent as updateEventService,
  deleteEvent as deleteEventService,
  getUserEvents,
  getTodayEvents,
  getWeekEvents
} from '../../services/calendarService';

// Initial State
const initialState: EventsState = {
  events: [],
  isLoading: false,
  error: null,
};

// Async Thunks

/**
 * טעינת כל האירועים של המשתמש
 */
export const loadUserEvents = createAsyncThunk(
  'events/loadUserEvents',
  async (userId: string) => {
    const events = await getUserEvents(userId);
    return events;
  }
);

/**
 * טעינת אירועי היום
 */
export const loadTodayEvents = createAsyncThunk(
  'events/loadTodayEvents',
  async (userId: string) => {
    const events = await getTodayEvents(userId);
    return events;
  }
);

/**
 * טעינת אירועי השבוע
 */
export const loadWeekEvents = createAsyncThunk(
  'events/loadWeekEvents',
  async ({ userId, startOfWeek }: { userId: string; startOfWeek: Date }) => {
    const events = await getWeekEvents(userId, startOfWeek);
    return events;
  }
);

/**
 * יצירת אירוע חדש
 */
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async ({ userId, eventData }: { userId: string; eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'userId'> }) => {
    const event = await createEventService(userId, eventData);
    return event;
  }
);

/**
 * עדכון אירוע
 */
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, updates }: { eventId: string; updates: Partial<Omit<Event, 'id' | 'createdAt' | 'userId'>> }) => {
    await updateEventService(eventId, updates);
    return { eventId, updates };
  }
);

/**
 * מחיקת אירוע
 */
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string) => {
    await deleteEventService(eventId);
    return eventId;
  }
);

// Events Slice
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // פעולות סינכרוניות
    clearError: (state) => {
      state.error = null;
    },
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload);
      // מיון לפי תאריך התחלה
      state.events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    },
    updateEventLocal: (state, action: PayloadAction<{ eventId: string; updates: Partial<Event> }>) => {
      const { eventId, updates } = action.payload;
      const eventIndex = state.events.findIndex(event => event.id === eventId);
      if (eventIndex !== -1) {
        state.events[eventIndex] = { ...state.events[eventIndex], ...updates };
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
    clearEvents: (state) => {
      state.events = [];
    },
  },
  extraReducers: (builder) => {
    // Load User Events
    builder
      .addCase(loadUserEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(loadUserEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load events';
      });

    // Load Today Events
    builder
      .addCase(loadTodayEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTodayEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(loadTodayEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load today events';
      });

    // Load Week Events
    builder
      .addCase(loadWeekEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadWeekEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(loadWeekEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load week events';
      });

    // Create Event
    builder
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.push(action.payload);
        // מיון לפי תאריך התחלה
        state.events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create event';
      });

    // Update Event
    builder
      .addCase(updateEvent.pending, (state) => {
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const { eventId, updates } = action.payload;
        const eventIndex = state.events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex] = { ...state.events[eventIndex], ...updates };
        }
        state.error = null;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update event';
      });

    // Delete Event
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete event';
      });
  },
});

// Actions
export const { 
  clearError, 
  setEvents, 
  addEvent, 
  updateEventLocal, 
  removeEvent, 
  clearEvents 
} = eventsSlice.actions;

// Selectors
export const selectEvents = (state: { events: EventsState }) => state.events.events;
export const selectEventsLoading = (state: { events: EventsState }) => state.events.isLoading;
export const selectEventsError = (state: { events: EventsState }) => state.events.error;

// מותאמים אישית
export const selectTodayEvents = (state: { events: EventsState }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return state.events.events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate >= today && eventDate < tomorrow;
  });
};

export const selectUpcomingEvents = (state: { events: EventsState }) => {
  const now = new Date();
  return state.events.events.filter(event => new Date(event.startDate) > now);
};

export default eventsSlice.reducer;