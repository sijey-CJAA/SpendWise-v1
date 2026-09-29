import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  initializeAuth, 
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
  createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
  signOut as _signOut,
  onAuthStateChanged as _onAuthStateChanged,
  getAuth
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

import { Alert } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: any;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (e: any) {
  Alert.alert('Firebase Init Error', e?.message || 'Unknown error');
}

// Ensure compat uses the same config just in case
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const storage = firebase.storage();

// Initialize the modular auth with AsyncStorage to enable persistence
let modularAuth: any;
try {
  modularAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e: any) {
  // If it's already initialized, fallback to getAuth
  if (e?.message?.includes('already has Auth instance') || e?.code === 'auth/already-initialized') {
    modularAuth = getAuth(app);
  } else {
    Alert.alert('Firebase Auth Error', e?.message || 'Unknown error');
  }
}

// Mock the compat Auth object for existing screens
const auth = {
  get currentUser() { return modularAuth?.currentUser; },
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (modularAuth) return _onAuthStateChanged(modularAuth, callback);
    return () => {};
  },
};

// Wrapper functions
export const signInWithEmailAndPassword = (authObj: any, email: any, password: any) => _signInWithEmailAndPassword(modularAuth, email, password);
export const createUserWithEmailAndPassword = (authObj: any, email: any, password: any) => _createUserWithEmailAndPassword(modularAuth, email, password);
export const signOut = (authObj: any) => _signOut(modularAuth);

export { app, auth, db, storage };
