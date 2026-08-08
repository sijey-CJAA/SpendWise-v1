import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, signOut } from '../config/firebase';
import BottomNavBar from '../components/BottomNavBar';

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-emerald-100 md:bg-slate-800">
      <View className="flex-1 w-full max-w-md mx-auto bg-gray-50 md:shadow-2xl md:overflow-hidden relative">
        
        {/* Top Navbar */}
        <View 
          className="flex-row justify-between items-center px-6 pt-4 pb-2 bg-emerald-100 shadow-sm"
          style={{ zIndex: 50, elevation: 10 }}
        >
          <View className="flex-row items-center">
            <ExpoImage 
              source={require('../../assets/SpendWiseLogo.svg')} 
              className="w-8 h-8 mr-2.5" 
              contentFit="contain"
            />
            <Text className="text-[22px] font-extrabold text-blue-900 tracking-tighter">SpendWise</Text>
          </View>
          <View>
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
              className="absolute top-[45px] right-0 bg-white rounded-2xl p-3 shadow-lg shadow-black/15 min-w-[160px]"
              style={[{
                opacity: menuAnim,
                zIndex: 100,
                elevation: 15,
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
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text className="ml-3 text-[17px] text-red-500 font-semibold">Logout</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        <ScrollView 
          className="flex-1 bg-gray-50" 
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }} 
          showsVerticalScrollIndicator={false}
        >
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

          {/* Recent Transactions Grid */}
          <Text className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</Text>
          <View className="flex-col">
            {[1, 2, 3, 4].map((item) => (
              <View key={item} className="w-full mb-4">
                <View className="bg-white rounded-2xl p-4 shadow-sm elevation-sm flex-row items-center border border-gray-100">
                  <View className="w-12 h-12 rounded-full bg-blue-50 justify-center items-center mr-4">
                    <Ionicons name="cart-outline" size={24} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-800">Groceries</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">Today, 10:30 AM</Text>
                  </View>
                  <Text className="text-base font-bold text-gray-800">-$24.50</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom NavBar */}
        <BottomNavBar currentRoute="home" />

      </View>
    </SafeAreaView>
  );
}
