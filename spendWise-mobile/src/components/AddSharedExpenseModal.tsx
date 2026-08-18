import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddSharedExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function AddSharedExpenseModal({ visible, onClose, onSave }: AddSharedExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [type, setType] = useState<'iOwe' | 'theyOweMe'>('iOwe');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset fields when opened
  useEffect(() => {
    if (visible) {
      setAmount('');
      setDescription('');
      setPersonEmail('');
      setType('iOwe');
      setDueDate(new Date().toISOString());
      setShowDatePicker(false);
    }
  }, [visible]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate.toISOString());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description.');
      return;
    }
    if (!personEmail.trim()) {
      Alert.alert('Missing Email', 'Please enter the email of the person involved.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        amount: parseFloat(amount),
        description,
        personEmail,
        type,
        dueDate,
        status: 'pending'
      });
      onClose(); // Auto close the modal on success
    } catch (error) {
      Alert.alert('Error', 'Failed to save shared expense. Please try again.');
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
            <Text className="text-[20px] text-brand-dark font-bold">Add Shared Expense</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full justify-center items-center bg-brand-card-bg border border-[#333333]">
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            <View className="w-full max-w-md mx-auto px-6 pt-2">

              {/* Amount Input */}
              <View className="flex flex-col items-center justify-center py-6 bg-brand-card-bg rounded-xl shadow-sm border border-[#333333] mt-4">
                <Text className="text-[14px] text-gray-400 mb-2">Amount</Text>
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
                
                {/* Description */}
                <View className="flex flex-col">
                  <Text className="text-[14px] text-gray-400 mb-1 ml-1">Description</Text>
                  <TextInput
                    className="w-full bg-brand-card-bg border border-[#333333] rounded-lg p-3 text-[16px] text-brand-dark"
                    placeholder="e.g. Dinner"
                    placeholderTextColor="#7b757e"
                    value={description}
                    onChangeText={setDescription}
                    style={{ outlineStyle: 'none' } as any}
                  />
                </View>

                {/* Person Email */}
                <View className="flex flex-col">
                  <Text className="text-[14px] text-gray-400 mb-1 ml-1">Person Email</Text>
                  <TextInput
                    className="w-full bg-brand-card-bg border border-[#333333] rounded-lg p-3 text-[16px] text-brand-dark"
                    placeholder="e.g. maria@example.com"
                    placeholderTextColor="#7b757e"
                    value={personEmail}
                    onChangeText={setPersonEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{ outlineStyle: 'none' } as any}
                  />
                </View>

                {/* Type Selection */}
                <View className="flex flex-col">
                  <Text className="text-[14px] text-gray-400 mb-2 ml-1">Who owes who?</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className={`flex-1 py-3 rounded-lg border ${type === 'iOwe' ? 'bg-[#2563eb] border-[#2563eb]' : 'bg-brand-card-bg border-[#333333]'}`}
                      onPress={() => setType('iOwe')}
                    >
                      <Text className={`text-center font-bold ${type === 'iOwe' ? 'text-white' : 'text-brand-dark'}`}>I Owe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className={`flex-1 py-3 rounded-lg border ${type === 'theyOweMe' ? 'bg-[#2563eb] border-[#2563eb]' : 'bg-brand-card-bg border-[#333333]'}`}
                      onPress={() => setType('theyOweMe')}
                    >
                      <Text className={`text-center font-bold ${type === 'theyOweMe' ? 'text-white' : 'text-brand-dark'}`}>They Owe Me</Text>
                    </TouchableOpacity>
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

                {/* Save Button */}
                <TouchableOpacity 
                  className={`w-full ${isSaving ? 'bg-[#1e3a8a]' : 'bg-[#2563eb]'} py-4 rounded-xl mt-6 shadow-md justify-center items-center hover:opacity-90 active:scale-95 transition-all`}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-[18px]">Add Expense</Text>
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
