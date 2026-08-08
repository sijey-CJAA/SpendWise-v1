import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Alert, ActivityIndicator } from 'react-native';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Animation value for button press
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 10,
    }).start();
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.replace('/dashboard');
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-emerald-50 justify-center">
      <KeyboardAvoidingView 
        className="flex-1 px-8 justify-center items-center"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="w-full max-w-md md:bg-white md:p-8 md:rounded-3xl md:shadow-xl md:shadow-emerald-900/10 md:border md:border-emerald-100">
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-full bg-white justify-center items-center mb-6 shadow-lg shadow-emerald-500/20 elevation-lg md:border md:border-emerald-50">
              <ExpoImage 
                source={require('../../assets/SpendWiseLogo.svg')} 
                className="w-12 h-12" 
                contentFit="contain"
              />
            </View>
            <Text className="text-3xl font-extrabold text-blue-900 mb-2">{isLoginMode ? 'Welcome Back!' : 'Create Account'}</Text>
            <Text className="text-base text-slate-500 text-center">{isLoginMode ? 'Sign in to manage your finances.' : 'Join SpendWise to track expenses.'}</Text>
          </View>

          <View className="mb-8">
            <View className="mb-5">
              <Text className="text-sm font-semibold text-blue-900 mb-2">Email Address</Text>
              <TextInput
                className="bg-white h-14 rounded-2xl px-4 text-base text-gray-800 border border-emerald-200 shadow-sm shadow-black/5 elevation-sm"
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-blue-900 mb-2">Password</Text>
              <TextInput
                className="bg-white h-14 rounded-2xl px-4 text-base text-gray-800 border border-emerald-200 shadow-sm shadow-black/5 elevation-sm"
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity className="self-end mb-8">
              <Text className="text-blue-500 font-semibold text-sm hover:text-blue-600 transition-colors">Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity 
                className="bg-blue-500 h-14 rounded-2xl justify-center items-center shadow-lg shadow-blue-500/30 elevation-md hover:bg-blue-600 transition-colors"
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleAuth}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-lg font-bold tracking-wide">{isLoginMode ? 'Login' : 'Sign Up'}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          <View className="flex-row justify-center items-center">
            <Text className="text-slate-500 text-base">{isLoginMode ? "Don't have an account? " : "Already have an account? "}</Text>
            <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
              <Text className="text-emerald-600 text-base font-bold hover:text-emerald-700 transition-colors">{isLoginMode ? 'Sign up' : 'Login'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
