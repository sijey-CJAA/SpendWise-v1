import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, signOut } from '../config/firebase';
import BottomNavBar from '../components/BottomNavBar';
import { useCustomAlert } from '../components/CustomAlertProvider';
import DeveloperDiagnosticsModal from '../components/DeveloperDiagnosticsModal';
import { handleAppError } from '../services/errorHandler';

export default function Profile() {
  const router = useRouter();
  const { showAlert } = useCustomAlert();
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error: any) {
      handleAppError(error, { category: 'Authentication', operation: 'User Log Out' });
      showAlert('Logout Failed', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-light">
      <View className="flex-1 w-full relative">

        {/* Custom Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4 w-full mt-2">
          <View className="w-10 h-10" />
          <Text className="text-[18px] font-bold text-brand-dark">Profile</Text>
          <TouchableOpacity 
            onPress={() => setShowDiagnostics(true)}
            className="w-10 h-10 rounded-full bg-slate-800 justify-center items-center border border-slate-700 active:bg-slate-700"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="bug-outline" size={18} color="#60a5fa" />
          </TouchableOpacity>
        </View>

        <View className="px-6 mt-8">
          <View className="bg-brand-card-bg rounded-2xl p-6 border border-[#333333] items-center mb-6">
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

          {/* Developer / Firebase Diagnostics Button */}
          <TouchableOpacity 
            className="w-full bg-blue-500/10 border border-blue-500/30 h-14 rounded-xl flex-row items-center px-4 mb-4 active:scale-98 transition-all"
            onPress={() => setShowDiagnostics(true)}
          >
            <View className="w-9 h-9 rounded-lg bg-blue-500/20 justify-center items-center mr-3">
              <Ionicons name="construct-outline" size={20} color="#60a5fa" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">Firebase Diagnostics</Text>
              <Text className="text-slate-400 text-xs">Test connection, writes, and view logs</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full bg-red-500/10 border border-red-500/30 h-14 rounded-xl flex-row justify-center items-center active:scale-95 transition-all"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" className="mr-2" />
            <Text className="text-red-500 text-lg font-semibold ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>

        <BottomNavBar currentRoute="profile" />
        <DeveloperDiagnosticsModal visible={showDiagnostics} onClose={() => setShowDiagnostics(false)} />
      </View>
    </SafeAreaView>
  );
}
