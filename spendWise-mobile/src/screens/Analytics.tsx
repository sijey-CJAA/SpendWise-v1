import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import SpreadsheetCalendar from '../components/SpreadsheetCalendar';
import FrequentPurchases from '../components/FrequentPurchases';
import { auth } from '../config/firebase';
import { subscribeToExpenses } from '../services/expenseService';
import { groupExpensesByMonth } from '../utils/dateGrouping';
import { syncService } from '../services/syncService';

export default function Analytics() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncService.processQueue();
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = subscribeToExpenses(user.uid, (data) => {
      console.log('Analytics received expenses:', data.length);
      if (data.length > 0) {
        console.log('First expense:', JSON.stringify(data[0]));
      }
      setExpenses(data);
    });

    return () => unsubscribe();
  }, []);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const targetMonth = currentDate.getMonth();
  const targetYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Memoize grouped data
  const weeksData = useMemo(() => {
    return groupExpensesByMonth(expenses, targetMonth, targetYear);
  }, [expenses, targetMonth, targetYear]);

  // Filter expenses for the current month for Frequent Purchases
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(exp => {
      let year, month;
      if (exp.date && exp.date.includes('-')) {
        const parts = exp.date.split('T')[0].split('-');
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
      } else {
        const d = new Date(exp.createdAt || exp.date);
        year = d.getFullYear();
        month = d.getMonth();
      }
      return month === targetMonth && year === targetYear;
    });
  }, [expenses, targetMonth, targetYear]);

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <View className="flex-1 w-full relative">

        {/* Custom Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4 w-full mt-2">
          <TouchableOpacity
            className="w-10 h-10 rounded-full border border-[#333333] bg-[#1e1e1e] justify-center items-center"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-[18px] font-bold text-white">Activity</Text>
          <TouchableOpacity className="w-10 h-10 rounded-full border border-[#333333] bg-[#1e1e1e] justify-center items-center">
            <Ionicons name="clipboard-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={['#3b82f6']}
            />
          }
        >
          {/* Month Selector */}
          <View className="flex-row justify-between items-center px-6 py-4 mb-2 bg-[#1e1e1e] shadow-sm">
            <TouchableOpacity onPress={goToPreviousMonth} className="p-2">
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View className="items-center">
              <Text className="text-[18px] font-bold text-white">{monthName}</Text>
              <Text className="text-[12px] text-gray-400">Spreadsheet View</Text>
            </View>

            <TouchableOpacity onPress={goToNextMonth} className="p-2">
              <Ionicons name="chevron-forward" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Spreadsheet Calendar */}
          <SpreadsheetCalendar weeks={weeksData} />

          {/* Spacer */}
          <View className="h-8" />

          {/* Frequent Purchases */}
          <FrequentPurchases expenses={currentMonthExpenses} />

          <View className="h-10" />
        </ScrollView>

        {/* Bottom NavBar */}
        <BottomNavBar currentRoute="expenses" />

      </View>
    </SafeAreaView>
  );
}
