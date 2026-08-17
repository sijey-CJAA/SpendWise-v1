import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, signOut } from '../config/firebase';
import BottomNavBar from '../components/BottomNavBar';

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-light">
      <View className="flex-1 w-full relative">

        {/* Custom Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4 w-full mt-2">
          <View className="w-10 h-10" /> {/* Placeholder for balance */}
          <Text className="text-[18px] font-bold text-brand-dark">Profile</Text>
          <View className="w-10 h-10" /> {/* Placeholder for balance */}
        </View>

        <View className="px-6 mt-8">
          <View className="bg-brand-card-bg rounded-2xl p-6 border border-[#333333] items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-[#2a2a2a] justify-center items-center mb-4 border border-[#444]">
              <Ionicons name="person" size={48} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-white mb-1">
              {auth.currentUser?.email || 'User'}
            </Text>
            <Text className="text-slate-400 text-sm">
              Manage your account and settings
            </Text>
          </View>

          <TouchableOpacity 
            className="w-full bg-red-500/10 border border-red-500/30 h-14 rounded-xl flex-row justify-center items-center active:scale-95 transition-all"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" className="mr-2" />
            <Text className="text-red-500 text-lg font-semibold ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>

        <BottomNavBar currentRoute="profile" />
      </View>
    </SafeAreaView>
  );
}
