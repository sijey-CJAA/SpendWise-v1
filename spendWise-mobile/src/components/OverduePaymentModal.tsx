import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UpcomingPaymentData } from '../services/expenseService';

interface OverduePaymentModalProps {
  visible: boolean;
  payment: UpcomingPaymentData | null;
  onPaid: (payment: UpcomingPaymentData) => void;
  onSnooze: (payment: UpcomingPaymentData) => void;
}

export default function OverduePaymentModal({ visible, payment, onPaid, onSnooze }: OverduePaymentModalProps) {
  if (!payment) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => onSnooze(payment)}>
      <View className="flex-1 justify-center items-center bg-black/70 px-6">
        <View className="bg-brand-card-bg w-full max-w-sm rounded-[24px] border border-[#ef4444]/30 overflow-hidden shadow-lg">
          
          <View className="bg-[#ef4444]/10 items-center justify-center py-6 border-b border-[#ef4444]/20">
            <View className="w-16 h-16 rounded-full bg-[#ef4444]/20 justify-center items-center mb-3">
              <Ionicons name="alert-circle" size={36} color="#ef4444" />
            </View>
            <Text className="text-[22px] font-bold text-white text-center">Overdue Payment</Text>
            <Text className="text-gray-400 text-[14px] mt-1 text-center px-4">
              The due date for this payment has passed.
            </Text>
          </View>

          <View className="p-6">
            <View className="bg-[#1e1e1e] rounded-xl p-4 mb-6 border border-[#333333]">
              <Text className="text-white text-[18px] font-bold mb-1">{payment.name}</Text>
              <Text className="text-brand-dark font-black text-[24px] mb-2">₱{Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              <Text className="text-gray-400 text-[12px]">Due Date: {new Date(payment.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
            </View>

            <Text className="text-white text-center font-medium text-[16px] mb-6">Have you paid this yet?</Text>

            <View className="flex-col gap-3">
              <TouchableOpacity 
                className="w-full bg-[#10b981] py-4 rounded-xl items-center flex-row justify-center gap-2"
                onPress={() => onPaid(payment)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                <Text className="text-white font-bold text-[16px]">Yes, I paid it</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="w-full bg-brand-light py-4 rounded-xl items-center border border-[#333333]"
                onPress={() => onSnooze(payment)}
              >
                <Text className="text-white font-bold text-[16px]">Not yet</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}
