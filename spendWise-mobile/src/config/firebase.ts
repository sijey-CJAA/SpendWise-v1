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
import { 
  initializeFirestore, 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { Alert } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBcGWdPPET-c07zt9-fear44498qxucl20',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'spendwise-26986.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'spendwise-26986',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'spendwise-26986.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '767926524621',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:767926524621:web:11502fac5d947abc362784',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-BX1ZRCV4J6'
};

let app: any;
let firebaseInitError: any = null;

try {
  if (!getApps().length) {
    console.log('[Firebase] Initializing app...');
    app = initializeApp(firebaseConfig);
  } else {
    console.log('[Firebase] App already initialized, getting app...');
    app = getApp();
  }
} catch (e: any) {
  firebaseInitError = e;
  console.error('[Firebase] Init Error:', e);
  Alert.alert('Firebase Init Error', `Details: ${e?.message}\nCode: ${e?.code || 'N/A'}`);
}

// Initialize Modular Auth with AsyncStorage persistence
let modularAuth: any;
try {
  console.log('[Firebase] Initializing modular auth with AsyncStorage...');
  modularAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e: any) {
  if (e?.message?.includes('already has Auth instance') || e?.code === 'auth/already-initialized') {
    console.log('[Firebase] Auth already initialized, falling back to getAuth().');
    modularAuth = getAuth(app);
  } else {
    firebaseInitError = e;
    console.error('[Firebase] Auth Init Error:', e);
    Alert.alert('Firebase Auth Error', `Details: ${e?.message}\nCode: ${e?.code || 'N/A'}`);
  }
}

// Initialize Modular Firestore with long-polling (vital for Android React Native)
let rawDb: Firestore;
try {
  console.log('[Firebase] Initializing modular firestore with long polling...');
  rawDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e: any) {
  console.log('[Firebase] initializeFirestore fallback to getFirestore:', e);
  rawDb = getFirestore(app);
}

// Initialize Modular Storage
const rawStorage: FirebaseStorage = getStorage(app);

// Compat Adapter for Firestore so existing service methods remain fully compatible
// while natively executing on the authenticated Modular Firestore instance
export const createFirestoreCompat = (firestore: Firestore) => {
  return {
    raw: firestore,
    collection: (collectionName: string) => {
      const colRef = collection(firestore, collectionName);
      return {
        add: async (data: any) => {
          return await addDoc(colRef, data);
        },
        doc: (docId: string) => {
          const dRef = doc(firestore, collectionName, docId);
          return {
            update: async (data: any) => {
              return await updateDoc(dRef, data);
            },
            delete: async () => {
              return await deleteDoc(dRef);
            },
          };
        },
        where: (fieldPath: string, opStr: any, value: any) => {
          let currentQuery = query(colRef, where(fieldPath, opStr, value));
          const queryWrapper = {
            where: (f2: string, op2: any, val2: any) => {
              currentQuery = query(currentQuery, where(f2, op2, val2));
              return queryWrapper;
            },
            onSnapshot: (onNext: (snapshot: any) => void, onError?: (error: any) => void) => {
              return onSnapshot(currentQuery, onNext, onError);
            }
          };
          return queryWrapper;
        },
        onSnapshot: (onNext: (snapshot: any) => void, onError?: (error: any) => void) => {
          return onSnapshot(colRef, onNext, onError);
        }
      };
    }
  };
};

// Compat Adapter for Firebase Storage
export const createStorageCompat = (storageInstance: FirebaseStorage) => {
  return {
    raw: storageInstance,
    ref: (path?: string) => {
      let currentPath = path || '';
      return {
        child: (subPath: string) => {
          const fullPath = currentPath ? `${currentPath}/${subPath}` : subPath;
          const sRef = ref(storageInstance, fullPath);
          return {
            putString: async (data: string, format?: string, metadata?: any) => {
              return await uploadString(sRef, data, (format as any) || 'raw', metadata);
            },
            getDownloadURL: async () => {
              return await getDownloadURL(sRef);
            }
          };
        }
      };
    }
  };
};

const db = createFirestoreCompat(rawDb);
const storage = createStorageCompat(rawStorage);

// Compat Auth object for existing screens
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

export { app, auth, db, storage, rawDb, rawStorage, firebaseInitError };
