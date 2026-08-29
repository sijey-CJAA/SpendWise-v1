import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseData } from '../services/expenseService';

interface FrequentPurchasesProps {
  expenses: ExpenseData[];
}

export default function FrequentPurchases({ expenses }: FrequentPurchasesProps) {
  // Calculate frequencies
  const frequencies: Record<string, { count: number, totalAmount: number, category: string }> = {};

  expenses.forEach(exp => {
    const name = exp.name.trim();
    if (!frequencies[name]) {
      frequencies[name] = { count: 0, totalAmount: 0, category: exp.category };
    }
    frequencies[name].count += 1;
    frequencies[name].totalAmount += (Number(exp.amount) || 0);
  });

  // Sort by count descending
  const sortedPurchases = Object.entries(frequencies)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5); // top 5

  if (sortedPurchases.length === 0) {
    return null;
  }

  return (
    <View className="px-6 pb-24">
      <View className="flex-row items-center mb-4">
        <Ionicons name="cart" size={24} color="#ffffff" />
        <Text className="text-[18px] font-bold text-white ml-2">Frequent Purchases</Text>
      </View>
      
      <View className="bg-[#1e1e1e] rounded-xl p-4 shadow-sm border border-[#333333]">
        {sortedPurchases.map(([name, data], index) => (
          <View key={name} className={`flex-row justify-between items-center py-3 ${index < sortedPurchases.length - 1 ? 'border-b border-[#333333]' : ''}`}>
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-[#3b82f6]/10 items-center justify-center mr-3">
                <Text className="text-[#3b82f6] font-bold">{data.count}x</Text>
              </View>
              <View>
                <Text className="text-[16px] font-semibold text-white">{name}</Text>
                <Text className="text-[12px] text-gray-400">Bought {data.count} times this month</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[14px] font-bold text-red-400">₱{data.totalAmount.toLocaleString('en-US')}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
