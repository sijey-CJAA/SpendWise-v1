import { useEffect, useState } from 'react';
import { db, auth, signOut } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/');
      }
    });

    const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(data);
    }, (error) => {
      console.error("Error fetching expenses: ", error);
      // Fallback: fetch without orderBy if composite index is missing
      const fallbackQ = query(collection(db, 'expenses'));
      onSnapshot(fallbackQ, (fallbackSnapshot) => {
        let fallbackData = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        fallbackData.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });
        setExpenses(fallbackData);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeData();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex justify-center items-center border border-slate-700 text-blue-500 font-bold">
            SW
          </div>
          <span className="text-xl font-bold text-white">SpendWise Admin</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Global Expenses Database</h1>
          <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 shadow-sm">
            <span className="text-sm text-slate-400 font-medium mr-2">Total Records:</span>
            <span className="font-bold text-blue-500">{expenses.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Expense Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount (₱)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No expenses found in the database.</td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">{exp.date}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs font-mono">{exp.userId}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">{exp.name || '-'}</td>
                      <td className="px-6 py-4 capitalize">
                        <span className="bg-blue-900/30 text-blue-400 px-2.5 py-1 rounded-full text-xs font-semibold">{exp.category}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{exp.paymentMethod}</td>
                      <td className="px-6 py-4 text-right font-bold text-red-400">
                        {Number(exp.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
