import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseData, deleteExpense } from '../services/expenseService';

interface SeeAllTransactionsModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: any[];
  onEdit: (expense: any) => void;
}

export default function SeeAllTransactionsModal({ visible, onClose, transactions, onEdit }: SeeAllTransactionsModalProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'food': return 'restaurant-outline';
      case 'transport': return 'car-outline';
      case 'shopping': return 'bag-outline';
      case 'bills': return 'receipt-outline';
      case 'entertainment': return 'film-outline';
      case 'health': return 'medkit-outline';
      case 'education': return 'school-outline';
      case 'subscription': return 'film-outline';
      default: return 'cart-outline';
    }
  };

  const handleOptionsPress = (id: string) => {
    setActiveMenuId(prev => prev === id ? null : id);
  };

  const handleDelete = (id: string, name: string) => {
    setActiveMenuId(null);
    Alert.alert(
      "Delete Expense",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(id);
            } catch (error) {
              Alert.alert("Error", "Could not delete expense.");
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/60">
        <View className="bg-brand-light w-[90%] max-h-[85%] rounded-[24px] border border-white/20 overflow-hidden" style={{ shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 20 }}>
          
          {/* Header */}
          <View className="flex-row justify-between items-center z-40 bg-brand-light px-6 pt-6 pb-4 border-b border-white/5">
            <Text className="text-[20px] text-brand-dark font-bold">All Transactions</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full justify-center items-center bg-brand-card-bg border border-[#333333]">
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView className="px-6 pt-4" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {transactions.length === 0 ? (
              <Text className="text-gray-500 text-center mt-4">No transactions yet.</Text>
            ) : (
              transactions.map((exp) => (
                <View key={exp.id} className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-4 flex-1 pr-2">
                    <View className="w-12 h-12 bg-brand-card-bg rounded-full justify-center items-center border border-[#333333]">
                      <Ionicons name={getCategoryIcon(exp.category) as any} size={20} color="#ffffff" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[16px] font-bold text-brand-dark" numberOfLines={1}>{exp.name || exp.category}</Text>
                      <Text className="text-[12px] text-gray-400 mt-1">{exp.date}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[16px] font-bold text-red-400">-₱{Number(exp.amount).toFixed(2)}</Text>
                    
                    <TouchableOpacity onPress={() => handleOptionsPress(exp.id)} className="p-2 ml-1">
                      <Ionicons name="ellipsis-vertical" size={20} color="#7b757e" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      {/* Options Modal (Action Sheet) */}
      <Modal visible={!!activeMenuId} transparent={true} animationType="fade" onRequestClose={() => setActiveMenuId(null)}>
        <TouchableOpacity 
          className="flex-1 justify-center items-center bg-black/40 px-6" 
          activeOpacity={1} 
          onPress={() => setActiveMenuId(null)}
        >
          {transactions.filter(t => t.id === activeMenuId).map(exp => (
            <TouchableOpacity 
              key={exp.id}
              activeOpacity={1}
              className="bg-brand-card-bg w-full max-w-[250px] rounded-2xl border border-[#444] shadow-lg overflow-hidden"
            >
              <View className="px-4 py-3 border-b border-[#444] bg-[#2a2a2a]">
                <Text className="text-white text-center font-bold" numberOfLines={1}>{exp.name || exp.category}</Text>
              </View>
              <TouchableOpacity
                className="px-4 py-4 border-b border-[#444] flex-row items-center justify-center gap-2"
                onPress={() => {
                  setActiveMenuId(null);
                  onEdit(exp);
                }}
              >
                <Ionicons name="pencil" size={18} color="#ffffff" />
                <Text className="text-white text-[16px] font-medium">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-4 flex-row items-center justify-center gap-2"
                onPress={() => handleDelete(exp.id, exp.name || exp.category)}
              >
                <Ionicons name="trash" size={18} color="#f87171" />
                <Text className="text-red-400 text-[16px] font-medium">Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}
