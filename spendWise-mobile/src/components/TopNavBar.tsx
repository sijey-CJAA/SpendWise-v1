import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, signOut } from '../config/firebase';

export default function TopNavBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isMenuOpen) {
      setIsModalVisible(true);
      Animated.spring(menuAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    } else {
      Animated.spring(menuAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start(() => {
        setIsModalVisible(false);
      });
    }
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
    <>
      <View 
        className="bg-background flex-row justify-between items-center px-6 py-4 w-full sticky top-0 z-50"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <View className="flex-1 items-start">
          <ExpoImage 
            source={require('../../assets/SpendWiseLogo.svg')} 
            className="w-8 h-8" 
            contentFit="contain"
          />
        </View>
        
        <View className="flex-1 items-center">
          <Text className="text-[22px] font-extrabold text-blue-900 tracking-tighter">SpendWise</Text>
        </View>
        
        <View className="flex-1 items-end">
          <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
            <Ionicons name="menu" size={28} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View className="flex-1 flex-row justify-end">
          {/* Backdrop */}
          <Animated.View 
            className="absolute inset-0 bg-black"
            style={{ 
              opacity: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) 
            }}
          >
            <TouchableOpacity 
              className="flex-1"
              activeOpacity={1}
              onPress={() => setIsMenuOpen(false)}
            />
          </Animated.View>

          {/* Side Drawer */}
          <Animated.View 
            className="bg-surface h-full w-[280px] shadow-2xl p-6 pt-6 z-50"
            style={{
              transform: [{
                translateX: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [280, 0]
                })
              }]
            }}
          >
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[22px] font-bold text-primary">Menu</Text>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                <Ionicons name="close" size={28} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="flex-row items-center py-4 border-b border-surface-variant"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text className="ml-4 text-[18px] text-red-500 font-semibold">Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
