// src/store/index.ts
// הגדרת Redux Store עם Persist

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reducers
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import eventsReducer from './slices/eventsSlice';
import notesReducer from './slices/notesSlice';

// הגדרות Persist
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  // מה לשמור במטמון מקומי
  whitelist: ['auth', 'tasks', 'events', 'notes'],
  // מה לא לשמור (אם יש)
  blacklist: [], // כלום כרגע
};

// שילוב כל ה-Reducers
const rootReducer = combineReducers({
  auth: authReducer,
  tasks: tasksReducer,
  events: eventsReducer,
  notes: notesReducer,
});

// יצירת Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// יצירת ה-Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // התעלמות מפעולות Redux Persist שאינן serializable
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  // רק בפיתוח
  devTools: __DEV__,
});

// יצירת Persistor
export const persistor = persistStore(store);

// TypeScript Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// פונקציה לניקוי המטמון (אם נדרש)
export const clearPersistedData = () => {
  persistor.purge();
};

// פונקציה לאתחול מחדש של ה-Store
export const resetStore = () => {
  store.dispatch({ type: 'RESET' });
};

export default store;