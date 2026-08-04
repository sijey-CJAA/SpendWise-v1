import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, signOut } from '../config/firebase';

export default function Dashboard() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: isMenuOpen ? 1 : 0,
      useNativeDriver: true,
      bounciness: 12,
      speed: 14,
    }).start();
  }, [isMenuOpen]);

  return (
    <SafeAreaView className="flex-1 bg-emerald-100">
      
      {/* Top Navbar */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2 bg-emerald-100 z-10">
        <View className="flex-row items-center">
          <ExpoImage 
            source={require('../../assets/SpendWiseLogo.svg')} 
            className="w-8 h-8 mr-2.5" 
            contentFit="contain"
          />
          <Text className="text-[22px] font-extrabold text-blue-900 tracking-tighter">SpendWise</Text>
        </View>
        <View className="z-10">
          <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
            <Animated.View style={{ 
              transform: [{ 
                rotate: menuAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) 
              }] 
            }}>
              <Ionicons name={isMenuOpen ? "close" : "menu"} size={28} color="#3b82f6" />
            </Animated.View>
          </TouchableOpacity>
          
          <Animated.View 
            pointerEvents={isMenuOpen ? 'auto' : 'none'}
            className="absolute top-[45px] right-0 bg-white rounded-2xl p-3 shadow-lg shadow-black/15 min-w-[160px] elevation-md"
            style={[{
              opacity: menuAnim,
              transform: [{
                translateX: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0]
                })
              }, {
                scale: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1]
                })
              }]
            }]}
          >
            <TouchableOpacity 
              className="flex-row items-center py-3 px-2"
              onPress={async () => {
                try {
                  await signOut(auth);
                  router.replace('/');
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="ml-3 text-[17px] text-red-500 font-semibold">Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="bg-blue-900 rounded-[24px] p-6 mb-8 shadow-lg shadow-blue-900/15 elevation-lg">
          <Text className="text-2xl font-bold text-white mb-8">Welcome, User 👋</Text>
          
          <Text className="text-blue-300 text-[13px] font-semibold mb-3 uppercase tracking-wide">Total Spendings</Text>
          
          <View className="flex-row justify-between bg-white/10 rounded-2xl p-4">
            <View className="items-center flex-1">
              <Text className="text-blue-200 text-xs mb-1 font-medium">Today</Text>
              <Text className="text-white text-base font-bold">$45.00</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-blue-200 text-xs mb-1 font-medium">This Week</Text>
              <Text className="text-white text-base font-bold">$120.50</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-blue-200 text-xs mb-1 font-medium">This Month</Text>
              <Text className="text-white text-base font-bold">$450.00</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Custom Bottom Navigation */}
      <View className="flex-row bg-emerald-100 h-20 border-t border-emerald-200 justify-around items-center absolute bottom-0 left-0 right-0 pb-4">
        {/* Left Side: Home Icon */}
        <TouchableOpacity className="items-center justify-center flex-1">
          <Ionicons name="home" size={26} color="#3b82f6" />
          <View className="w-1 h-1 rounded-full bg-blue-500 mt-1" />
        </TouchableOpacity>

        {/* Middle: Floating Add Button */}
        <View className="flex-1 items-center">
          <TouchableOpacity className="w-[60px] h-[60px] rounded-full bg-blue-500 justify-center items-center -mt-[30px] shadow-lg shadow-blue-500/30 elevation-md">
            <ExpoImage 
              source={require('../../assets/add.svg')} 
              className="w-[26px] h-[26px]" 
              style={{ tintColor: '#ffffff' }}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Right Side: Placeholder for now */}
        <TouchableOpacity className="items-center justify-center flex-1">
          <Ionicons name="apps-outline" size={26} color="#64748b" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
