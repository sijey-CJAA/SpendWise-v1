import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';

export default function UtangManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('iOwe');

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* TopAppBar */}
      <View className="bg-surface flex-row justify-between items-center px-margin-mobile py-stack-md w-full sticky top-0 z-40">
        <View className="flex-row items-center gap-4">
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaDwZgmIMHx-SFmCtTEtL8ZJ2I41l1UNRtF7V1wflh5U0dNXa6kjMGdzEkkn5uZX3oYXtUI6hm7mYV1ViaIJ54bSokDOERZzMfYHd5Oz7BdVPgscCLDHSE4HioJ0DDosWBfxheky8Jd0cCfIL5M--BYJZuDkJN34vd0ZJy69GgWpoSE60DRuaesg1o9YTlN_QZozSU0x-hkMdo7b_HWezFNkunsSNGB6ISK47UYbb-UnzsNoY58Sr1' }}
            className="w-10 h-10 rounded-full shadow-sm"
          />
        </View>
        <Text className="text-[20px] text-primary font-extrabold tracking-tight">SpendWise</Text>
        <TouchableOpacity className="active:scale-95 transition-transform duration-150">
          <Ionicons name="notifications-outline" size={24} color="#4a454d" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-margin-mobile py-stack-lg max-w-2xl mx-auto w-full" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Summary Cards (Bento Style) */}
        <View className="flex-row gap-gutter-md">
          {/* I Owe */}
          <TouchableOpacity className="flex-1 bg-[#D9FFF4] rounded-xl p-container-padding justify-between hover:scale-[0.98] transition-transform shadow-sm">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="arrow-up-circle-outline" size={20} color="#1c0832" />
              <Text className="font-semibold text-primary">I Owe</Text>
            </View>
            <View>
              <Text className="text-[28px] font-bold text-primary">₱850</Text>
              <Text className="text-[12px] font-medium text-primary/70 mt-1">2 Pending</Text>
            </View>
          </TouchableOpacity>

          {/* They Owe Me */}
          <TouchableOpacity className="flex-1 bg-surface-container rounded-xl p-container-padding justify-between hover:scale-[0.98] transition-transform border border-outline-variant/30 shadow-sm">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="arrow-down-circle-outline" size={20} color="#41627c" />
              <Text className="font-semibold text-secondary">They Owe Me</Text>
            </View>
            <View>
              <Text className="text-[28px] font-bold text-primary">₱1,250</Text>
              <Text className="text-[12px] font-medium text-secondary/70 mt-1">4 Pending</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-outline-variant/30 mt-8 mb-6">
          <TouchableOpacity 
            className={`flex-1 pb-3 ${activeTab === 'iOwe' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('iOwe')}
          >
            <Text className={`text-center font-semibold ${activeTab === 'iOwe' ? 'text-primary' : 'text-on-surface-variant'}`}>I Owe</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 pb-3 ${activeTab === 'theyOweMe' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('theyOweMe')}
          >
            <Text className={`text-center font-semibold ${activeTab === 'theyOweMe' ? 'text-primary' : 'text-on-surface-variant'}`}>They Owe Me</Text>
          </TouchableOpacity>
        </View>

        {/* Debt Items List */}
        <View className="gap-stack-sm">
          {/* Item 1 */}
          <View className="bg-white rounded-xl p-container-padding flex-row items-center justify-between border border-surface-variant shadow-sm mb-2">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-primary-fixed/30 items-center justify-center">
                <Ionicons name="restaurant-outline" size={24} color="#1c0832" />
              </View>
              <View>
                <Text className="text-[20px] font-semibold text-primary">Juan</Text>
                <Text className="text-[12px] font-medium text-on-surface-variant">Lunch • Due Aug 12</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[20px] font-semibold text-error">₱250</Text>
              <View className="rounded-full bg-error-container px-2 py-0.5 mt-1">
                <Text className="text-[12px] font-medium text-on-error-container">Pending</Text>
              </View>
            </View>
          </View>

          {/* Item 2 */}
          <View className="bg-white rounded-xl p-container-padding flex-row items-center justify-between border border-surface-variant shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-secondary-container/50 items-center justify-center">
                <Ionicons name="car-outline" size={24} color="#41627c" />
              </View>
              <View>
                <Text className="text-[20px] font-semibold text-primary">Maria</Text>
                <Text className="text-[12px] font-medium text-on-surface-variant">Transportation • Due Aug 10</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[20px] font-semibold text-error">₱150</Text>
              <View className="rounded-full bg-tertiary-container px-2 py-0.5 mt-1">
                <Text className="text-[12px] font-medium text-on-tertiary-container">Partially Paid</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action / Request Flow hint */}
        <View className="mt-8 items-center">
          <TouchableOpacity className="bg-[#D9FFF4] px-6 py-3 rounded-full flex-row items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm">
            <Ionicons name="send-outline" size={20} color="#1c0832" />
            <Text className="text-primary font-semibold">Request Shared Expense</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom NavBar */}
      <BottomNavBar currentRoute="utang" />
    </SafeAreaView>
  );
}
