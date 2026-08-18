import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import { auth } from '../config/firebase';
import { subscribeToSharedExpenses, addSharedExpense, SharedExpenseData } from '../services/expenseService';
import AddSharedExpenseModal from '../components/AddSharedExpenseModal';

export default function Share() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'iOwe' | 'theyOweMe'>('iOwe');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sharedExpenses, setSharedExpenses] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = subscribeToSharedExpenses(user.uid, (data) => {
        setSharedExpenses(data);
      });
      return () => unsubscribe();
    }
  }, []);

  const handleSaveExpense = async (data: any) => {
    await addSharedExpense(data);
  };

  const iOweExpenses = sharedExpenses.filter(e => e.type === 'iOwe');
  const theyOweMeExpenses = sharedExpenses.filter(e => e.type === 'theyOweMe');

  const totalIOwe = iOweExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalTheyOweMe = theyOweMeExpenses.reduce((sum, e) => sum + e.amount, 0);

  const activeExpenses = activeTab === 'iOwe' ? iOweExpenses : theyOweMeExpenses;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-light">
      {/* Custom Header */}
      <View className="flex-row justify-between items-center px-6 pt-2 pb-4 w-full mt-2">
        <TouchableOpacity
          className="w-10 h-10 rounded-full border border-[#333333] bg-brand-card-bg justify-center items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-brand-dark">Shared Notes</Text>
        <TouchableOpacity 
          className="w-10 h-10 rounded-full border border-[#333333] bg-brand-card-bg justify-center items-center" 
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-margin-mobile py-stack-lg max-w-2xl mx-auto w-full" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Summary Cards (Bento Style) */}
        <View className="flex-row gap-gutter-md">
          {/* I Owe */}
          <TouchableOpacity 
            className={`flex-1 bg-brand-card-bg rounded-[24px] p-container-padding justify-between hover:scale-[0.98] transition-transform shadow-sm border ${activeTab === 'iOwe' ? 'border-[#3b82f6]' : 'border-[#333333]'}`}
            onPress={() => setActiveTab('iOwe')}
          >
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${activeTab === 'iOwe' ? 'bg-[#1e3a8a]' : 'bg-[#333333]'}`}>
                <Ionicons name="arrow-up" size={16} color={activeTab === 'iOwe' ? "#60a5fa" : "#9ca3af"} />
              </View>
              <Text className={`font-semibold ${activeTab === 'iOwe' ? 'text-brand-dark' : 'text-gray-400'}`}>I Owe</Text>
            </View>
            <View>
              <Text className={`text-[28px] font-bold ${activeTab === 'iOwe' ? 'text-brand-dark' : 'text-brand-dark'}`}>₱{totalIOwe.toLocaleString()}</Text>
              <Text className={`text-[12px] font-medium mt-1 ${activeTab === 'iOwe' ? 'text-gray-400' : 'text-gray-500'}`}>{iOweExpenses.length} Pending</Text>
            </View>
          </TouchableOpacity>

          {/* They Owe Me */}
          <TouchableOpacity 
            className={`flex-1 bg-brand-card-bg rounded-[24px] p-container-padding justify-between hover:scale-[0.98] transition-transform shadow-sm border ${activeTab === 'theyOweMe' ? 'border-[#3b82f6]' : 'border-[#333333]'}`}
            onPress={() => setActiveTab('theyOweMe')}
          >
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${activeTab === 'theyOweMe' ? 'bg-[#1e3a8a]' : 'bg-[#333333]'}`}>
                <Ionicons name="arrow-down" size={16} color={activeTab === 'theyOweMe' ? "#60a5fa" : "#9ca3af"} />
              </View>
              <Text className={`font-semibold ${activeTab === 'theyOweMe' ? 'text-brand-dark' : 'text-gray-400'}`}>They Owe Me</Text>
            </View>
            <View>
              <Text className={`text-[28px] font-bold ${activeTab === 'theyOweMe' ? 'text-brand-dark' : 'text-brand-dark'}`}>₱{totalTheyOweMe.toLocaleString()}</Text>
              <Text className={`text-[12px] font-medium mt-1 ${activeTab === 'theyOweMe' ? 'text-gray-400' : 'text-gray-500'}`}>{theyOweMeExpenses.length} Pending</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-[#333333] mt-8 mb-6">
          <TouchableOpacity 
            className={`flex-1 pb-3 ${activeTab === 'iOwe' ? 'border-b-2 border-[#3b82f6]' : ''}`}
            onPress={() => setActiveTab('iOwe')}
          >
            <Text className={`text-center font-semibold ${activeTab === 'iOwe' ? 'text-brand-dark' : 'text-gray-400'}`}>I Owe</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 pb-3 ${activeTab === 'theyOweMe' ? 'border-b-2 border-[#3b82f6]' : ''}`}
            onPress={() => setActiveTab('theyOweMe')}
          >
            <Text className={`text-center font-semibold ${activeTab === 'theyOweMe' ? 'text-brand-dark' : 'text-gray-400'}`}>They Owe Me</Text>
          </TouchableOpacity>
        </View>

        {/* Debt Items List */}
        <View className="gap-stack-sm">
          {activeExpenses.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-400 text-[16px]">No shared expenses here yet.</Text>
            </View>
          ) : (
            activeExpenses.map((expense) => (
              <View key={expense.id} className="bg-brand-card-bg rounded-xl p-container-padding flex-row items-center justify-between border border-[#333333] shadow-sm mb-2">
                <View className="flex-row items-center gap-4 flex-1 pr-2">
                  <View className={`w-12 h-12 rounded-full items-center justify-center ${activeTab === 'iOwe' ? 'bg-[#1e3a8a]' : 'bg-[#333333]'}`}>
                    <Ionicons name={activeTab === 'iOwe' ? "arrow-up" : "arrow-down"} size={20} color={activeTab === 'iOwe' ? "#60a5fa" : "#ffffff"} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[18px] font-bold text-brand-dark" numberOfLines={1}>{expense.personEmail}</Text>
                    <Text className="text-[12px] font-medium text-gray-400" numberOfLines={1}>
                      {expense.description} • Due {formatDate(expense.dueDate)}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-[18px] font-bold text-brand-dark">₱{expense.amount.toLocaleString()}</Text>
                  <View className="rounded-full bg-[#1e3a8a] px-2 py-0.5 mt-1">
                    <Text className="text-[12px] font-medium text-white capitalize">{expense.status || 'pending'}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Action / Request Flow hint */}
        <View className="mt-8 items-center">
          <TouchableOpacity 
            className="bg-[#2563eb] px-6 py-4 rounded-full flex-row items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md w-full justify-center"
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
            <Text className="text-white font-bold text-[16px]">Request Shared Expense</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Shared Expense Modal */}
      <AddSharedExpenseModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveExpense}
      />

      {/* Bottom NavBar */}
      <BottomNavBar currentRoute="share" />
    </SafeAreaView>
  );
}
