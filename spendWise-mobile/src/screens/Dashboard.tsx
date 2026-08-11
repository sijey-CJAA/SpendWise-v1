import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import TopNavBar from '../components/TopNavBar';
import { auth } from '../config/firebase';
import { subscribeToExpenses } from '../services/expenseService';

export default function Dashboard() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({ today: 0, week: 0, month: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToExpenses(user.uid, (data) => {
      setExpenses(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (expenses.length === 0) {
      setTotals({ today: 0, week: 0, month: 0 });
      setRecentTransactions([]);
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Get start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;

    expenses.forEach(exp => {
      // Parse dates properly in local time since exp.date is YYYY-MM-DD
      const [year, month, day] = exp.date.split('-').map(Number);
      const expDate = new Date(year, month - 1, day);
      const amount = Number(exp.amount) || 0;

      if (exp.date === todayStr) {
        todayTotal += amount;
      }
      if (expDate >= startOfWeek) {
        weekTotal += amount;
      }
      if (expDate >= startOfMonth) {
        monthTotal += amount;
      }
    });

    setTotals({ today: todayTotal, week: weekTotal, month: monthTotal });
    setRecentTransactions(expenses.slice(0, 5));
  }, [expenses]);

  const userName = auth.currentUser?.email?.split('@')[0] || 'User';

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'food': return 'restaurant-outline';
      case 'transport': return 'car-outline';
      case 'shopping': return 'bag-outline';
      case 'bills': return 'receipt-outline';
      case 'entertainment': return 'film-outline';
      case 'health': return 'medkit-outline';
      case 'education': return 'school-outline';
      default: return 'cart-outline';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 w-full bg-background relative">
        
        {/* Top Navbar */}
        <TopNavBar />

        <ScrollView 
          className="flex-1 bg-background" 
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }} 
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-blue-900 rounded-[24px] p-6 mb-8 shadow-lg shadow-blue-900/15 elevation-lg">
            <Text className="text-2xl font-bold text-white mb-8 capitalize">Welcome, {userName} 👋</Text>
            
            <Text className="text-blue-300 text-[13px] font-semibold mb-3 uppercase tracking-wide">Total Spendings</Text>
            
            <View className="flex-row justify-between bg-white/10 rounded-2xl p-4">
              <View className="items-center flex-1">
                <Text className="text-blue-200 text-xs mb-1 font-medium">Today</Text>
                <Text className="text-white text-base font-bold">₱{totals.today.toFixed(2)}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-blue-200 text-xs mb-1 font-medium">This Week</Text>
                <Text className="text-white text-base font-bold">₱{totals.week.toFixed(2)}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-blue-200 text-xs mb-1 font-medium">This Month</Text>
                <Text className="text-white text-base font-bold">₱{totals.month.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Recent Transactions Grid */}
          <Text className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</Text>
          <View className="flex-col">
            {isLoading ? (
              <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
            ) : recentTransactions.length === 0 ? (
              <Text className="text-gray-500 text-center mt-4">No transactions yet.</Text>
            ) : (
              recentTransactions.map((exp) => (
                <View key={exp.id} className="w-full mb-4">
                  <View className="bg-white rounded-2xl p-4 shadow-sm elevation-sm flex-row items-center border border-gray-100">
                    <View className="w-12 h-12 rounded-full bg-blue-50 justify-center items-center mr-4">
                      <Ionicons name={getCategoryIcon(exp.category) as any} size={24} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-800">{exp.name || exp.category}</Text>
                      <Text className="text-xs text-gray-500 mt-0.5">{exp.date}</Text>
                    </View>
                    <Text className="text-base font-bold text-gray-800">-₱{Number(exp.amount).toFixed(2)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Bottom NavBar */}
        <BottomNavBar currentRoute="home" />

      </View>
    </SafeAreaView>
  );
}
