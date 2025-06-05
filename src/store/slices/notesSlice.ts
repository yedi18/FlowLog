// src/store/slices/notesSlice.ts
// Redux Slice לניהול הערות - גרסה מתוקנת

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotesState, Note } from '../../types';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { COLLECTIONS } from '../../utils/constants';

// Initial State
const initialState: NotesState = {
  notes: [],
  isLoading: false,
  error: null,
};

// שירותי הערות (פונקציות עזר)
const createNoteService = async (userId: string, noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Note> => {
  const now = new Date().toISOString();
  const newNote = {
    ...noteData,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.NOTES), newNote);
  
  return {
    id: docRef.id,
    ...newNote,
  };
};

const updateNoteService = async (noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
  await updateDoc(noteRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

const deleteNoteService = async (noteId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.NOTES, noteId));
};

const getUserNotesService = async (userId: string): Promise<Note[]> => {
  const q = query(
    collection(db, COLLECTIONS.NOTES),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const notes: Note[] = [];
  
  querySnapshot.forEach((doc) => {
    notes.push({
      id: doc.id,
      ...doc.data(),
    } as Note);
  });
  
  return notes;
};

// Async Thunks

/**
 * טעינת כל ההערות של המשתמש
 */
export const loadUserNotes = createAsyncThunk(
  'notes/loadUserNotes',
  async (userId: string) => {
    const notes = await getUserNotesService(userId);
    return notes;
  }
);

/**
 * יצירת הערה חדשה
 */
export const createNote = createAsyncThunk(
  'notes/createNote',
  async ({ userId, noteData }: { userId: string; noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'> }) => {
    const note = await createNoteService(userId, noteData);
    return note;
  }
);

/**
 * עדכון הערה
 */
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ noteId, updates }: { noteId: string; updates: Partial<Omit<Note, 'id' | 'createdAt' | 'userId'>> }) => {
    await updateNoteService(noteId, updates);
    return { noteId, updates };
  }
);

/**
 * מחיקת הערה
 */
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (noteId: string) => {
    await deleteNoteService(noteId);
    return noteId;
  }
);

// Notes Slice
const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    // פעולות סינכרוניות
    clearError: (state) => {
      state.error = null;
    },
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.unshift(action.payload); // הוספה לתחילת הרשימה
    },
    updateNoteLocal: (state, action: PayloadAction<{ noteId: string; updates: Partial<Note> }>) => {
      const { noteId, updates } = action.payload;
      const noteIndex = state.notes.findIndex(note => note.id === noteId);
      if (noteIndex !== -1) {
        state.notes[noteIndex] = { ...state.notes[noteIndex], ...updates };
      }
    },
    removeNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(note => note.id !== action.payload);
    },
    clearNotes: (state) => {
      state.notes = [];
    },
  },
  extraReducers: (builder) => {
    // Load User Notes
    builder
      .addCase(loadUserNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
        state.error = null;
      })
      .addCase(loadUserNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load notes';
      });

    // Create Note
    builder
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes.unshift(action.payload); // הוספה לתחילת הרשימה
        state.error = null;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create note';
      });

    // Update Note
    builder
      .addCase(updateNote.pending, (state) => {
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const { noteId, updates } = action.payload;
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
          state.notes[noteIndex] = { ...state.notes[noteIndex], ...updates };
        }
        state.error = null;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update note';
      });

    // Delete Note
    builder
      .addCase(deleteNote.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(note => note.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete note';
      });
  },
});

// Actions
export const { 
  clearError, 
  setNotes, 
  addNote, 
  updateNoteLocal, 
  removeNote, 
  clearNotes 
} = notesSlice.actions;

// Selectors
export const selectNotes = (state: { notes: NotesState }) => state.notes.notes;
export const selectNotesLoading = (state: { notes: NotesState }) => state.notes.isLoading;
export const selectNotesError = (state: { notes: NotesState }) => state.notes.error;

// מותאמים אישית
export const selectNotesByTag = (state: { notes: NotesState }, tag: string) =>
  state.notes.notes.filter(note => note.tags?.includes(tag));

export const selectRecentNotes = (state: { notes: NotesState }, limit: number = 5) =>
  state.notes.notes.slice(0, limit);

export const selectNotesCount = (state: { notes: NotesState }) => state.notes.notes.length;

export default notesSlice.reducer;