import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();

// Initialize the modular auth with AsyncStorage to enable persistence
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Get the compat auth which will now use the properly configured persistence
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Wrapper functions to maintain compatibility with our Login/Dashboard screens
export const signInWithEmailAndPassword = (authObj: any, email: any, password: any) => authObj.signInWithEmailAndPassword(email, password);
export const createUserWithEmailAndPassword = (authObj: any, email: any, password: any) => authObj.createUserWithEmailAndPassword(email, password);
export const signOut = (authObj: any) => authObj.signOut();

export { app, auth, db, storage };
