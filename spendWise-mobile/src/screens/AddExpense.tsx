import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddExpense() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const categories = [
    { id: 'food', icon: 'restaurant-outline', label: 'Food', colorClass: 'bg-secondary-container text-on-secondary-container' },
    { id: 'transport', icon: 'car-outline', label: 'Transport', colorClass: 'bg-surface-container text-on-surface' },
    { id: 'shopping', icon: 'bag-outline', label: 'Shopping', colorClass: 'bg-surface-container text-on-surface' },
    { id: 'bills', icon: 'receipt-outline', label: 'Bills', colorClass: 'bg-surface-container text-on-surface' },
    { id: 'entertainment', icon: 'film-outline', label: 'Entertain', colorClass: 'bg-surface-container text-on-surface' },
    { id: 'health', icon: 'medkit-outline', label: 'Health', colorClass: 'bg-surface-container text-on-surface' },
    { id: 'education', icon: 'school-outline', label: 'Education', colorClass: 'bg-surface-container text-on-surface' },
    { id: 'other', icon: 'ellipsis-horizontal-outline', label: 'Other', colorClass: 'bg-surface-container text-on-surface' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View className="w-full max-w-md mx-auto px-margin-mobile">
            {/* Header */}
            <View className="flex-row justify-between items-center py-stack-md z-40 bg-surface">
              <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full justify-center items-center hover:bg-surface-variant">
                  <Ionicons name="close" size={24} color="#1c0832" />
                </TouchableOpacity>
                <Text className="text-headline-md-mobile text-primary font-bold">Add Expense</Text>
              </View>
              <TouchableOpacity className="p-2 rounded-full flex items-center hover:bg-surface-variant">
                <Ionicons name="save-outline" size={24} color="#1c0832" />
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View className="flex flex-col items-center justify-center py-stack-lg bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant mt-stack-md">
              <Text className="text-label-md text-on-surface-variant mb-2">Total Amount</Text>
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-headline-xl-mobile text-on-surface">₱</Text>
                <TextInput
                  className="text-headline-xl-mobile text-on-surface text-center p-0"
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
            <View className="flex flex-col gap-stack-md mt-stack-md">
              {/* Expense Name */}
              <View className="flex flex-col">
                <Text className="text-label-sm text-on-surface-variant mb-1 ml-1">Expense Name</Text>
                <TextInput
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 text-body-md text-on-surface"
                  placeholder="e.g. Lunch with Maria"
                  placeholderTextColor="#7b757e"
                  value={expenseName}
                  onChangeText={setExpenseName}
                  style={{ outlineStyle: 'none' } as any}
                />
              </View>

              {/* Categories */}
              <View className="flex flex-col">
                <Text className="text-label-sm text-on-surface-variant mb-2 ml-1">Category</Text>
                <View className="flex-row flex-wrap justify-between">
                  {categories.map((cat, index) => (
                    <TouchableOpacity 
                      key={index} 
                      className={`w-[23%] flex-col items-center justify-center p-2 rounded-xl mb-2 ${category === cat.id ? 'bg-secondary-container' : 'bg-surface-container'} border border-transparent hover:border-outline-variant`}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Ionicons name={cat.icon as any} size={24} color={category === cat.id ? "#42627d" : "#1d1b1e"} className="mb-1" />
                      <Text className={`text-[11px] mt-1 ${category === cat.id ? 'text-on-secondary-container font-bold' : 'text-on-surface'}`}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date & Time */}
              <View className="flex-row gap-4">
                <View className="flex flex-col flex-1">
                  <Text className="text-label-sm text-on-surface-variant mb-1 ml-1">Date</Text>
                  <View className="relative bg-surface-container-low rounded-lg flex-row items-center">
                    <View className="absolute left-3 z-10 pointer-events-none">
                        <Ionicons name="calendar-outline" size={20} color="#7b757e" />
                    </View>
                    <TextInput
                      className="flex-1 py-3 pl-10 pr-3 text-body-md text-on-surface"
                      placeholder="YYYY-MM-DD"
                      value={date}
                      onChangeText={setDate}
                      style={{ outlineStyle: 'none' } as any}
                    />
                  </View>
                </View>
                <View className="flex flex-col flex-1">
                  <Text className="text-label-sm text-on-surface-variant mb-1 ml-1">Time</Text>
                  <View className="relative bg-surface-container-low rounded-lg flex-row items-center">
                    <View className="absolute left-3 z-10 pointer-events-none">
                        <Ionicons name="time-outline" size={20} color="#7b757e" />
                    </View>
                    <TextInput
                      className="flex-1 py-3 pl-10 pr-3 text-body-md text-on-surface"
                      placeholder="HH:MM"
                      value={time}
                      onChangeText={setTime}
                      style={{ outlineStyle: 'none' } as any}
                    />
                  </View>
                </View>
              </View>

              {/* Payment Method */}
              <View className="flex flex-col">
                <Text className="text-label-sm text-on-surface-variant mb-2 ml-1">Payment Method</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 pb-2">
                  {['Cash', 'GCash', 'Maya', 'Bank', 'Card'].map((method, i) => (
                    <TouchableOpacity 
                      key={i}
                      className={`px-4 py-2 rounded-full mr-2 flex-row items-center gap-2 ${paymentMethod === method ? 'bg-primary-container' : 'bg-surface-container border border-outline-variant'}`}
                      onPress={() => setPaymentMethod(method)}
                    >
                      {method === 'Cash' && <Ionicons name="cash-outline" size={16} color={paymentMethod === method ? "#ffffff" : "#1d1b1e"} />}
                      {method === 'Bank' && <Ionicons name="business-outline" size={16} color={paymentMethod === method ? "#ffffff" : "#1d1b1e"} />}
                      {method === 'Card' && <Ionicons name="card-outline" size={16} color={paymentMethod === method ? "#ffffff" : "#1d1b1e"} />}
                      <Text className={paymentMethod === method ? "text-on-primary-container font-bold" : "text-on-surface font-semibold"}>{method}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Notes */}
              <View className="flex flex-col">
                <Text className="text-label-sm text-on-surface-variant mb-1 ml-1">Notes (Optional)</Text>
                <TextInput
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 text-body-md text-on-surface"
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
              <View className="flex flex-col gap-3 mt-2 bg-surface-container-lowest p-4 rounded-xl border border-surface-variant">
                <TouchableOpacity className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="camera-outline" size={24} color="#7b757e" />
                    <Text className="text-body-md text-on-surface">Attach Receipt</Text>
                  </View>
                  <Text className="text-primary font-bold">Add</Text>
                </TouchableOpacity>
                <View className="h-[1px] bg-surface-variant my-1" />
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="sync-outline" size={24} color="#7b757e" />
                    <Text className="text-body-md text-on-surface">Recurring Expense</Text>
                  </View>
                  <TouchableOpacity 
                    className={`w-11 h-6 rounded-full flex-row items-center px-0.5 ${isRecurring ? 'bg-primary-container justify-end' : 'bg-surface-variant justify-start'}`}
                    onPress={() => setIsRecurring(!isRecurring)}
                  >
                    <View className={`w-5 h-5 rounded-full bg-white`} />
                  </TouchableOpacity>
                </View>
                <View className="h-[1px] bg-surface-variant my-1" />
                <TouchableOpacity className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="people-outline" size={24} color="#7b757e" />
                    <View className="flex-col">
                      <Text className="text-body-md text-on-surface">Split Expense</Text>
                      <Text className="text-[12px] text-on-surface-variant">with @maria</Text>
                    </View>
                  </View>
                  <Text className="text-primary font-bold">Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <TouchableOpacity className="w-full bg-primary-container py-4 rounded-xl mt-4 shadow-md justify-center items-center hover:opacity-90 active:scale-95 transition-all">
                <Text className="text-on-primary-container font-bold text-[18px]">Save Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
