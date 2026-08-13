import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BottomNavBarProps {
  currentRoute: 'home' | 'expenses' | 'stats' | 'profile';
}

export default function BottomNavBar({ currentRoute }: BottomNavBarProps) {
  const router = useRouter();

  return (
    <View className="absolute bottom-0 left-0 w-full items-center z-50">
      {/* Background shape of navbar */}
      <View 
        className="w-full bg-[#1e1e1e] flex-row justify-between items-center px-6 pt-4 pb-8 mt-6 rounded-t-[32px] border-t border-[#333333]"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        {/* Left Icons */}
        <View className="flex-1 flex-row justify-around pr-8">
          <TouchableOpacity 
            className="items-center justify-center p-2"
            onPress={() => router.push('/dashboard')}
          >
            <Ionicons 
              name={currentRoute === 'home' ? 'home' : 'home-outline'} 
              size={24} 
              color={currentRoute === 'home' ? '#ffffff' : '#9ca3af'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center justify-center p-2"
            onPress={() => router.push('/analytics')}
          >
            <Ionicons 
              name={currentRoute === 'expenses' ? 'wallet' : 'wallet-outline'} 
              size={24} 
              color={currentRoute === 'expenses' ? '#ffffff' : '#9ca3af'} 
            />
          </TouchableOpacity>
        </View>

        {/* Right Icons */}
        <View className="flex-1 flex-row justify-around pl-8">
          <TouchableOpacity 
            className="items-center justify-center p-2"
          >
            <Ionicons 
              name={currentRoute === 'stats' ? 'stats-chart' : 'stats-chart-outline'} 
              size={24} 
              color={currentRoute === 'stats' ? '#ffffff' : '#9ca3af'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center justify-center p-2"
          >
            <Ionicons 
              name={currentRoute === 'profile' ? 'person' : 'person-outline'} 
              size={24} 
              color={currentRoute === 'profile' ? '#ffffff' : '#9ca3af'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Center FAB overlapping the navbar */}
      <View className="absolute top-0 w-[72px] h-[72px] bg-[#121212] rounded-full justify-center items-center">
        <TouchableOpacity 
          className="w-[56px] h-[56px] bg-brand-purple rounded-full justify-center items-center shadow-lg"
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
