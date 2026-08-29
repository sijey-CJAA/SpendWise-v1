import { db, auth } from '../config/firebase';

export interface ExpenseData {
  amount: number;
  name: string;
  category: string;
  date: string;
  paymentMethod: string;
  notes: string;
  isRecurring: boolean;
}

export const addExpense = async (expenseData: ExpenseData) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to add an expense.');
  }

  try {
    const docRef = await db.collection('expenses').add({
      ...expenseData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding expense: ", error);
    throw error;
  }
};

export const updateExpense = async (expenseId: string, expenseData: Partial<ExpenseData>) => {
  try {
    await db.collection('expenses').doc(expenseId).update(expenseData);
  } catch (error) {
    console.error("Error updating expense: ", error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string) => {
  try {
    await db.collection('expenses').doc(expenseId).delete();
  } catch (error) {
    console.error("Error deleting expense: ", error);
    throw error;
  }
};

export const subscribeToExpenses = (userId: string, callback: (expenses: any[]) => void) => {
  return db.collection('expenses')
    .where('userId', '==', userId)
    .onSnapshot(
      (snapshot) => {
        let expenses = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        
        // Sort client-side to avoid needing a Firestore composite index
        expenses.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });

        callback(expenses);
      },
      (error) => {
        console.error("Error subscribing to expenses: ", error);
      }
    );
};

export interface UpcomingPaymentData {
  amount: number;
  name: string;
  category: string;
  dueDate: string;
  notes: string;
  reminder: boolean;
}

export const addUpcomingPayment = async (paymentData: UpcomingPaymentData) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to add an upcoming payment.');
  }

  try {
    const docRef = await db.collection('upcomingPayments').add({
      ...paymentData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding upcoming payment: ", error);
    throw error;
  }
};

export const subscribeToUpcomingPayments = (userId: string, callback: (payments: any[]) => void) => {
  return db.collection('upcomingPayments')
    .where('userId', '==', userId)
    .onSnapshot(
      (snapshot) => {
        let payments = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        
        // Sort by dueDate closest to today
        payments.sort((a: any, b: any) => {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return dateA - dateB;
        });

        callback(payments);
      },
      (error) => {
        console.error("Error subscribing to upcoming payments: ", error);
      }
    );
};

export const updateUpcomingPayment = async (paymentId: string, paymentData: Partial<UpcomingPaymentData>) => {
  try {
    await db.collection('upcomingPayments').doc(paymentId).update(paymentData);
  } catch (error) {
    console.error("Error updating upcoming payment: ", error);
    throw error;
  }
};

export const deleteUpcomingPayment = async (paymentId: string) => {
  try {
    await db.collection('upcomingPayments').doc(paymentId).delete();
  } catch (error) {
    console.error("Error deleting upcoming payment: ", error);
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

export const addSharedExpense = async (expenseData: SharedExpenseData) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to add a shared expense.');
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
    console.error("Error adding shared expense: ", error);
    throw error;
  }
};

export const subscribeToSharedExpenses = (userEmail: string, callback: (expenses: any[]) => void) => {
  return db.collection('sharedExpenses')
    .where('involvedEmails', 'array-contains', userEmail.toLowerCase())
    .onSnapshot(
      (snapshot) => {
        let expenses = snapshot.docs.map(doc => {
          const data = doc.data();
          const isCreator = data.creatorEmail === userEmail;
          
          let type = data.type;
          let personEmail = data.personEmail;
          
          // If the logged in user is NOT the creator, reverse the perspective
          if (!isCreator) {
            type = data.type === 'iOwe' ? 'theyOweMe' : 'iOwe';
            personEmail = data.creatorEmail;
          }

          return {
            ...data,
            id: doc.id,
            type,
            personEmail
          };
        });
        
        // Sort by dueDate closest to today, or createdAt if needed
        expenses.sort((a: any, b: any) => {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return dateA - dateB; // Ascending by due date
        });

        callback(expenses);
      },
      (error) => {
        console.error("Error subscribing to shared expenses: ", error);
      }
    );
};

export const updateSharedExpense = async (expenseId: string, expenseData: Partial<SharedExpenseData>) => {
  try {
    await db.collection('sharedExpenses').doc(expenseId).update(expenseData);
  } catch (error) {
    console.error("Error updating shared expense: ", error);
    throw error;
  }
};

export const deleteSharedExpense = async (expenseId: string) => {
  try {
    await db.collection('sharedExpenses').doc(expenseId).delete();
  } catch (error) {
    console.error("Error deleting shared expense: ", error);
    throw error;
  }
};
