import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Modal, ActivityIndicator, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addExpense } from '../services/expenseService';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddExpenseModal({ visible, onClose }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset fields when opened
  useEffect(() => {
    if (visible) {
      setAmount('');
      setExpenseName('');
      setCategory('');
      setDate(new Date().toISOString());
      setPaymentMethod('');
      setNotes('');
      setIsRecurring(false);
      setShowDatePicker(false);
    }
  }, [visible]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate.toISOString());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const categories = [
    { id: 'food', icon: 'restaurant-outline', label: 'Food' },
    { id: 'transport', icon: 'car-outline', label: 'Transport' },
    { id: 'shopping', icon: 'bag-outline', label: 'Shopping' },
    { id: 'bills', icon: 'receipt-outline', label: 'Bills' },
    { id: 'entertainment', icon: 'film-outline', label: 'Entertain' },
    { id: 'health', icon: 'medkit-outline', label: 'Health' },
    { id: 'education', icon: 'school-outline', label: 'Education' },
    { id: 'other', icon: 'ellipsis-horizontal-outline', label: 'Other' },
  ];

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }
    if (!expenseName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this expense.');
      return;
    }
    if (!category) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }
    if (!paymentMethod) {
      Alert.alert('Missing Payment Method', 'Please select a payment method.');
      return;
    }

    setIsSaving(true);
    try {
      await addExpense({
        amount: parseFloat(amount),
        name: expenseName,
        category,
        date: date.split('T')[0],
        paymentMethod,
        notes,
        isRecurring
      });
      onClose(); // Auto close the modal on success
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        className="flex-1 justify-center items-center bg-black/60"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="bg-brand-light w-[90%] max-h-[85%] rounded-[24px] border border-white/20 overflow-hidden" style={{ shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 20 }}>
          {/* Sticky Header */}
          <View className="flex-row justify-between items-center z-40 bg-brand-light px-6 pt-6 pb-4 border-b border-white/5">
            <Text className="text-[20px] text-brand-dark font-bold">Add Expense</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full justify-center items-center bg-brand-card-bg border border-[#333333]">
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            <View className="w-full max-w-md mx-auto px-6 pt-2">

              {/* Amount Input */}
              <View className="flex flex-col items-center justify-center py-6 bg-brand-card-bg rounded-xl shadow-sm border border-[#333333] mt-4">
                <Text className="text-[14px] text-gray-400 mb-2">Total Amount</Text>
                <View className="flex-row items-center justify-center gap-2">
                  <Text className="text-[32px] text-brand-dark font-bold">₱</Text>
                  <TextInput
                    className="text-[32px] text-brand-dark font-bold text-center p-0"
                    placeholder="0.00"
                    placeholderTextColor="#7b757e"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                    style={{ minWidth: 80, outlineStyle: 'none' } as any}
                  />
                </View>
              </View>

              {/* Form Details */}
              <View className="flex flex-col gap-4 mt-6">
                
                {/* Expense Name */}
                <View className="flex flex-col">
                  <Text className="text-[14px] text-gray-400 mb-1 ml-1">Expense Name</Text>
                  <TextInput
                    className="w-full bg-brand-card-bg border border-[#333333] rounded-lg p-3 text-[16px] text-brand-dark"
                    placeholder="e.g. Lunch with Maria"
                    placeholderTextColor="#7b757e"
                    value={expenseName}
                    onChangeText={setExpenseName}
                    style={{ outlineStyle: 'none' } as any}
                  />
                </View>

                {/* Categories */}
                <View className="flex flex-col">
                  <Text className="text-[14px] text-gray-400 mb-2 ml-1">Category</Text>
                  <View className="flex-row flex-wrap justify-between">
                    {categories.map((cat, index) => (
                      <TouchableOpacity 
                        key={index} 
                        className={`w-[23%] flex-col items-center justify-center p-2 rounded-xl mb-2 ${category === cat.id ? 'bg-[#2563eb]' : 'bg-brand-card-bg border border-[#333333]'}`}
                        onPress={() => setCategory(cat.id)}
                      >
                        <Ionicons name={cat.icon as any} size={24} color={category === cat.id ? "#ffffff" : "#ffffff"} className="mb-1" />
                        <Text className={`text-[11px] mt-1 text-center ${category === cat.id ? 'text-white font-bold' : 'text-brand-dark'}`} numberOfLines={1}>{cat.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Date */}
                <View className="flex flex-col mt-2">
                  <Text className="text-[14px] text-gray-400 mb-1 ml-1">Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} className="relative bg-brand-card-bg border border-[#333333] rounded-lg flex-row items-center">
                    <View className="absolute left-3 z-10 pointer-events-none">
                        <Ionicons name="calendar-outline" size={20} color="#7b757e" />
                    </View>
                    <Text className="flex-1 py-3 pl-10 pr-3 text-[16px] text-brand-dark">
                      {formatDate(date)}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={new Date(date)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      themeVariant="dark"
                    />
                  )}
                </View>

                {/* Payment Method */}
                <View className="flex flex-col mt-2">
                  <Text className="text-[14px] text-gray-400 mb-2 ml-1">Payment Method</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 pb-2">
                    {['Cash', 'GCash', 'Maya', 'Bank', 'Card'].map((method, i) => (
                      <TouchableOpacity 
                        key={i}
                        className={`px-4 py-2 rounded-full mr-2 flex-row items-center gap-2 ${paymentMethod === method ? 'bg-[#2563eb]' : 'bg-brand-card-bg border border-[#333333]'}`}
                        onPress={() => setPaymentMethod(method)}
                      >
                        {method === 'Cash' && <Ionicons name="cash-outline" size={16} color={paymentMethod === method ? "#ffffff" : "#ffffff"} />}
                        {method === 'Bank' && <Ionicons name="business-outline" size={16} color={paymentMethod === method ? "#ffffff" : "#ffffff"} />}
                        {method === 'Card' && <Ionicons name="card-outline" size={16} color={paymentMethod === method ? "#ffffff" : "#ffffff"} />}
                        <Text className={paymentMethod === method ? "text-white font-bold" : "text-brand-dark font-semibold"}>{method}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Notes */}
                <View className="flex flex-col">
                  <Text className="text-[14px] text-gray-400 mb-1 ml-1">Notes (Optional)</Text>
                  <TextInput
                    className="w-full bg-brand-card-bg border border-[#333333] rounded-lg p-3 text-[16px] text-brand-dark"
                    placeholder="Add some details..."
                    placeholderTextColor="#7b757e"
                    multiline
                    numberOfLines={2}
                    style={{ minHeight: 60, textAlignVertical: 'top', outlineStyle: 'none' } as any}
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>

                {/* Toggles & Extras */}
                <View className="flex flex-col gap-0 mt-2 bg-brand-card-bg rounded-xl border border-[#333333] overflow-hidden">
                  <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-[#333333]">
                    <View className="flex-row items-center gap-3">
                      <Ionicons name="camera-outline" size={24} color="#7b757e" />
                      <Text className="text-[16px] text-brand-dark">Attach Receipt</Text>
                    </View>
                    <Text className="text-[#3b82f6] font-bold">Add</Text>
                  </TouchableOpacity>
                  
                  <View className="flex-row items-center justify-between p-4 border-b border-[#333333]">
                    <View className="flex-row items-center gap-3">
                      <Ionicons name="sync-outline" size={24} color="#7b757e" />
                      <Text className="text-[16px] text-brand-dark">Recurring Expense</Text>
                    </View>
                    <Switch
                      trackColor={{ false: "#333333", true: "#3b82f6" }}
                      thumbColor={isRecurring ? "#ffffff" : "#f4f3f4"}
                      onValueChange={() => setIsRecurring(!isRecurring)}
                      value={isRecurring}
                    />
                  </View>
                  
                  <TouchableOpacity className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center gap-3">
                      <Ionicons name="people-outline" size={24} color="#7b757e" />
                      <View className="flex-col">
                        <Text className="text-[16px] text-brand-dark">Split Expense</Text>
                        <Text className="text-[12px] text-gray-400">with @maria</Text>
                      </View>
                    </View>
                    <Text className="text-[#3b82f6] font-bold">Edit</Text>
                  </TouchableOpacity>
                </View>

                {/* Save Button */}
                <TouchableOpacity 
                  className={`w-full ${isSaving ? 'bg-[#1e3a8a]' : 'bg-[#2563eb]'} py-4 rounded-xl mt-6 shadow-md justify-center items-center hover:opacity-90 active:scale-95 transition-all`}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-[18px]">Save Expense</Text>
                  )}
                </TouchableOpacity>

              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
