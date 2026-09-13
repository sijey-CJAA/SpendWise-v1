import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  initializeAuth, 
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
  createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
  signOut as _signOut,
  onAuthStateChanged as _onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 1. Initialize Modular App first
let modularApp;
if (!getApps().length) {
  modularApp = initializeApp(firebaseConfig);
} else {
  modularApp = getApp();
}

// 2. Initialize Modular Auth with the Modular App instance
const modularAuth = initializeAuth(modularApp, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// 3. Initialize Compat App (it will automatically share the modular app instance)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();
const db = firebase.firestore();
const storage = firebase.storage();

// 4. Mock the compat Auth object for existing screens
const auth = {
  get currentUser() { return modularAuth.currentUser; },
  onAuthStateChanged: (callback: (user: User | null) => void) => _onAuthStateChanged(modularAuth, callback),
};

// Wrapper functions
export const signInWithEmailAndPassword = (authObj: any, email: any, password: any) => _signInWithEmailAndPassword(modularAuth, email, password);
export const createUserWithEmailAndPassword = (authObj: any, email: any, password: any) => _createUserWithEmailAndPassword(modularAuth, email, password);
export const signOut = (authObj: any) => _signOut(modularAuth);

export { app, auth, db, storage };
