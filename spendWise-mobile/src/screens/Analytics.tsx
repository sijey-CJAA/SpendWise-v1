import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import TopNavBar from '../components/TopNavBar';

export default function Analytics() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Navbar */}
      <TopNavBar />

      <ScrollView className="flex-1 px-margin-mobile pt-stack-md max-w-2xl mx-auto w-full" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Tab Selector */}
        <View className="flex-row p-1 bg-surface-container rounded-lg mb-stack-lg shadow-sm">
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-md ${activeTab === 'analytics' ? 'bg-surface shadow-sm' : ''}`}
            onPress={() => setActiveTab('analytics')}
          >
            <Text className={`text-center font-bold text-[14px] ${activeTab === 'analytics' ? 'text-primary' : 'text-on-surface-variant'}`}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-md ${activeTab === 'budgets' ? 'bg-surface shadow-sm' : ''}`}
            onPress={() => setActiveTab('budgets')}
          >
            <Text className={`text-center font-bold text-[14px] ${activeTab === 'budgets' ? 'text-primary' : 'text-on-surface-variant'}`}>Budgets</Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Overview Card */}
        <View className="bg-surface-container-lowest p-container-padding rounded-xl border border-surface-container-high mb-stack-lg shadow-sm overflow-hidden">
          {/* Ambient Background (mocked using positioned views) */}
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary-fixed rounded-full opacity-30" />
          
          <View className="flex-row justify-between items-start mb-stack-md z-10">
            <View>
              <Text className="text-[14px] font-semibold text-on-surface-variant mb-1">Monthly Budget</Text>
              <Text className="text-[28px] font-bold text-primary">₱10,000</Text>
            </View>
            <View className="items-end">
              <Text className="text-[14px] font-semibold text-on-surface-variant mb-1">Spent</Text>
              <Text className="text-[20px] font-bold text-error">₱6,450</Text>
            </View>
          </View>

          {/* Main Progress Bar */}
          <View className="w-full h-3 bg-secondary-fixed-dim/30 rounded-full overflow-hidden mb-2 z-10 flex-row">
            <View className="h-full bg-primary" style={{ width: '64.5%' }} />
          </View>
          <View className="flex-row justify-between z-10">
            <Text className="text-[12px] font-medium text-on-surface-variant">64.5% Used</Text>
            <Text className="text-[12px] font-medium text-on-surface-variant">₱3,550 Remaining</Text>
          </View>
        </View>

        {/* Spending Breakdown */}
        <View className="bg-surface-container-lowest p-container-padding rounded-xl border border-surface-container-high mb-stack-lg shadow-sm flex-col md:flex-row items-center gap-stack-lg">
          
          <View className="relative w-48 h-48 flex-col items-center justify-center mb-4">
            {/* Horizontal Bar Chart (Mocking Donut Chart for now) */}
            <View className="w-full h-6 rounded-full flex-row overflow-hidden mb-4 border border-outline-variant/30">
              <View className="h-full bg-primary" style={{ width: '40%' }} />
              <View className="h-full bg-secondary" style={{ width: '30%' }} />
              <View className="h-full bg-tertiary-container" style={{ width: '20%' }} />
              <View className="h-full bg-outline-variant" style={{ width: '10%' }} />
            </View>
            <Text className="text-[12px] font-medium text-on-surface-variant">Total Spent</Text>
            <Text className="text-[20px] font-bold text-primary">₱6,450</Text>
          </View>

          <View className="flex-1 w-full gap-3">
            <Text className="text-[20px] font-bold text-primary mb-2">Categories</Text>
            
            {/* Legend Items */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-primary" />
                <Text className="text-[16px] text-on-surface">Food</Text>
              </View>
              <Text className="text-[14px] font-semibold text-on-surface">₱2,580</Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-secondary" />
                <Text className="text-[16px] text-on-surface">Transport</Text>
              </View>
              <Text className="text-[14px] font-semibold text-on-surface">₱1,935</Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-tertiary-container" />
                <Text className="text-[16px] text-on-surface">Utilities</Text>
              </View>
              <Text className="text-[14px] font-semibold text-on-surface">₱1,290</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-outline-variant" />
                <Text className="text-[16px] text-on-surface">Other</Text>
              </View>
              <Text className="text-[14px] font-semibold text-on-surface">₱645</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid (Bento style) */}
        <View className="flex-row gap-gutter-md">
          {/* Compare */}
          <TouchableOpacity className="flex-1 bg-surface-container-low p-container-padding rounded-xl flex-col justify-between h-32 border border-outline-variant/10 shadow-sm">
            <View className="flex-row items-center gap-1">
              <Ionicons name="trending-down-outline" size={16} color="#4a454d" />
              <Text className="text-[12px] font-medium text-on-surface-variant">vs Last Month</Text>
            </View>
            <View>
              <Text className="text-[28px] font-bold text-primary">-12%</Text>
              <Text className="text-[12px] font-medium text-tertiary mt-1">₱850 less spent</Text>
            </View>
          </TouchableOpacity>

          {/* Daily Avg */}
          <TouchableOpacity className="flex-1 bg-surface-container-low p-container-padding rounded-xl flex-col justify-between h-32 border border-outline-variant/10 shadow-sm">
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={16} color="#4a454d" />
              <Text className="text-[12px] font-medium text-on-surface-variant">Daily Avg</Text>
            </View>
            <View>
              <Text className="text-[28px] font-bold text-primary">₱430</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom NavBar */}
      <BottomNavBar currentRoute="expenses" />
    </SafeAreaView>
  );
}
