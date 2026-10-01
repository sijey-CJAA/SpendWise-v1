import { db, auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from './syncService';
import { handleAppError, recordSuccessfulRead, recordSuccessfulWrite } from './errorHandler';

const CACHE_KEYS = {
  EXPENSES: '@expenses_cache',
  UPCOMING_PAYMENTS: '@upcoming_payments_cache',
  SHARED_EXPENSES: '@shared_expenses_cache'
};

// --- In-Memory Caches & Subscribers for Optimistic UI ---
let cachedExpenses: any[] = [];
const expensesSubscribers = new Set<(data: any[]) => void>();

let cachedUpcomingPayments: any[] = [];
const upcomingPaymentsSubscribers = new Set<(data: any[]) => void>();

let cachedSharedExpenses: any[] = [];
const sharedExpensesSubscribers = new Set<(data: any[]) => void>();

const notifyExpenses = () => {
  expensesSubscribers.forEach(cb => cb([...cachedExpenses]));
};

const notifyUpcomingPayments = () => {
  upcomingPaymentsSubscribers.forEach(cb => cb([...cachedUpcomingPayments]));
};

const notifySharedExpenses = () => {
  sharedExpensesSubscribers.forEach(cb => cb([...cachedSharedExpenses]));
};

export interface ExpenseData {
  amount: number;
  name: string;
  category: string;
  date: string;
  paymentMethod: string;
  notes: string;
  isRecurring: boolean;
}

/**
 * Add Expense
 * User submits -> Validate -> Attempt Firestore write
 * If Firestore succeeds -> Record diagnostic, Update UI cache
 * If Firestore fails -> Show DebugErrorModal via handleAppError, throw error (do not pretend save succeeded)
 */
export const addExpense = async (expenseData: ExpenseData, isSyncing = false) => {
  const user = auth.currentUser;
  if (!user) {
    const err = new Error('User must be logged in to add an expense.');
    handleAppError(err, { category: 'Authentication', operation: 'Add Expense - Auth Check' });
    throw err;
  }

  // If explicitly offline, queue for sync
  if (!isSyncing && !syncService.getIsOnline()) {
    const tempId = 'temp_' + Date.now().toString();
    const newExpense = { ...expenseData, userId: user.uid, createdAt: new Date().toISOString(), id: tempId };
    
    cachedExpenses.unshift(newExpense);
    await AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(cachedExpenses));
    notifyExpenses();

    await syncService.queueAction('ADD_EXPENSE', expenseData);
    return tempId;
  }

  const newDoc = {
    ...expenseData,
    userId: user.uid,
    createdAt: new Date().toISOString(),
  };

  try {
    // Attempt Firestore write directly
    const docRef = await db.collection('expenses').add(newDoc);
    
    // Record diagnostic success
    recordSuccessfulWrite('expenses', docRef.id);

    // Update UI state and persistent cache only upon success
    if (!isSyncing) {
      cachedExpenses.unshift({ ...newDoc, id: docRef.id });
      await AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(cachedExpenses));
      notifyExpenses();
    }

    return docRef.id;
  } catch (error: any) {
    // Log and route through centralized debug error modal
    handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Adding Expense',
      target: 'expenses',
      additionalData: expenseData,
    });

    if (!isSyncing) {
      // Also queue into syncService so user data is not lost if offline
      await syncService.queueAction('ADD_EXPENSE', expenseData);
    }

    // Re-throw so caller (AddExpenseModal) does not pretend save succeeded
    throw error;
  }
};

/**
 * Update Expense
 */
export const updateExpense = async (expenseId: string, expenseData: Partial<ExpenseData>, isSyncing = false) => {
  if (!isSyncing && !syncService.getIsOnline()) {
    cachedExpenses = cachedExpenses.map(exp => exp.id === expenseId ? { ...exp, ...expenseData } : exp);
    await AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(cachedExpenses));
    notifyExpenses();

    await syncService.queueAction('UPDATE_EXPENSE', { id: expenseId, data: expenseData });
    return;
  }

  try {
    await db.collection('expenses').doc(expenseId).update(expenseData);
    recordSuccessfulWrite('expenses', expenseId);

    if (!isSyncing) {
      cachedExpenses = cachedExpenses.map(exp => exp.id === expenseId ? { ...exp, ...expenseData } : exp);
      await AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(cachedExpenses));
      notifyExpenses();
    }
  } catch (error: any) {
    handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Updating Expense',
      target: `expenses/${expenseId}`,
      additionalData: expenseData,
    });
    if (!isSyncing) {
      await syncService.queueAction('UPDATE_EXPENSE', { id: expenseId, data: expenseData });
    }
    throw error;
  }
};

/**
 * Delete Expense
 */
export const deleteExpense = async (expenseId: string, isSyncing = false) => {
  if (!isSyncing && !syncService.getIsOnline()) {
    cachedExpenses = cachedExpenses.filter(exp => exp.id !== expenseId);
    await AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(cachedExpenses));
    notifyExpenses();

    await syncService.queueAction('DELETE_EXPENSE', { id: expenseId });
    return;
  }

  try {
    await db.collection('expenses').doc(expenseId).delete();
    recordSuccessfulWrite('expenses (delete)', expenseId);

    if (!isSyncing) {
      cachedExpenses = cachedExpenses.filter(exp => exp.id !== expenseId);
      await AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(cachedExpenses));
      notifyExpenses();
    }
  } catch (error: any) {
    handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Deleting Expense',
      target: `expenses/${expenseId}`,
    });
    if (!isSyncing) {
      await syncService.queueAction('DELETE_EXPENSE', { id: expenseId });
    }
    throw error;
  }
};

/**
 * Subscribe to User Expenses with real-time sync and diagnostics
 */
export const subscribeToExpenses = (userId: string, callback: (expenses: any[]) => void) => {
  expensesSubscribers.add(callback);
  
  // Initial load from local persistent cache
  AsyncStorage.getItem(CACHE_KEYS.EXPENSES).then(data => {
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedExpenses = parsed;
          callback([...cachedExpenses]);
        }
      } catch (e) {
        console.error("Error parsing cached expenses:", e);
      }
    }
  });

  const unsubscribe = db.collection('expenses')
    .where('userId', '==', userId)
    .onSnapshot(
      async (snapshot: any) => {
        let serverExpenses = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
        recordSuccessfulRead(`expenses (${serverExpenses.length} items)`);

        let finalExpenses = [...serverExpenses];
        
        try {
          const queue = await syncService.getQueue();
          const pendingAdds = queue
            .filter(a => a.type === 'ADD_EXPENSE')
            .map(a => ({ ...a.payload, id: 'temp_' + a.id }));
          
          const pendingDeletes = queue.filter(a => a.type === 'DELETE_EXPENSE').map(a => a.payload.id);
          const pendingUpdates = queue.filter(a => a.type === 'UPDATE_EXPENSE');
          
          finalExpenses = finalExpenses.filter(exp => !pendingDeletes.includes(exp.id));
          
          pendingUpdates.forEach(update => {
            const idx = finalExpenses.findIndex(e => e.id === update.payload.id);
            if (idx !== -1) {
              finalExpenses[idx] = { ...finalExpenses[idx], ...update.payload.data };
            }
          });
          
          // Preserve any unconfirmed optimistic expenses already present in cachedExpenses
          const localOptimistic = cachedExpenses.filter(e => 
            e.id && String(e.id).startsWith('temp_') &&
            !pendingDeletes.includes(e.id) &&
            !pendingAdds.some(pa => pa.id === e.id) &&
            !serverExpenses.some((se: any) => se.name === e.name && Number(se.amount) === Number(e.amount) && se.date === e.date)
          );

          finalExpenses = [...finalExpenses, ...pendingAdds, ...localOptimistic];

          // Deduplicate by ID
          const seen = new Set();
          finalExpenses = finalExpenses.filter(e => {
            if (seen.has(e.id)) return false;
            seen.add(e.id);
            return true;
          });
        } catch (error) {
          console.error("Error applying offline queue to expenses:", error);
        }

        finalExpenses.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });

        cachedExpenses = finalExpenses;
        AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(finalExpenses));
        notifyExpenses();
      },
      (error: any) => {
        // Route read failures to centralized error handler
        handleAppError(error, {
          category: 'Firestore Read',
          operation: 'Loading User Expenses',
          target: `expenses (userId=${userId})`,
        });
        // Ensure UI continues showing cached data
        callback([...cachedExpenses]);
      }
    );

  return () => {
    unsubscribe();
    expensesSubscribers.delete(callback);
  };
};

export interface UpcomingPaymentData {
  id?: string;
  amount: number;
  name: string;
  category: string;
  dueDate: string;
  notes: string;
  reminder: boolean;
  lastPromptedAt?: string;
}

/**
 * Add Upcoming Payment
 */
export const addUpcomingPayment = async (paymentData: UpcomingPaymentData, isSyncing = false) => {
  const user = auth.currentUser;
  if (!user) {
    const err = new Error('User must be logged in to add upcoming payment.');
    handleAppError(err, { category: 'Authentication', operation: 'Add Upcoming Payment - Auth Check' });
    throw err;
  }

  if (!isSyncing && !syncService.getIsOnline()) {
    const tempId = 'temp_' + Date.now().toString();
    const newPayment = { ...paymentData, userId: user.uid, createdAt: new Date().toISOString(), id: tempId };
    
    cachedUpcomingPayments.push(newPayment);
    cachedUpcomingPayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    await AsyncStorage.setItem(CACHE_KEYS.UPCOMING_PAYMENTS, JSON.stringify(cachedUpcomingPayments));
    notifyUpcomingPayments();

    await syncService.queueAction('ADD_UPCOMING_PAYMENT', paymentData);
    return tempId;
  }

  const newDoc = {
    ...paymentData,
    userId: user.uid,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await db.collection('upcomingPayments').add(newDoc);
    recordSuccessfulWrite('upcomingPayments', docRef.id);

    if (!isSyncing) {
      cachedUpcomingPayments.push({ ...newDoc, id: docRef.id });
      cachedUpcomingPayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      await AsyncStorage.setItem(CACHE_KEYS.UPCOMING_PAYMENTS, JSON.stringify(cachedUpcomingPayments));
      notifyUpcomingPayments();
    }

    return docRef.id;
  } catch (error: any) {
    handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Adding Upcoming Payment',
      target: 'upcomingPayments',
      additionalData: paymentData,
    });
    if (!isSyncing) {
      await syncService.queueAction('ADD_UPCOMING_PAYMENT', paymentData);
    }
    throw error;
  }
};

/**
 * Subscribe to Upcoming Payments
 */
export const subscribeToUpcomingPayments = (userId: string, callback: (payments: any[]) => void) => {
  upcomingPaymentsSubscribers.add(callback);

  AsyncStorage.getItem(CACHE_KEYS.UPCOMING_PAYMENTS).then(data => {
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedUpcomingPayments = parsed;
          callback([...cachedUpcomingPayments]);
        }
      } catch (e) {
        console.error("Error parsing cached upcoming payments:", e);
      }
    }
  });

  const unsubscribe = db.collection('upcomingPayments')
    .where('userId', '==', userId)
    .onSnapshot(
      async (snapshot: any) => {
        let serverPayments = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
        recordSuccessfulRead(`upcomingPayments (${serverPayments.length} items)`);

        let finalPayments = [...serverPayments];
        
        try {
          const queue = await syncService.getQueue();
          const pendingAdds = queue
            .filter(a => a.type === 'ADD_UPCOMING_PAYMENT')
            .map(a => ({ ...a.payload, id: 'temp_' + a.id }));
          
          const pendingDeletes = queue.filter(a => a.type === 'DELETE_UPCOMING_PAYMENT').map(a => a.payload.id);
          const pendingUpdates = queue.filter(a => a.type === 'UPDATE_UPCOMING_PAYMENT');
          
          finalPayments = finalPayments.filter(payment => !pendingDeletes.includes(payment.id));
          
          pendingUpdates.forEach(update => {
            const idx = finalPayments.findIndex(p => p.id === update.payload.id);
            if (idx !== -1) {
              finalPayments[idx] = { ...finalPayments[idx], ...update.payload.data };
            }
          });
          
          // Preserve any unconfirmed optimistic upcoming payments
          const localOptimistic = cachedUpcomingPayments.filter(p => 
            p.id && String(p.id).startsWith('temp_') &&
            !pendingDeletes.includes(p.id) &&
            !pendingAdds.some(pa => pa.id === p.id) &&
            !serverPayments.some((sp: any) => sp.name === p.name && sp.dueDate === p.dueDate)
          );

          finalPayments = [...finalPayments, ...pendingAdds, ...localOptimistic];

          const seen = new Set();
          finalPayments = finalPayments.filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          });
        } catch (error) {
          console.error("Error applying offline queue to upcoming payments:", error);
        }

        finalPayments.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        cachedUpcomingPayments = finalPayments;
        AsyncStorage.setItem(CACHE_KEYS.UPCOMING_PAYMENTS, JSON.stringify(finalPayments));
        notifyUpcomingPayments();
      },
      (error: any) => {
        handleAppError(error, {
          category: 'Firestore Read',
          operation: 'Loading Upcoming Payments',
          target: `upcomingPayments (userId=${userId})`,
        });
        callback([...cachedUpcomingPayments]);
      }
    );

  return () => {
    unsubscribe();
    upcomingPaymentsSubscribers.delete(callback);
  };
};

/**
 * Update Upcoming Payment
 */
export const updateUpcomingPayment = async (paymentId: string, paymentData: Partial<UpcomingPaymentData>, isSyncing = false) => {
  if (!isSyncing && !syncService.getIsOnline()) {
    cachedUpcomingPayments = cachedUpcomingPayments.map(p => p.id === paymentId ? { ...p, ...paymentData } : p);
    await AsyncStorage.setItem(CACHE_KEYS.UPCOMING_PAYMENTS, JSON.stringify(cachedUpcomingPayments));
    notifyUpcomingPayments();

    await syncService.queueAction('UPDATE_UPCOMING_PAYMENT', { id: paymentId, data: paymentData });
    return;
  }

  try {
    await db.collection('upcomingPayments').doc(paymentId).update(paymentData);
    recordSuccessfulWrite('upcomingPayments', paymentId);

    if (!isSyncing) {
      cachedUpcomingPayments = cachedUpcomingPayments.map(p => p.id === paymentId ? { ...p, ...paymentData } : p);
      await AsyncStorage.setItem(CACHE_KEYS.UPCOMING_PAYMENTS, JSON.stringify(cachedUpcomingPayments));
      notifyUpcomingPayments();
    }
  } catch (error: any) {
    handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Updating Upcoming Payment',
      target: `upcomingPayments/${paymentId}`,
      additionalData: paymentData,
    });
    if (!isSyncing) {
      await syncService.queueAction('UPDATE_UPCOMING_PAYMENT', { id: paymentId, data: paymentData });
    }
    throw error;
  }
};

/**
 * Delete Upcoming Payment
 */
export const deleteUpcomingPayment = async (paymentId: string, isSyncing = false) => {
  if (!isSyncing && !syncService.getIsOnline()) {
    cachedUpcomingPayments = cachedUpcomingPayments.filter(p => p.id !== paymentId);
    await AsyncStorage.setItem(CACHE_KEYS.UPCOMING_PAYMENTS, JSON.stringify(cachedUpcomingPayments));
    notifyUpcomingPayments();

    await syncService.queueAction('DELETE_UPCOMING_PAYMENT', { id: paymentId });
    return;
  }

  try {
    await db.collection('upcomingPayments').doc(paymentId).delete();
    recordSuccessfulWrite('upcomingPayments (delete)', paymentId);

    if (!isSyncing) {
      cachedUpcomingPayments = cachedUpcomingPayments.filter(p => p.id !== paymentId);
      await AsyncStorage.setItem(CACHE_KEYS.UPCOMING_PAYMENTS, JSON.stringify(cachedUpcomingPayments));
      notifyUpcomingPayments();
    }
  } catch (error: any) {
    handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Deleting Upcoming Payment',
      target: `upcomingPayments/${paymentId}`,
    });
    if (!isSyncing) {
      await syncService.queueAction('DELETE_UPCOMING_PAYMENT', { id: paymentId });
    }
    throw error;
  }
};

export interface SharedExpenseItem {
  name: string;
  price: number;
}

export interface SharedExpenseData {
  id?: string;
  amount: number;
  description: string;
  personEmail: string;
  type: 'iOwe' | 'theyOweMe';
  dueDate: string;
  status: 'pending' | 'awaiting_approval' | 'paid';
  items?: SharedExpenseItem[];
  receiptUrl?: string;
  creatorEmail?: string;
  involvedEmails?: string[];
  seenBy?: string[];
}

/**
 * Add Shared Expense
 */
export const addSharedExpense = async (expenseData: SharedExpenseData, isSyncing = false) => {
  const user = auth.currentUser;
  if (!user) {
    const err = new Error('User must be logged in to add shared expense.');
    handleAppError(err, { category: 'Authentication', operation: 'Add Shared Expense - Auth Check' });
    throw err;
  }

  if (!isSyncing && !syncService.getIsOnline()) {
    const tempId = 'temp_' + Date.now().toString();
    const newExpense = { 
      ...expenseData, 
      userId: user.uid, 
      creatorEmail: user.email,
      involvedEmails: [user.email, expenseData.personEmail.toLowerCase()],
      seenBy: [user.email],
      createdAt: new Date().toISOString(), 
      id: tempId 
    };
    
    cachedSharedExpenses.push(newExpense);
    await AsyncStorage.setItem(CACHE_KEYS.SHARED_EXPENSES, JSON.stringify(cachedSharedExpenses));
    notifySharedExpenses();

    await syncService.queueAction('ADD_SHARED_EXPENSE', expenseData);
    return tempId;
  }

  const newDoc = {
    ...expenseData,
    userId: user.uid,
    creatorEmail: user.email,
    involvedEmails: [user.email, expenseData.personEmail.toLowerCase()],
    seenBy: [user.email],
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await db.collection('sharedExpenses').add(newDoc);
    recordSuccessfulWrite('sharedExpenses', docRef.id);

    if (!isSyncing) {
      cachedSharedExpenses.push({ ...newDoc, id: docRef.id });
      await AsyncStorage.setItem(CACHE_KEYS.SHARED_EXPENSES, JSON.stringify(cachedSharedExpenses));
      notifySharedExpenses();
    }

    return docRef.id;
  } catch (error: any) {
    handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Adding Shared Expense',
      target: 'sharedExpenses',
      additionalData: expenseData,
    });
    if (!isSyncing) {
      await syncService.queueAction('ADD_SHARED_EXPENSE', expenseData);
    }
    throw error;
  }
};

/**
 * Subscribe to Shared Expenses
 */
export const subscribeToSharedExpenses = (userEmail: string, callback: (expenses: any[]) => void) => {
  sharedExpensesSubscribers.add(callback);

  AsyncStorage.getItem(CACHE_KEYS.SHARED_EXPENSES).then(data => {
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedSharedExpenses = parsed;
          callback([...cachedSharedExpenses]);
        }
      } catch (e) {
        console.error("Error parsing cached shared expenses:", e);
      }
    }
  });

  const unsubscribe = db.collection('sharedExpenses')
    .where('involvedEmails', 'array-contains', userEmail.toLowerCase())
    .onSnapshot(
      async (snapshot: any) => {
        let serverExpenses = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          const isCreator = data.creatorEmail === userEmail;
          let type = data.type;
          let personEmail = data.personEmail;
          if (!isCreator) {
            type = data.type === 'iOwe' ? 'theyOweMe' : 'iOwe';
            personEmail = data.creatorEmail;
          }
          return { ...data, id: doc.id, type, personEmail };
        });
        recordSuccessfulRead(`sharedExpenses (${serverExpenses.length} items)`);

        let finalExpenses = [...serverExpenses];
        
        try {
          const queue = await syncService.getQueue();
          const pendingAdds = queue
            .filter(a => a.type === 'ADD_SHARED_EXPENSE')
            .map(a => {
              const data = a.payload;
              let type = data.type;
              let personEmail = data.personEmail;
              return { ...data, id: 'temp_' + a.id, type, personEmail };
            });
          
          const pendingDeletes = queue.filter(a => a.type === 'DELETE_SHARED_EXPENSE').map(a => a.payload.id);
          const pendingUpdates = queue.filter(a => a.type === 'UPDATE_SHARED_EXPENSE');
          
          finalExpenses = finalExpenses.filter(exp => !pendingDeletes.includes(exp.id));
          
          pendingUpdates.forEach(update => {
            const idx = finalExpenses.findIndex(e => e.id === update.payload.id);
            if (idx !== -1) {
              finalExpenses[idx] = { ...finalExpenses[idx], ...update.payload.data };
            }
          });
          
          // Preserve any unconfirmed optimistic shared expenses
          const localOptimistic = cachedSharedExpenses.filter(e => 
            e.id && String(e.id).startsWith('temp_') &&
            !pendingDeletes.includes(e.id) &&
            !pendingAdds.some(pa => pa.id === e.id) &&
            !serverExpenses.some((se: any) => se.description === e.description && Number(se.amount) === Number(e.amount))
          );

          finalExpenses = [...finalExpenses, ...pendingAdds, ...localOptimistic];

          const seen = new Set();
          finalExpenses = finalExpenses.filter(e => {
            if (seen.has(e.id)) return false;
            seen.add(e.id);
            return true;
          });
        } catch (error) {
          console.error("Error applying offline queue to shared expenses:", error);
        }
        
        finalExpenses.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        cachedSharedExpenses = finalExpenses;
        AsyncStorage.setItem(CACHE_KEYS.SHARED_EXPENSES, JSON.stringify(finalExpenses));
        notifySharedExpenses();
      },
      (error: any) => {
        handleAppError(error, {
          category: 'Firestore Read',
          operation: 'Loading Shared Expenses',
          target: `sharedExpenses (user=${userEmail})`,
        });
        callback([...cachedSharedExpenses]);
      }
    );

  return () => {
    unsubscribe();
    sharedExpensesSubscribers.delete(callback);
  };
};

/**
 * Update Shared Expense
 */
export const updateSharedExpense = async (expenseId: string, expenseData: Partial<SharedExpenseData>, isSyncing = false) => {
  if (!isSyncing && !syncService.getIsOnline()) {
    cachedSharedExpenses = cachedSharedExpenses.map(exp => exp.id === expenseId ? { ...exp, ...expenseData } : exp);
    await AsyncStorage.setItem(CACHE_KEYS.SHARED_EXPENSES, JSON.stringify(cachedSharedExpenses));
    notifySharedExpenses();

    await syncService.queueAction('UPDATE_SHARED_EXPENSE', { id: expenseId, data: expenseData });
    return;
  }

  try {
    await db.collection('sharedExpenses').doc(expenseId).update(expenseData);
    recordSuccessfulWrite('sharedExpenses', expenseId);

    if (!isSyncing) {
      cachedSharedExpenses = cachedSharedExpenses.map(exp => exp.id === expenseId ? { ...exp, ...expenseData } : exp);
      await AsyncStorage.setItem(CACHE_KEYS.SHARED_EXPENSES, JSON.stringify(cachedSharedExpenses));
      notifySharedExpenses();
    }
  } catch (error: any) {
    handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Updating Shared Expense',
      target: `sharedExpenses/${expenseId}`,
      additionalData: expenseData,
    });
    if (!isSyncing) {
      await syncService.queueAction('UPDATE_SHARED_EXPENSE', { id: expenseId, data: expenseData });
    }
    throw error;
  }
};

/**
 * Delete Shared Expense
 */
export const deleteSharedExpense = async (expenseId: string, isSyncing = false) => {
  if (!isSyncing && !syncService.getIsOnline()) {
    cachedSharedExpenses = cachedSharedExpenses.filter(exp => exp.id !== expenseId);
    await AsyncStorage.setItem(CACHE_KEYS.SHARED_EXPENSES, JSON.stringify(cachedSharedExpenses));
    notifySharedExpenses();

    await syncService.queueAction('DELETE_SHARED_EXPENSE', { id: expenseId });
    return;
  }

  try {
    await db.collection('sharedExpenses').doc(expenseId).delete();
    recordSuccessfulWrite('sharedExpenses (delete)', expenseId);

    if (!isSyncing) {
      cachedSharedExpenses = cachedSharedExpenses.filter(exp => exp.id !== expenseId);
      await AsyncStorage.setItem(CACHE_KEYS.SHARED_EXPENSES, JSON.stringify(cachedSharedExpenses));
      notifySharedExpenses();
    }
  } catch (error: any) {
    handleAppError(error, {
      category: 'Firestore Write',
      operation: 'Deleting Shared Expense',
      target: `sharedExpenses/${expenseId}`,
    });
    if (!isSyncing) {
      await syncService.queueAction('DELETE_SHARED_EXPENSE', { id: expenseId });
    }
    throw error;
  }
};
