// src/services/firebase.ts
// הגדרות Firebase פועלות - גרסה פשוטה שתמיד עובדת

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// זהו הconfig שלך!
const firebaseConfig = {
  apiKey: "AIzaSyB2yhTXGTT3_p0d9yddsU1grjEggwTr6uA",
  authDomain: "flowlog-fb746.firebaseapp.com",
  projectId: "flowlog-fb746",
  storageBucket: "flowlog-fb746.firebasestorage.app",
  messagingSenderId: "465237889112",
  appId: "1:465237889112:web:22b50ea88ba1cffe54ba2d",
  measurementId: "G-9KLH30LZ6X"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);

// אתחול Authentication - גרסה פשוטה שעובדת
export const auth = getAuth(app);

// אתחול Firestore
export const db = getFirestore(app);

export default app;

// לוג לבדיקה
