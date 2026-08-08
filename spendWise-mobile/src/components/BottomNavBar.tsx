import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BottomNavBarProps {
  currentRoute: 'home' | 'expenses' | 'utang' | 'profile';
}

export default function BottomNavBar({ currentRoute }: BottomNavBarProps) {
  const router = useRouter();

  return (
    <View 
      className="absolute bottom-0 left-0 w-full z-50 flex-row justify-around items-center px-4 py-2 pb-6 rounded-t-xl bg-surface/90"
      style={{
        shadowColor: '#1c0832',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: 'rgba(254, 247, 252, 0.95)'
      }}
    >
      {/* Home */}
      <TouchableOpacity 
        className={`flex-col items-center justify-center p-2 rounded-full transition-opacity ${currentRoute === 'home' ? 'bg-secondary-container scale-90' : 'hover:bg-surface-container-high'}`}
        onPress={() => router.push('/dashboard')}
        style={{ outlineStyle: 'none' } as any}
      >
        <Ionicons name={currentRoute === 'home' ? 'home' : 'home-outline'} size={24} color={currentRoute === 'home' ? '#41627c' : 'rgba(65, 98, 124, 0.5)'} />
        <Text className={`text-[12px] mt-1 ${currentRoute === 'home' ? 'text-secondary font-bold' : 'text-secondary/50'}`}>Home</Text>
      </TouchableOpacity>

      {/* Expenses (Analytics) */}
      <TouchableOpacity 
        className={`flex-col items-center justify-center p-2 rounded-full transition-opacity ${currentRoute === 'expenses' ? 'bg-secondary-container scale-90' : 'hover:bg-surface-container-high'}`}
        onPress={() => router.push('/analytics')}
        style={{ outlineStyle: 'none' } as any}
      >
        <Ionicons name={currentRoute === 'expenses' ? 'wallet' : 'wallet-outline'} size={24} color={currentRoute === 'expenses' ? '#41627c' : 'rgba(65, 98, 124, 0.5)'} />
        <Text className={`text-[12px] mt-1 ${currentRoute === 'expenses' ? 'text-secondary font-bold' : 'text-secondary/50'}`}>Expenses</Text>
      </TouchableOpacity>

      {/* Add Expense (Floating button) */}
      <TouchableOpacity 
        className="flex-col items-center justify-center -mt-6 hover:bg-surface-container-high rounded-full transition-opacity"
        onPress={() => router.push('/add-expense')}
        style={{ outlineStyle: 'none' } as any}
      >
        <View 
          className="bg-[#D9FFF4] p-3 rounded-full"
          style={{
            shadowColor: '#1c0832',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 8
          }}
        >
          <Ionicons name="add-circle" size={32} color="#1c0832" />
        </View>
        <Text className="text-[12px] mt-1 opacity-0">Add</Text>
      </TouchableOpacity>

      {/* Utang */}
      <TouchableOpacity 
        className={`flex-col items-center justify-center p-2 rounded-full transition-opacity ${currentRoute === 'utang' ? 'bg-secondary-container scale-90' : 'hover:bg-surface-container-high'}`}
        onPress={() => router.push('/utang')}
        style={{ outlineStyle: 'none' } as any}
      >
        <Ionicons name={currentRoute === 'utang' ? 'people' : 'people-outline'} size={24} color={currentRoute === 'utang' ? '#41627c' : 'rgba(65, 98, 124, 0.5)'} />
        <Text className={`text-[12px] mt-1 ${currentRoute === 'utang' ? 'text-secondary font-bold' : 'text-secondary/50'}`}>Utang</Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity 
        className={`flex-col items-center justify-center p-2 rounded-full transition-opacity ${currentRoute === 'profile' ? 'bg-secondary-container scale-90' : 'hover:bg-surface-container-high'}`}
        style={{ outlineStyle: 'none' } as any}
      >
        <Ionicons name={currentRoute === 'profile' ? 'person' : 'person-outline'} size={24} color={currentRoute === 'profile' ? '#41627c' : 'rgba(65, 98, 124, 0.5)'} />
        <Text className={`text-[12px] mt-1 ${currentRoute === 'profile' ? 'text-secondary font-bold' : 'text-secondary/50'}`}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
