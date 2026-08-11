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

export const subscribeToExpenses = (userId: string, callback: (expenses: any[]) => void) => {
  return db.collection('expenses')
    .where('userId', '==', userId)
    .onSnapshot(
      (snapshot) => {
        let expenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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
