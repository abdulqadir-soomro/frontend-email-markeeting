import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCRJfMxJk3xuPLhdyWUj9Qo5u2QWJY_xFY",
  authDomain: "emailmarkeeting-423fc.firebaseapp.com",
  projectId: "emailmarkeeting-423fc",
  storageBucket: "emailmarkeeting-423fc.firebasestorage.app",
  messagingSenderId: "199492375165",
  appId: "1:199492375165:web:abcceaba10977dc444d714"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
