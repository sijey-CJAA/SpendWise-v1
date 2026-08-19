import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SharedExpenseData, updateSharedExpense } from '../services/expenseService';
import { storage, auth } from '../config/firebase';

interface ViewSharedExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expense: SharedExpenseData | null;
}

export default function ViewSharedExpenseModal({ visible, onClose, expense }: ViewSharedExpenseModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const markAsSeen = async () => {
      const user = auth.currentUser;
      if (visible && expense && expense.id && user && user.email) {
        const seenBy = expense.seenBy || [];
        if (!seenBy.includes(user.email)) {
          try {
            await updateSharedExpense(expense.id, {
              seenBy: [...seenBy, user.email]
            });
          } catch (error) {
            console.error("Failed to mark as seen", error);
          }
        }
      }
    };
    markAsSeen();
  }, [visible, expense?.id]);

  if (!expense) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const isIOwe = expense.type === 'iOwe';

  const handleMarkAsPaid = async () => {
    if (!expense.id) return;
    setIsUpdating(true);
    try {
      await updateSharedExpense(expense.id, { status: 'awaiting_approval' });
    } catch (error) {
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!expense.id) return;
    setIsUpdating(true);
    try {
      await updateSharedExpense(expense.id, { status: 'paid' });
    } catch (error) {
      Alert.alert('Error', 'Failed to approve payment.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAttachReceipt = async () => {
    if (!expense.id) return;
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.4,
        base64: true,
      });

      if (pickerResult.canceled) {
        return;
      }

      setIsUpdating(true);
      const base64Data = pickerResult.assets[0].base64;
      
      if (!base64Data) {
        throw new Error("Failed to read image data");
      }

      // Upload to Firebase Storage using base64 string directly (much faster than fetch+blob in RN)
      const filename = `receipts/${expense.id}_${Date.now()}.jpg`;
      const ref = storage.ref().child(filename);
      await ref.putString(base64Data, 'base64', { contentType: 'image/jpeg' });
      const downloadURL = await ref.getDownloadURL();

      // Update Firestore
      await updateSharedExpense(expense.id, { receiptUrl: downloadURL });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload receipt.');
      console.error(error);
    } finally {
      setIsUpdating(false);
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
            <Text className="text-[20px] text-brand-dark font-bold">Expense Details</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full justify-center items-center bg-brand-card-bg border border-[#333333]" activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            <View className="w-full max-w-md mx-auto px-6 pt-6">

              {/* Header Info */}
              <View className="flex flex-col mb-6">
                <Text className="text-[24px] font-bold text-brand-dark mb-1">{expense.description}</Text>
                <Text className="text-[14px] text-gray-400">
                  Shared with <Text className="text-brand-dark font-semibold">{expense.personEmail}</Text>
                </Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <View className={`px-3 py-1 rounded-full ${isIOwe ? 'bg-[#ef4444]/20' : 'bg-[#10b981]/20'}`}>
                    <Text className={`text-[12px] font-bold ${isIOwe ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                      {isIOwe ? 'I Owe' : 'They Owe Me'}
                    </Text>
                  </View>
                  <View className="px-3 py-1 rounded-full bg-[#333333]">
                    <Text className="text-[12px] text-gray-300 font-medium capitalize">
                      {expense.status === 'awaiting_approval' ? 'waiting' : expense.status || 'pending'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Items List */}
              <View className="flex flex-col gap-3 mt-4">
                <Text className="text-[16px] text-brand-dark font-bold border-b border-[#333333] pb-2">Items</Text>
                {expense.items && expense.items.length > 0 ? (
                  expense.items.map((item, index) => (
                    <View key={index} className="flex-row items-center justify-between py-2 border-b border-[#333333]/50">
                      <Text className="text-[16px] text-brand-dark flex-1 pr-4">{item.name}</Text>
                      <Text className="text-[16px] text-brand-dark font-semibold">₱{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-400 py-2">No individual items recorded.</Text>
                )}
              </View>

              {/* Total Amount Display */}
              <View className="flex flex-col items-center justify-center py-4 bg-brand-card-bg rounded-xl shadow-sm border border-[#333333] mt-8">
                <Text className="text-[14px] text-gray-400 mb-1">Total Amount</Text>
                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-[24px] text-brand-dark font-bold">₱</Text>
                  <Text className="text-[28px] text-brand-dark font-bold">{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
                <Text className="text-[12px] text-gray-500 mt-2">Due by {formatDate(expense.dueDate)}</Text>
              </View>

              {/* Receipt Section */}
              <View className="mt-8 border-t border-[#333333]/30 pt-6">
                <Text className="text-[16px] text-brand-dark font-bold mb-4">Receipt</Text>
                {expense.receiptUrl ? (
                  <View className="items-center">
                    <Image 
                      source={{ uri: expense.receiptUrl }} 
                      style={{ width: '100%', height: 300, borderRadius: 12 }} 
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                ) : (
                  <TouchableOpacity 
                    className="flex-row items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-[#3b82f6] bg-[#3b82f6]/10"
                    onPress={handleAttachReceipt}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#3b82f6" />
                    ) : (
                      <>
                        <Ionicons name="camera-outline" size={20} color="#3b82f6" />
                        <Text className="text-[#3b82f6] font-semibold text-[16px]">Attach Receipt</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Actions */}
              <View className="mt-8 mb-4 gap-3">
                {expense.status === 'pending' && isIOwe && (
                  <TouchableOpacity 
                    className="w-full bg-[#10b981] py-4 rounded-xl shadow-md justify-center items-center flex-row gap-2"
                    activeOpacity={0.8}
                    onPress={handleMarkAsPaid}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="card-outline" size={20} color="#ffffff" />
                        <Text className="text-white font-bold text-[18px]">Mark as Paid</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {expense.status === 'awaiting_approval' && isIOwe && (
                  <View className="w-full bg-[#f59e0b]/20 py-4 rounded-xl border border-[#f59e0b]/30 justify-center items-center flex-row gap-2">
                    <Ionicons name="time-outline" size={20} color="#f59e0b" />
                    <Text className="text-[#f59e0b] font-bold text-[16px]">Waiting for Approval</Text>
                  </View>
                )}

                {expense.status === 'awaiting_approval' && !isIOwe && (
                  <TouchableOpacity 
                    className="w-full bg-[#10b981] py-4 rounded-xl shadow-md justify-center items-center flex-row gap-2"
                    activeOpacity={0.8}
                    onPress={handleApprovePayment}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done-circle-outline" size={24} color="#ffffff" />
                        <Text className="text-white font-bold text-[18px]">Approve Payment</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
