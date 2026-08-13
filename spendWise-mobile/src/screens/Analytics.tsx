import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';
import { subscribeToExpenses } from '../services/expenseService';

export default function Analytics() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balance, setBalance] = useState(10000); // Mock initial budget/balance

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = subscribeToExpenses(user.uid, (data) => {
      setExpenses(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let totalSpent = 0;
    expenses.forEach(exp => {
      totalSpent += (Number(exp.amount) || 0);
    });
    setBalance(totalSpent);
  }, [expenses]);

  return (
    <SafeAreaView className="flex-1 bg-brand-light">
      <View className="flex-1 w-full relative">

        {/* Custom Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4 w-full">
          <TouchableOpacity
            className="w-10 h-10 rounded-full border border-[#333333] bg-brand-card-bg justify-center items-center"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-[18px] font-bold text-brand-dark">Activity</Text>
          <TouchableOpacity className="w-10 h-10 rounded-full border border-[#333333] bg-brand-card-bg justify-center items-center">
            <Ionicons name="clipboard-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card with Chart */}
          <LinearGradient
            colors={['#1e3a8a', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 mb-8 shadow-sm"
            style={{ borderRadius: 15 }}
          >
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-white/70 text-[14px] font-medium mb-1">Total Spendings</Text>
                <Text className="text-white text-[32px] font-bold">₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <TouchableOpacity className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm">
                <Text className="text-white font-medium text-[12px]">Month</Text>
                <Ionicons name="chevron-down" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Mock Donut Chart */}
            <View className="items-center justify-center py-4">
              <View className="w-[200px] h-[200px] rounded-full border-[32px] border-[#997df3] justify-center items-center relative">
                {/* Simulated segments using absolute positioning borders */}
                <View className="absolute top-[-32px] left-[-32px] w-[200px] h-[200px] rounded-full border-[32px] border-white border-t-transparent border-r-transparent border-b-transparent transform rotate-45" />
                <View className="absolute top-[-32px] left-[-32px] w-[200px] h-[200px] rounded-full border-[32px] border-[#4a24c2] border-l-transparent border-r-transparent border-b-transparent transform -rotate-12" />
                <View className="absolute top-[-32px] left-[-32px] w-[200px] h-[200px] rounded-full border-[32px] border-[#1e1e1e] border-t-transparent border-r-transparent border-b-transparent transform -rotate-90" />

                {/* Center Content */}
                <View className="items-center justify-center bg-transparent z-10">
                  <Text className="text-white text-[24px] font-bold">₱{balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
                  <Text className="text-white/70 text-[12px] font-medium mt-1">Total Spent</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Menu */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[18px] font-bold text-brand-dark">Quick Menu</Text>
            <TouchableOpacity>
              <Text className="text-[14px] text-gray-400 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-8 gap-4">
            {/* Top up wallet */}
            <LinearGradient
              colors={['#1e1e1e', '#1e3a8a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-4 shadow-sm border border-[#333333]"
              style={{ borderRadius: 24 }}
            >
              <View className="w-12 h-12 bg-[#333333] rounded-full justify-center items-center mb-6 shadow-sm">
                <Ionicons name="wallet" size={24} color="#ffffff" />
              </View>
              <Text className="text-brand-dark font-bold text-[16px] leading-5">Top up wallet money</Text>
            </LinearGradient>

            {/* Create budget */}
            <LinearGradient
              colors={['#1e1e1e', '#1e3a8a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 rounded-[24px] p-4 shadow-sm border border-[#333333]"
            >
              <View className="w-12 h-12 bg-[#333333] rounded-full justify-center items-center mb-6 shadow-sm">
                <Ionicons name="pie-chart" size={24} color="#ffffff" />
              </View>
              <Text className="text-brand-dark font-bold text-[16px] leading-5">Create wallet budget</Text>
            </LinearGradient>
          </View>

          {/* Payment History */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[18px] font-bold text-brand-dark">Payment History</Text>
            <TouchableOpacity>
              <Text className="text-[14px] text-gray-400 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="h-10" />

        </ScrollView>

        {/* Bottom NavBar */}
        <BottomNavBar currentRoute="expenses" />

      </View>
    </SafeAreaView>
  );
}
