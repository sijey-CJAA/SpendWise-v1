import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddUpcomingPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (paymentData: any) => void;
  initialData?: any;
}

export default function AddUpcomingPaymentModal({ visible, onClose, onSave, initialData }: AddUpcomingPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentName, setPaymentName] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState(false);
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate.toISOString());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  // Reset or initialize fields when opened
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setAmount(initialData.amount ? initialData.amount.toString() : '');
        setPaymentName(initialData.name || '');
        setCategory(initialData.category || '');
        setDueDate(initialData.dueDate || new Date().toISOString());
        setNotes(initialData.notes || '');
        setReminder(initialData.reminder || false);
      } else {
        setAmount('');
        setPaymentName('');
        setCategory('');
        setDueDate(new Date().toISOString());
        setNotes('');
        setReminder(false);
      }
      setShowDatePicker(false);
    }
  }, [visible, initialData]);

  const categories = [
    { id: 'bills', icon: 'receipt-outline', label: 'Bills' },
    { id: 'education', icon: 'school-outline', label: 'Education' },
    { id: 'subscription', icon: 'film-outline', label: 'Subscription' },
    { id: 'transport', icon: 'car-outline', label: 'Transport' },
    { id: 'health', icon: 'medkit-outline', label: 'Health' },
    { id: 'other', icon: 'ellipsis-horizontal-outline', label: 'Other' },
  ];

  const handleSave = () => {
    if (!amount || isNaN(Number(amount))) return;
    if (!paymentName.trim()) return;
    if (!category) return;

    onSave({
      id: initialData?.id || Date.now().toString(),
      amount: parseFloat(amount),
      name: paymentName,
      category,
      dueDate,
      notes,
      reminder
    });
    
    onClose();
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
            <Text className="text-[20px] text-brand-dark font-bold">{initialData ? 'Edit Payment' : 'Add Upcoming Payment'}</Text>
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
                
                {/* Payment Name */}
                <View className="flex flex-col">
                  <Text className="text-[14px] text-gray-400 mb-1 ml-1">Payment Name</Text>
                  <TextInput
                    className="w-full bg-brand-card-bg border border-[#333333] rounded-lg p-3 text-[16px] text-brand-dark"
                    placeholder="e.g. Internet Bill"
                    placeholderTextColor="#7b757e"
                    value={paymentName}
                    onChangeText={setPaymentName}
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
                        className={`w-[30%] flex-col items-center justify-center p-3 rounded-xl mb-3 ${category === cat.id ? 'bg-[#2563eb]' : 'bg-brand-card-bg border border-[#333333]'}`}
                        onPress={() => setCategory(cat.id)}
                      >
                        <Ionicons name={cat.icon as any} size={24} color={category === cat.id ? "#ffffff" : "#ffffff"} className="mb-1" />
                        <Text className={`text-[12px] mt-1 ${category === cat.id ? 'text-white font-bold' : 'text-brand-dark'}`}>{cat.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Due Date */}
                <View className="flex flex-col mt-2">
                  <Text className="text-[14px] text-gray-400 mb-1 ml-1">Due Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} className="relative bg-brand-card-bg border border-[#333333] rounded-lg flex-row items-center">
                    <View className="absolute left-3 z-10 pointer-events-none">
                        <Ionicons name="calendar-outline" size={20} color="#7b757e" />
                    </View>
                    <Text className="flex-1 py-3 pl-10 pr-3 text-[16px] text-brand-dark">
                      {formatDate(dueDate)}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={new Date(dueDate)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      themeVariant="dark"
                    />
                  )}
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

                {/* Reminder Toggle */}
                <View className="flex-row items-center justify-between bg-brand-card-bg p-4 rounded-xl border border-[#333333] mt-2">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="notifications-outline" size={24} color="#7b757e" />
                    <Text className="text-[16px] text-brand-dark">Set Reminder</Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#333333", true: "#3b82f6" }}
                    thumbColor={reminder ? "#ffffff" : "#f4f3f4"}
                    onValueChange={() => setReminder(!reminder)}
                    value={reminder}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity 
                  className="w-full bg-[#2563eb] py-4 rounded-xl mt-6 shadow-md justify-center items-center hover:opacity-90 active:scale-95 transition-all"
                  onPress={handleSave}
                >
                  <Text className="text-white font-bold text-[18px]">Save Payment</Text>
                </TouchableOpacity>

              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
