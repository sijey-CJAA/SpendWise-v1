import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import { auth } from '../config/firebase';
import { subscribeToSharedExpenses, addSharedExpense, SharedExpenseData } from '../services/expenseService';
import AddSharedExpenseModal from '../components/AddSharedExpenseModal';
import ViewSharedExpenseModal from '../components/ViewSharedExpenseModal';

export default function Share() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'iOwe' | 'theyOweMe'>('iOwe');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sharedExpenses, setSharedExpenses] = useState<any[]>([]);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<SharedExpenseData | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.email) {
      const unsubscribe = subscribeToSharedExpenses(user.email, (data) => {
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

  const liveSelectedExpense = selectedExpense 
    ? sharedExpenses.find(e => e.id === selectedExpense.id) || selectedExpense 
    : null;

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
        
        {/* Add Shared Expense Big Card */}
        <TouchableOpacity 
          className="bg-[#2563eb] rounded-[32px] p-6 mb-6 flex-row items-center justify-between shadow-lg"
          onPress={() => setIsModalVisible(true)}
        >
          <View className="flex-1 pr-4">
            <Text className="text-white text-[22px] font-bold mb-1">Add Shared Expense</Text>
            <Text className="text-blue-100 text-[14px]">Create a list of shared items and split the cost.</Text>
          </View>
          <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="receipt-outline" size={28} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {/* Summary Cards (Bento Style) */}
        <View className="flex-row gap-gutter-md">
          {/* I Owe */}
          <TouchableOpacity 
            className={`flex-1 bg-brand-card-bg rounded-[24px] p-container-padding justify-between shadow-sm border ${activeTab === 'iOwe' ? 'border-[#3b82f6]' : 'border-[#333333]'}`}
            activeOpacity={0.8}
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
            className={`flex-1 bg-brand-card-bg rounded-[24px] p-container-padding justify-between shadow-sm border ${activeTab === 'theyOweMe' ? 'border-[#3b82f6]' : 'border-[#333333]'}`}
            activeOpacity={0.8}
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
            activeExpenses.map((expense) => {
              const currentUserEmail = auth.currentUser?.email;
              const isUnread = currentUserEmail && !(expense.seenBy || []).includes(currentUserEmail);
              const isSeenByOther = currentUserEmail && (expense.seenBy || []).some((email: string) => email !== currentUserEmail);

              return (
                <TouchableOpacity 
                  key={expense.id} 
                  className={`bg-brand-card-bg rounded-xl p-container-padding flex-row items-center justify-between border shadow-sm mb-2 ${isUnread ? 'border-[#3b82f6]' : 'border-[#333333]'}`}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedExpense(expense);
                    setIsViewModalVisible(true);
                  }}
                >
                  <View className="flex-row items-center gap-4 flex-1 pr-2">
                    <View className="relative">
                      <View className={`w-12 h-12 rounded-full items-center justify-center ${activeTab === 'iOwe' ? 'bg-[#1e3a8a]' : 'bg-[#333333]'}`}>
                        <Ionicons name={activeTab === 'iOwe' ? "arrow-up" : "arrow-down"} size={20} color={activeTab === 'iOwe' ? "#60a5fa" : "#ffffff"} />
                      </View>
                      {isUnread && (
                        <View className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#3b82f6] rounded-full border-2 border-brand-card-bg" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className={`text-[18px] text-brand-dark ${isUnread ? 'font-black' : 'font-bold'}`} numberOfLines={1}>{expense.personEmail}</Text>
                      <Text className={`text-[12px] ${isUnread ? 'text-gray-300 font-bold' : 'text-gray-400 font-medium'}`} numberOfLines={1}>
                        {expense.description} • Due {formatDate(expense.dueDate)}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-[18px] font-bold text-brand-dark">₱{expense.amount.toLocaleString()}</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      {isSeenByOther && (
                        <Ionicons name="checkmark-done" size={14} color="#60a5fa" />
                      )}
                      <View className={`rounded-full px-2 py-0.5 ${expense.status === 'awaiting_approval' ? 'bg-[#f59e0b]' : expense.status === 'paid' ? 'bg-[#10b981]' : 'bg-[#1e3a8a]'}`}>
                        <Text className="text-[12px] font-medium text-white capitalize">
                          {expense.status === 'awaiting_approval' ? 'Waiting' : expense.status || 'pending'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* Add Shared Expense Modal */}
      <AddSharedExpenseModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveExpense}
      />

      <ViewSharedExpenseModal
        visible={isViewModalVisible}
        onClose={() => setIsViewModalVisible(false)}
        expense={liveSelectedExpense}
      />

      {/* Bottom NavBar */}
      <BottomNavBar currentRoute="share" />
    </SafeAreaView>
  );
}
