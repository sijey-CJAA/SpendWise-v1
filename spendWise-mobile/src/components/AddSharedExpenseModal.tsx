import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SharedExpenseItem } from '../services/expenseService';

interface AddSharedExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function AddSharedExpenseModal({ visible, onClose, onSave }: AddSharedExpenseModalProps) {
  const [items, setItems] = useState<SharedExpenseItem[]>([{ name: '', price: 0 }]);
  const [description, setDescription] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [type, setType] = useState<'iOwe' | 'theyOweMe'>('iOwe');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset fields when opened
  useEffect(() => {
    if (visible) {
      setItems([{ name: '', price: 0 }]);
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

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleAddItem = () => {
    setItems([...items, { name: '', price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [{ name: '', price: 0 }]);
  };

  const handleItemChange = (index: number, field: keyof SharedExpenseItem, value: string) => {
    const newItems = [...items];
    if (field === 'price') {
      newItems[index].price = value === '' ? 0 : parseFloat(value) || 0;
    } else {
      newItems[index].name = value;
    }
    setItems(newItems);
  };

  const handleSave = async () => {
    if (totalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter at least one item with a valid price.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description.');
      return;
    }
    if (!personEmail.trim()) {
      Alert.alert('Missing Email', 'Please enter the email of the person to share with.');
      return;
    }

    const validItems = items.filter(item => item.name.trim() !== '' && item.price > 0);
    if (validItems.length === 0) {
      Alert.alert('Invalid Items', 'Please provide valid names and prices for the items.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        amount: totalAmount,
        description,
        personEmail,
        type,
        dueDate,
        status: 'pending',
        items: validItems
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

              {/* Description / List Name */}
              <View className="flex flex-col mt-2">
                <Text className="text-[14px] text-gray-400 mb-1 ml-1">List Name / Description</Text>
                <TextInput
                  className="w-full bg-brand-card-bg border border-[#333333] rounded-lg p-3 text-[16px] text-brand-dark"
                  placeholder="e.g. Weekend Groceries"
                  placeholderTextColor="#7b757e"
                  value={description}
                  onChangeText={setDescription}
                  style={{ outlineStyle: 'none' } as any}
                />
              </View>

              {/* Items List */}
              <View className="flex flex-col gap-3 mt-6">
                <Text className="text-[16px] text-brand-dark font-bold">Items</Text>
                {items.map((item, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <TextInput
                      className="flex-1 bg-brand-card-bg border border-[#333333] rounded-lg p-3 text-[16px] text-brand-dark"
                      placeholder="Item name"
                      placeholderTextColor="#7b757e"
                      value={item.name}
                      onChangeText={(val) => handleItemChange(index, 'name', val)}
                      style={{ outlineStyle: 'none' } as any}
                    />
                    <TextInput
                      className="w-24 bg-brand-card-bg border border-[#333333] rounded-lg p-3 text-[16px] text-brand-dark text-right"
                      placeholder="0.00"
                      placeholderTextColor="#7b757e"
                      keyboardType="decimal-pad"
                      value={item.price > 0 ? item.price.toString() : ''}
                      onChangeText={(val) => handleItemChange(index, 'price', val)}
                      style={{ outlineStyle: 'none' } as any}
                    />
                    <TouchableOpacity onPress={() => handleRemoveItem(index)} className="p-2">
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity 
                  className="flex-row items-center justify-center gap-2 py-3 mt-1 rounded-lg border border-dashed border-[#3b82f6] bg-[#3b82f6]/10"
                  onPress={handleAddItem}
                >
                  <Ionicons name="add" size={18} color="#3b82f6" />
                  <Text className="text-[#3b82f6] font-semibold text-[14px]">Add Item</Text>
                </TouchableOpacity>
              </View>

              {/* Total Amount Display */}
              <View className="flex flex-col items-center justify-center py-4 bg-brand-card-bg rounded-xl shadow-sm border border-[#333333] mt-6">
                <Text className="text-[14px] text-gray-400 mb-1">Total Amount</Text>
                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-[24px] text-brand-dark font-bold">₱</Text>
                  <Text className="text-[28px] text-brand-dark font-bold">{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
              </View>

              {/* Form Details */}
              <View className="flex flex-col gap-4 mt-6">

                {/* Person Email */}
                <View className="flex flex-col">
                  <Text className="text-[14px] text-gray-400 mb-1 ml-1">Share with (Email)</Text>
                  <TextInput
                    className="w-full bg-brand-card-bg border border-[#333333] rounded-lg p-3 text-[16px] text-brand-dark"
                    placeholder="e.g. mom@example.com"
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
                  className={`w-full ${isSaving ? 'bg-[#1e3a8a]' : 'bg-[#2563eb]'} py-4 rounded-xl mt-6 shadow-md justify-center items-center`}
                  activeOpacity={0.8}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-[18px]">Add Shared Expense</Text>
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
