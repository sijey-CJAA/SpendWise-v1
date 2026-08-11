import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import TopNavBar from '../components/TopNavBar';

export default function History() {
  const router = useRouter();
  
  // Mock data for history
  const transactions = [
    { id: '1', name: 'Lunch with Maria', category: 'Food', icon: 'restaurant-outline', amount: 850, date: 'Today, 12:30 PM', colorClass: 'bg-secondary-container text-secondary' },
    { id: '2', name: 'Grab Ride', category: 'Transport', icon: 'car-outline', amount: 250, date: 'Today, 9:00 AM', colorClass: 'bg-surface-container text-on-surface' },
    { id: '3', name: 'Meralco Bill', category: 'Bills', icon: 'receipt-outline', amount: 1500, date: 'Yesterday', colorClass: 'bg-surface-container text-on-surface' },
    { id: '4', name: 'Netflix Subscription', category: 'Entertain', icon: 'film-outline', amount: 549, date: 'Aug 10', colorClass: 'bg-surface-container text-on-surface' },
    { id: '5', name: 'Pharmacy', category: 'Health', icon: 'medkit-outline', amount: 320, date: 'Aug 08', colorClass: 'bg-surface-container text-on-surface' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Navbar */}
      <TopNavBar />

      <ScrollView className="flex-1 px-margin-mobile pt-stack-md max-w-2xl mx-auto w-full" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-stack-md">
            <Text className="text-[24px] font-bold text-primary">Expense History</Text>
            <TouchableOpacity className="p-2 rounded-full bg-surface-container">
                <Ionicons name="filter-outline" size={20} color="#1c0832" />
            </TouchableOpacity>
        </View>

        <View className="gap-stack-sm mt-2">
          {transactions.map((tx) => (
            <View key={tx.id} className="bg-surface-container-lowest rounded-xl p-container-padding flex-row items-center justify-between border border-surface-variant shadow-sm mb-2">
              <View className="flex-row items-center gap-4">
                <View className={`w-12 h-12 rounded-full items-center justify-center ${tx.category === 'Food' ? 'bg-secondary-container' : 'bg-surface-container'}`}>
                  <Ionicons name={tx.icon as any} size={24} color={tx.category === 'Food' ? '#42627d' : '#1d1b1e'} />
                </View>
                <View>
                  <Text className="text-[18px] font-semibold text-primary">{tx.name}</Text>
                  <Text className="text-[12px] font-medium text-on-surface-variant mt-0.5">{tx.category} • {tx.date}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-[18px] font-bold text-error">-₱{tx.amount}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom NavBar */}
      <BottomNavBar currentRoute="home" />
    </SafeAreaView>
  );
}
