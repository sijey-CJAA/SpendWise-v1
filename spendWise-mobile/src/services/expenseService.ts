import { db, auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from './syncService';

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

export const addExpense = async (expenseData: ExpenseData, isSyncing = false) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be logged in to add an expense.');

  if (!isSyncing && !syncService.getIsOnline()) {
    const tempId = 'temp_' + Date.now().toString();
    const newExpense = { ...expenseData, userId: user.uid, createdAt: new Date().toISOString(), id: tempId };
    
    // Optimistic Update
    cachedExpenses.unshift(newExpense);
    await AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(cachedExpenses));
    notifyExpenses();

    await syncService.queueAction('ADD_EXPENSE', expenseData);
    return tempId;
  }

  try {
    const docRef = await db.collection('expenses').add({
      ...expenseData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    if (!isSyncing) {
      await syncService.queueAction('ADD_EXPENSE', expenseData);
      return 'temp_' + Date.now();
    }
    throw error;
  }
};

export const updateExpense = async (expenseId: string, expenseData: Partial<ExpenseData>, isSyncing = false) => {
  if (!isSyncing && !syncService.getIsOnline()) {
    // Optimistic Update
    cachedExpenses = cachedExpenses.map(exp => exp.id === expenseId ? { ...exp, ...expenseData } : exp);
    await AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(cachedExpenses));
    notifyExpenses();

    await syncService.queueAction('UPDATE_EXPENSE', { id: expenseId, data: expenseData });
    return;
  }

  try {
    await db.collection('expenses').doc(expenseId).update(expenseData);
  } catch (error) {
    if (!isSyncing) {
      await syncService.queueAction('UPDATE_EXPENSE', { id: expenseId, data: expenseData });
    } else throw error;
  }
};

export const deleteExpense = async (expenseId: string, isSyncing = false) => {
  if (!isSyncing && !syncService.getIsOnline()) {
    // Optimistic Update
    cachedExpenses = cachedExpenses.filter(exp => exp.id !== expenseId);
    await AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(cachedExpenses));
    notifyExpenses();

    await syncService.queueAction('DELETE_EXPENSE', { id: expenseId });
    return;
  }

  try {
    await db.collection('expenses').doc(expenseId).delete();
  } catch (error) {
    if (!isSyncing) {
      await syncService.queueAction('DELETE_EXPENSE', { id: expenseId });
    } else throw error;
  }
};

export const subscribeToExpenses = (userId: string, callback: (expenses: any[]) => void) => {
  expensesSubscribers.add(callback);
  
  // Initial load from cache
  AsyncStorage.getItem(CACHE_KEYS.EXPENSES).then(data => {
    if (data) {
      cachedExpenses = JSON.parse(data);
      callback([...cachedExpenses]);
    }
  });

  const unsubscribe = db.collection('expenses')
    .where('userId', '==', userId)
    .onSnapshot(
      (snapshot) => {
        let expenses = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        expenses.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });

        cachedExpenses = expenses;
        AsyncStorage.setItem(CACHE_KEYS.EXPENSES, JSON.stringify(expenses));
        notifyExpenses();
      },
      (error) => console.error("Error subscribing to expenses: ", error)
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

export const addUpcomingPayment = async (paymentData: UpcomingPaymentData, isSyncing = false) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be logged in.');

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

  try {
    const docRef = await db.collection('upcomingPayments').add({
      ...paymentData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    if (!isSyncing) {
      await syncService.queueAction('ADD_UPCOMING_PAYMENT', paymentData);
      return 'temp_' + Date.now();
    }
    throw error;
  }
};

export const subscribeToUpcomingPayments = (userId: string, callback: (payments: any[]) => void) => {
  upcomingPaymentsSubscribers.add(callback);

  AsyncStorage.getItem(CACHE_KEYS.UPCOMING_PAYMENTS).then(data => {
    if (data) {
      cachedUpcomingPayments = JSON.parse(data);
      callback([...cachedUpcomingPayments]);
    }
  });

  const unsubscribe = db.collection('upcomingPayments')
    .where('userId', '==', userId)
    .onSnapshot(
      (snapshot) => {
        let payments = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        payments.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        cachedUpcomingPayments = payments;
        AsyncStorage.setItem(CACHE_KEYS.UPCOMING_PAYMENTS, JSON.stringify(payments));
        notifyUpcomingPayments();
      },
      (error) => console.error("Error subscribing to upcoming payments: ", error)
    );

  return () => {
    unsubscribe();
    upcomingPaymentsSubscribers.delete(callback);
  };
};

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
  } catch (error) {
    if (!isSyncing) {
      await syncService.queueAction('UPDATE_UPCOMING_PAYMENT', { id: paymentId, data: paymentData });
    } else throw error;
  }
};

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
  } catch (error) {
    if (!isSyncing) {
      await syncService.queueAction('DELETE_UPCOMING_PAYMENT', { id: paymentId });
    } else throw error;
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

export const addSharedExpense = async (expenseData: SharedExpenseData, isSyncing = false) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be logged in.');

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

  try {
    const docRef = await db.collection('sharedExpenses').add({
      ...expenseData,
      userId: user.uid,
      creatorEmail: user.email,
      involvedEmails: [user.email, expenseData.personEmail.toLowerCase()],
      seenBy: [user.email],
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    if (!isSyncing) {
      await syncService.queueAction('ADD_SHARED_EXPENSE', expenseData);
      return 'temp_' + Date.now();
    }
    throw error;
  }
};

export const subscribeToSharedExpenses = (userEmail: string, callback: (expenses: any[]) => void) => {
  sharedExpensesSubscribers.add(callback);

  AsyncStorage.getItem(CACHE_KEYS.SHARED_EXPENSES).then(data => {
    if (data) {
      cachedSharedExpenses = JSON.parse(data);
      callback([...cachedSharedExpenses]);
    }
  });

  const unsubscribe = db.collection('sharedExpenses')
    .where('involvedEmails', 'array-contains', userEmail.toLowerCase())
    .onSnapshot(
      (snapshot) => {
        let expenses = snapshot.docs.map(doc => {
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
        
        expenses.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        cachedSharedExpenses = expenses;
        AsyncStorage.setItem(CACHE_KEYS.SHARED_EXPENSES, JSON.stringify(expenses));
        notifySharedExpenses();
      },
      (error) => console.error("Error subscribing to shared expenses: ", error)
    );

  return () => {
    unsubscribe();
    sharedExpensesSubscribers.delete(callback);
  };
};

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
  } catch (error) {
    if (!isSyncing) {
      await syncService.queueAction('UPDATE_SHARED_EXPENSE', { id: expenseId, data: expenseData });
    } else throw error;
  }
};

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
  } catch (error) {
    if (!isSyncing) {
      await syncService.queueAction('DELETE_SHARED_EXPENSE', { id: expenseId });
    } else throw error;
  }
};
