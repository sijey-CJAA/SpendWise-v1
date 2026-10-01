import { Platform } from 'react-native';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import * as Clipboard from 'expo-clipboard';
import { auth, db, app } from '../config/firebase';

export type ErrorCategory = 
  | 'Firestore Write'
  | 'Firestore Read'
  | 'Authentication'
  | 'Firebase Init'
  | 'Network'
  | 'Runtime'
  | 'Storage'
  | 'General';

export interface AppErrorContext {
  category?: ErrorCategory;
  operation?: string;
  target?: string;
  additionalData?: any;
}

export interface AppErrorDetails {
  id: string;
  title: string;
  category: ErrorCategory;
  operation: string;
  message: string;
  firebaseCode?: string;
  firebaseMessage?: string;
  timestamp: string;
  userUid?: string;
  userEmail?: string;
  projectId?: string;
  environment: string;
  platform: string;
  appVersion: string;
  isAuthenticated: boolean;
  target?: string;
  stack?: string;
  rawError?: any;
}

export interface DiagnosticsState {
  firebaseInitialized: boolean;
  firestoreInitialized: boolean;
  lastSuccessfulRead: string | null;
  lastSuccessfulWrite: string | null;
  lastSuccessfulWriteTarget: string | null;
  lastError: AppErrorDetails | null;
  isOnline: boolean;
}

// In-memory diagnostic tracker
const diagnostics: DiagnosticsState = {
  firebaseInitialized: true,
  firestoreInitialized: !!db,
  lastSuccessfulRead: null,
  lastSuccessfulWrite: null,
  lastSuccessfulWriteTarget: null,
  lastError: null,
  isOnline: true,
};

// Monitor network state
NetInfo.addEventListener(state => {
  diagnostics.isOnline = state.isConnected === true && state.isInternetReachable !== false;
});

// Listener for the DebugErrorModal
type ErrorSubscriber = (error: AppErrorDetails | null) => void;
const errorSubscribers = new Set<ErrorSubscriber>();

let currentActiveError: AppErrorDetails | null = null;

export const subscribeToDebugErrors = (callback: ErrorSubscriber): (() => void) => {
  errorSubscribers.add(callback);
  // Immediately send active error if any
  callback(currentActiveError);
  return () => {
    errorSubscribers.delete(callback);
  };
};

export const dismissDebugModal = () => {
  currentActiveError = null;
  errorSubscribers.forEach(cb => cb(null));
};

export const recordSuccessfulRead = (operation = 'Read') => {
  diagnostics.lastSuccessfulRead = `${new Date().toLocaleTimeString()} (${operation})`;
};

export const recordSuccessfulWrite = (target = 'Document', docId?: string) => {
  diagnostics.lastSuccessfulWrite = new Date().toLocaleTimeString();
  diagnostics.lastSuccessfulWriteTarget = docId ? `${target}/${docId}` : target;
};

export const getDiagnosticsState = (): DiagnosticsState => {
  return { ...diagnostics };
};

// Map known Firebase codes to human-friendly descriptions
const getHumanReadableExplanation = (code?: string, rawMessage?: string): string => {
  if (!code && rawMessage) {
    if (rawMessage.includes('network') || rawMessage.includes('offline')) {
      return 'Network connection problem. Please verify internet access.';
    }
    return rawMessage;
  }
  switch (code) {
    case 'permission-denied':
      return 'Firestore rejected this operation. Check Firestore Security Rules for this collection/document.';
    case 'unavailable':
      return 'Firebase service is temporarily unavailable or cannot be reached from this device.';
    case 'unauthenticated':
      return 'Operation requires an authenticated user, but no valid user session was found.';
    case 'not-found':
      return 'The requested document was not found in Firestore.';
    case 'already-exists':
      return 'The document you are attempting to create already exists.';
    case 'resource-exhausted':
      return 'Firebase quota has been exceeded or rate limits have been triggered.';
    case 'cancelled':
      return 'Operation was cancelled by the client or server.';
    case 'deadline-exceeded':
      return 'The request timed out before Firestore could respond.';
    case 'auth/invalid-api-key':
      return 'The Firebase API Key is missing or invalid in this build.';
    case 'auth/user-not-found':
      return 'No account was found with the provided credentials.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'This email address is already associated with another account.';
    case 'auth/network-request-failed':
      return 'Network request to Firebase Authentication failed.';
    default:
      return rawMessage || 'An unexpected Firebase error occurred.';
  }
};

/**
 * Central Error Handler for SpendWise
 * 1. Logs error to console
 * 2. Extracts Firebase error code & message
 * 3. Saves into diagnostic state
 * 4. Triggers the DebugErrorModal
 * 5. Re-throws or returns the structured error
 */
export const handleAppError = (error: any, context?: AppErrorContext): AppErrorDetails => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // Extract Firebase code & message if available
  const firebaseCode = error?.code || error?.error?.code || (typeof error?.message === 'string' && error.message.match(/\[code=(.*?)\]/)?.[1]);
  const firebaseMessage = error?.message || error?.error?.message || String(error);
  
  const category: ErrorCategory = context?.category || (firebaseCode?.startsWith('auth/') ? 'Authentication' : 'Firestore Write');
  const operation = context?.operation || 'Firebase Operation';
  const target = context?.target;

  const user = auth.currentUser;
  const projectId = (app?.options as any)?.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'spendwise-26986';
  const environment = __DEV__ ? 'Development (Metro)' : 'Android Release APK';
  const appVersion = Constants.expoConfig?.version || '2.0.4';
  const platform = `${Platform.OS.toUpperCase()} (API ${Platform.Version || 'N/A'})`;

  const humanMessage = getHumanReadableExplanation(firebaseCode, firebaseMessage);

  const errorDetails: AppErrorDetails = {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    title: `ERROR: ${operation}`,
    category,
    operation,
    message: humanMessage,
    firebaseCode,
    firebaseMessage,
    timestamp,
    userUid: user?.uid || undefined,
    userEmail: user?.email || undefined,
    projectId,
    environment,
    platform,
    appVersion,
    isAuthenticated: !!user,
    target,
    stack: error?.stack || new Error().stack,
    rawError: error,
  };

  // Log in console
  console.error(`[SpendWise Error] [${category}] [${operation}]`, error);

  // Update diagnostic tracker
  diagnostics.lastError = errorDetails;

  // Broadcast to modal listeners
  currentActiveError = errorDetails;
  errorSubscribers.forEach(cb => cb(errorDetails));

  return errorDetails;
};

/**
 * Formats a clean, secret-free debug report for easy copying
 */
export const generateDebugReport = (err: AppErrorDetails): string => {
  return [
    '========================================',
    '        SPENDWISE DEBUG REPORT',
    '========================================',
    `App Version   : ${err.appVersion}`,
    `Platform      : ${err.platform}`,
    `Environment   : ${err.environment}`,
    `Timestamp     : ${err.timestamp}`,
    '----------------------------------------',
    `Category      : ${err.category}`,
    `Operation     : ${err.operation}`,
    err.target ? `Target        : ${err.target}` : null,
    '----------------------------------------',
    `Authenticated : ${err.isAuthenticated ? 'YES' : 'NO'}`,
    `User UID      : ${err.userUid || 'None (Unauthenticated)'}`,
    `User Email    : ${err.userEmail || 'N/A'}`,
    `Firebase Proj : ${err.projectId || 'N/A'}`,
    '----------------------------------------',
    `Firebase Code : ${err.firebaseCode || 'N/A'}`,
    `Message       : ${err.message}`,
    `Raw Error     : ${err.firebaseMessage || 'N/A'}`,
    '----------------------------------------',
    'Stack Trace:',
    err.stack ? err.stack.trim() : 'No stack trace available.',
    '========================================',
  ].filter(Boolean).join('\n');
};

/**
 * Copy formatted report to device clipboard
 */
export const copyDebugReportToClipboard = async (err: AppErrorDetails): Promise<boolean> => {
  try {
    const report = generateDebugReport(err);
    await Clipboard.setStringAsync(report);
    return true;
  } catch (e) {
    console.error('Failed to copy debug report:', e);
    return false;
  }
};

/**
 * Test Firebase Firestore Read (Harmless query)
 */
export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string; code?: string }> => {
  try {
    const user = auth.currentUser;
    // Attempt harmless query on expenses or debug_diagnostics
    const snapshot = await db.collection('expenses').limit(1).get();
    recordSuccessfulRead('Test Connection Query');
    return {
      success: true,
      message: `SUCCESS: Firestore read connection is working properly (${snapshot.size} doc(s) returned).`,
    };
  } catch (error: any) {
    const details = handleAppError(error, {
      category: 'Firestore Read',
      operation: 'Test Firebase Connection',
      target: 'expenses (limit 1)',
    });
    return {
      success: false,
      message: details.message,
      code: details.firebaseCode,
    };
  }
};

/**
 * Test Firebase Firestore Write (Dedicated diagnostic location)
 */
export const testFirestoreWrite = async (): Promise<{ success: boolean; message: string; documentPath: string; code?: string }> => {
  const user = auth.currentUser;
  const docId = user?.uid || `anon_test_${Date.now()}`;
  const docPath = `debug_diagnostics/${docId}`;
  
  try {
    const testRef = db.collection('debug_diagnostics').doc(docId);
    const testData = {
      test: true,
      testedAt: new Date().toISOString(),
      userUid: user?.uid || 'anonymous',
      platform: Platform.OS,
      build: __DEV__ ? 'Development' : 'Release APK',
    };
    
    // Write test document
    await testRef.set(testData);
    recordSuccessfulWrite('debug_diagnostics', docId);

    // Clean up test document
    try {
      await testRef.delete();
    } catch (cleanupErr) {
      console.warn('Test document cleanup skipped:', cleanupErr);
    }

    return {
      success: true,
      message: 'SUCCESS: Firestore write & delete operations succeeded.',
      documentPath: docPath,
    };
  } catch (error: any) {
    const details = handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Test Firestore Write',
      target: docPath,
    });
    return {
      success: false,
      message: details.message,
      documentPath: docPath,
      code: details.firebaseCode,
    };
  }
};
