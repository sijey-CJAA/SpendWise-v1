import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MonthlySpendingsModalProps {
  visible: boolean;
  onClose: () => void;
  expenses: any[];
}

export default function MonthlySpendingsModal({ visible, onClose, expenses }: MonthlySpendingsModalProps) {
  
  const monthlyData = useMemo(() => {
    const groups: Record<string, number> = {};
    
    expenses.forEach(exp => {
      if (!exp.date) return;
      const parts = exp.date.split('T')[0].split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      
      const d = new Date(year, month, 1);
      const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups[key]) groups[key] = 0;
      groups[key] += (Number(exp.amount) || 0);
    });
    
    const result = Object.keys(groups).map(key => ({
      label: key,
      total: groups[key],
      timestamp: new Date(key).getTime()
    }));
    
    result.sort((a, b) => b.timestamp - a.timestamp);
    return result;
  }, [expenses]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-brand-light w-full h-[70%] rounded-t-[32px] border-t border-white/20 overflow-hidden" style={{ shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 20 }}>
          
          {/* Header */}
          <View className="flex-row justify-between items-center z-40 bg-brand-light px-6 pt-6 pb-4 border-b border-white/5">
            <Text className="text-[20px] text-brand-dark font-bold">Monthly Spendings</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full justify-center items-center bg-brand-card-bg border border-[#333333]">
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView className="px-6 pt-4" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {monthlyData.length === 0 ? (
              <Text className="text-gray-500 text-center mt-4">No spending data available.</Text>
            ) : (
              <View className="flex-col gap-3">
                {monthlyData.map((data, index) => (
                  <View key={index} className="bg-brand-card-bg rounded-xl p-5 border border-[#333333] flex-row items-center justify-between shadow-sm">
                    <View className="flex-row items-center gap-4">
                      <View className="w-12 h-12 bg-[#333333] rounded-full justify-center items-center">
                        <Ionicons name="calendar-outline" size={20} color="#ffffff" />
                      </View>
                      <Text className="text-[16px] font-bold text-brand-dark">{data.label}</Text>
                    </View>
                    <Text className="text-[18px] font-black text-red-400">₱{data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
