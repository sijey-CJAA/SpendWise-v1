import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import AddUpcomingPaymentModal from '../components/AddUpcomingPaymentModal';
import AddExpenseModal from '../components/AddExpenseModal';
import SeeAllUpcomingModal from '../components/SeeAllUpcomingModal';
import SeeAllTransactionsModal from '../components/SeeAllTransactionsModal';
import OverduePaymentModal from '../components/OverduePaymentModal';
import MonthlySpendingsModal from '../components/MonthlySpendingsModal';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';
import { subscribeToExpenses, subscribeToUpcomingPayments, addUpcomingPayment, updateUpcomingPayment, deleteUpcomingPayment, addExpense } from '../services/expenseService';
import { syncService } from '../services/syncService';

export default function Dashboard() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
  const [isUpcomingModalVisible, setIsUpcomingModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [activePaymentMenuId, setActivePaymentMenuId] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  const [isSeeAllUpcomingVisible, setIsSeeAllUpcomingVisible] = useState(false);
  const [isSeeAllTransactionsVisible, setIsSeeAllTransactionsVisible] = useState(false);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentOverduePayment, setCurrentOverduePayment] = useState<any>(null);
  const [isMonthlySpendingsModalVisible, setIsMonthlySpendingsModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncService.processQueue();
    // In case processQueue is too fast, add a small delay for UX
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const unsubscribeExpenses = subscribeToExpenses(user.uid, (data) => {
      setExpenses(data);
      setIsLoading(false);
    });

    const unsubscribeUpcoming = subscribeToUpcomingPayments(user.uid, (data) => {
      setUpcomingPayments(data);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeUpcoming();
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    
    const overdue = upcomingPayments.find(payment => {
      const dueDate = new Date(payment.dueDate);
      if (dueDate >= now) return false;
      
      if (payment.lastPromptedAt) {
        const lastPrompted = new Date(payment.lastPromptedAt);
        const hoursSincePrompt = (now.getTime() - lastPrompted.getTime()) / (1000 * 60 * 60);
        if (hoursSincePrompt < 24) return false;
      }
      
      return true;
    });

    if (overdue && !currentOverduePayment) {
      setCurrentOverduePayment(overdue);
    }
  }, [upcomingPayments, currentOverduePayment]);

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });
  const currentMonthYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  const currentMonthBalance = expenses.reduce((sum, exp) => {
    if (!exp.date) return sum;
    const parts = exp.date.split('T')[0].split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    if (year === currentMonthYear && month === currentMonthIndex) {
      return sum + (Number(exp.amount) || 0);
    }
    return sum;
  }, 0);

  const recentTransactions = expenses.slice(0, 5);

  const userName = auth.currentUser?.email?.split('@')[0] || 'User';

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleSaveUpcomingPayment = async (paymentData: any) => {
    try {
      if (editingPayment) {
        await updateUpcomingPayment(editingPayment.id, paymentData);
      } else {
        await addUpcomingPayment(paymentData);
      }
      setEditingPayment(null);
    } catch (error) {
      console.error("Failed to save upcoming payment", error);
    }
  };

  const handleOverduePaid = async (payment: any) => {
    try {
      const getLocalDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      await addExpense({
        amount: Number(payment.amount),
        name: payment.name,
        category: payment.category,
        date: getLocalDateString(new Date()),
        paymentMethod: 'Cash',
        notes: payment.notes || 'Paid from Upcoming Payments',
        isRecurring: false
      });
      
      await deleteUpcomingPayment(payment.id);
      setCurrentOverduePayment(null);
    } catch (error) {
      console.error("Failed to mark overdue payment as paid", error);
    }
  };

  const handleOverdueSnooze = async (payment: any) => {
    try {
      await updateUpcomingPayment(payment.id, {
        lastPromptedAt: new Date().toISOString()
      });
      setCurrentOverduePayment(null);
    } catch (error) {
      console.error("Failed to snooze overdue payment", error);
      setCurrentOverduePayment(null);
    }
  };

  const handleOptionsPress = (payment: any) => {
    setActivePaymentMenuId(prev => prev === payment.id ? null : payment.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-light">
      <View className="flex-1 w-full relative">

        {/* Custom Top Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4 w-full mt-2">
          <View className="flex-row items-center">
            <Text className="text-[28px] font-black tracking-tight" style={{ color: '#3b82f6' }}>Spend</Text>
            <Text className="text-[28px] font-black tracking-tight text-brand-dark">Wise</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 rounded-full border border-[#333333] bg-brand-card-bg justify-center items-center">
              <Ionicons name="search-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full border border-[#333333] bg-brand-card-bg justify-center items-center relative">
              <Ionicons name="notifications-outline" size={20} color="#ffffff" />
              {/* Notification Badge */}
              <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-brand-card-bg" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
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
          {/* Current Balance Card */}
          <LinearGradient
            colors={['#1e3a8a', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 mb-6 shadow-sm relative"
            style={{ borderRadius: 15 }}
          >
            <TouchableOpacity 
              className="absolute top-4 right-4 bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1 z-10"
              onPress={() => setIsMonthlySpendingsModalVisible(true)}
            >
              <Text className="text-white text-[12px] font-bold">View Spendings</Text>
              <Ionicons name="chevron-forward" size={14} color="#ffffff" />
            </TouchableOpacity>

            <View className="flex-row justify-between items-center mt-2">
              <View>
                <Text className="text-white/70 text-[14px] font-medium mb-1">Total Spendings for {currentMonthName}</Text>
                <Text className="text-white text-[32px] font-bold">₱{currentMonthBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Upcoming payment */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[18px] font-bold text-brand-dark">Upcoming payment</Text>
            <TouchableOpacity onPress={() => setIsSeeAllUpcomingVisible(true)}>
              <Text className="text-[14px] text-gray-400 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8" style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
            {/* Add Payment Plus Card */}
            <TouchableOpacity
              className="bg-brand-card-bg border border-dashed border-[#333333] rounded-[24px] p-5 mr-4 w-[160px] h-[160px] justify-center items-center"
              onPress={() => {
                setEditingPayment(null);
                setIsUpcomingModalVisible(true);
              }}
            >
              <View className="w-12 h-12 bg-[#333333] rounded-full justify-center items-center mb-3">
                <Ionicons name="add" size={28} color="#ffffff" />
              </View>
              <Text className="text-white/70 font-medium text-[14px] text-center">Add Upcoming{'\n'}Payment</Text>
            </TouchableOpacity>

            {/* Dynamic Upcoming Payment Cards */}
            {upcomingPayments.map((payment) => (
              <View key={payment.id} className="bg-brand-card-bg rounded-[24px] p-5 mr-4 w-[160px] h-[160px] border border-[#333333] shadow-sm relative">
                <View className="flex-row justify-between items-start mb-6">
                  <View className="w-10 h-10 bg-[#333333] rounded-full justify-center items-center">
                    <Ionicons name={getCategoryIcon(payment.category) as any} size={20} color="#ffffff" />
                  </View>
                  <TouchableOpacity onPress={() => handleOptionsPress(payment)} className="p-1">
                    <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <Text className="text-brand-dark font-bold text-[16px] mb-1" numberOfLines={1}>{payment.name}</Text>
                <Text className="text-brand-dark font-bold text-[14px]">₱{Number(payment.amount).toFixed(2)}</Text>
                <Text className="text-gray-400 text-[12px] mt-2">Due: {formatDate(payment.dueDate)}</Text>

                {/* Inline Dropdown */}
                {activePaymentMenuId === payment.id && (
                  <View className="absolute top-12 right-2 bg-[#2a2a2a] rounded-xl border border-[#444] shadow-lg z-50 overflow-hidden w-28">
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-[#444]"
                      onPress={() => {
                        setActivePaymentMenuId(null);
                        setEditingPayment(payment);
                        setIsUpcomingModalVisible(true);
                      }}
                    >
                      <Text className="text-white text-[14px]">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-4 py-3"
                      onPress={() => {
                        setActivePaymentMenuId(null);
                        setPaymentToDelete(payment);
                      }}
                    >
                      <Text className="text-red-400 text-[14px]">Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Recent Transections */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[18px] font-bold text-brand-dark">Recent Transections</Text>
            <TouchableOpacity onPress={() => setIsSeeAllTransactionsVisible(true)}>
              <Text className="text-[14px] text-gray-400 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-4">
            {isLoading ? (
              <ActivityIndicator size="large" color="#683df7" style={{ marginTop: 20 }} />
            ) : recentTransactions.length === 0 ? (
              <Text className="text-gray-500 text-center mt-4">No transactions yet.</Text>
            ) : (
              recentTransactions.map((exp) => (
                <View key={exp.id} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 bg-brand-card-bg rounded-full justify-center items-center border border-[#333333]">
                      <Ionicons name={getCategoryIcon(exp.category) as any} size={20} color="#ffffff" />
                    </View>
                    <View>
                      <Text className="text-[16px] font-bold text-brand-dark">{exp.name || exp.category}</Text>
                      <Text className="text-[12px] text-gray-400 mt-1">{exp.date}</Text>
                    </View>
                  </View>
                  <Text className="text-[16px] font-bold text-red-400">-₱{Number(exp.amount).toFixed(2)}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Bottom NavBar */}
        <BottomNavBar currentRoute="home" />

      </View>

      <AddUpcomingPaymentModal
        visible={isUpcomingModalVisible}
        onClose={() => {
          setIsUpcomingModalVisible(false);
          setEditingPayment(null);
        }}
        onSave={handleSaveUpcomingPayment}
        initialData={editingPayment}
      />

      {/* Delete Confirmation Modal */}
      <Modal visible={!!paymentToDelete} transparent={true} animationType="fade" onRequestClose={() => setPaymentToDelete(null)}>
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-brand-card-bg w-full max-w-sm rounded-[24px] border border-white/20 p-6 items-center shadow-lg">
            <View className="w-16 h-16 rounded-full bg-red-500/20 justify-center items-center mb-4">
              <Ionicons name="trash-outline" size={32} color="#f87171" />
            </View>
            <Text className="text-[20px] text-white font-bold mb-2 text-center">Delete Payment?</Text>
            <Text className="text-[14px] text-gray-400 text-center mb-6">
              Are you sure you want to delete {paymentToDelete?.name}? This action cannot be undone.
            </Text>
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border border-[#444] justify-center items-center"
                onPress={() => setPaymentToDelete(null)}
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-red-500 justify-center items-center"
                onPress={() => {
                  if (paymentToDelete) {
                    deleteUpcomingPayment(paymentToDelete.id);
                    setPaymentToDelete(null);
                  }
                }}
              >
                <Text className="text-white font-bold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SeeAllUpcomingModal 
        visible={isSeeAllUpcomingVisible}
        onClose={() => setIsSeeAllUpcomingVisible(false)}
        payments={upcomingPayments}
        onEdit={(payment) => {
          setIsSeeAllUpcomingVisible(false);
          setEditingPayment(payment);
          setIsUpcomingModalVisible(true);
        }}
      />

      <SeeAllTransactionsModal
        visible={isSeeAllTransactionsVisible}
        onClose={() => setIsSeeAllTransactionsVisible(false)}
        transactions={expenses}
        onEdit={(expense) => {
          setIsSeeAllTransactionsVisible(false);
          setEditingExpense(expense);
          setIsExpenseModalVisible(true);
        }}
      />

      <AddExpenseModal
        visible={isExpenseModalVisible}
        onClose={() => {
          setIsExpenseModalVisible(false);
          setEditingExpense(null);
        }}
        initialData={editingExpense}
      />

      <OverduePaymentModal
        visible={!!currentOverduePayment}
        payment={currentOverduePayment}
        onPaid={handleOverduePaid}
        onSnooze={handleOverdueSnooze}
      />

      <MonthlySpendingsModal
        visible={isMonthlySpendingsModalVisible}
        onClose={() => setIsMonthlySpendingsModalVisible(false)}
        expenses={expenses}
      />

    </SafeAreaView>
  );
}
