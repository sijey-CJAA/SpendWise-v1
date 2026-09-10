import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCustomAlert } from '../components/CustomAlertProvider';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showAlert } = useCustomAlert();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAuth = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      showAlert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        if (password !== confirmPassword) {
          showAlert('Error', 'Passwords do not match.');
          setIsLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      }
      router.replace('/dashboard');
    } catch (error: any) {
      showAlert('Authentication Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20, justifyContent: 'center' }}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="items-center mb-10">
            <View className="w-24 h-24 justify-center items-center mb-6">
              <ExpoImage 
                source={require('../../assets/login.svg')} 
                style={{ width: 96, height: 96 }} 
                contentFit="contain" 
              />
            </View>
            <Text className="text-4xl font-extrabold text-white mb-2 leading-[44px] text-center">
              {isLoginMode ? (
                <Text>Welcome to{'\n'}<Text className="text-blue-500">Spend</Text>Wise</Text>
              ) : (
                'Create\nAccount'
              )}
            </Text>
            <Text className="text-base text-slate-400 text-center">
              {isLoginMode ? 'Sign in to your account' : 'Sign up to get started'}
            </Text>
          </View>

          {/* Form Section */}
          <View className="mb-6">
            <View className="bg-slate-900 h-14 rounded-2xl flex-row items-center px-4 mb-4 border border-slate-800">
              <Ionicons name="person-outline" size={20} color="#94a3b8" className="mr-3" />
              <TextInput
                className="flex-1 text-base text-white ml-3 outline-none"
                placeholder="Email or Phone"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}}
              />
            </View>

            <View className="bg-slate-900 h-14 rounded-2xl flex-row items-center px-4 border border-slate-800">
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" className="mr-3" />
              <TextInput
                className="flex-1 text-base text-white ml-3 outline-none"
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {!isLoginMode && (
              <View className="bg-slate-900 h-14 rounded-2xl flex-row items-center px-4 border border-slate-800 mt-4">
                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-white ml-3 outline-none"
                  placeholder="Confirm Password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            )}

            {isLoginMode && (
              <TouchableOpacity className="self-end mt-4 mb-2" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text className="text-blue-500 font-medium text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            )}
            
            {!isLoginMode && <View className="h-6" />}
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            onPress={handleAuth}
            activeOpacity={0.8}
            disabled={isLoading}
            className="mb-8 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-14 justify-center items-center shadow-lg shadow-blue-500/30"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-lg font-bold">{isLoginMode ? 'Login' : 'Sign Up'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Separator 
          <View className="flex-row items-center mb-8">
            <View className="flex-1 h-[1px] bg-slate-800" />
            <Text className="text-slate-400 px-4 text-sm font-medium">or continue with</Text>
            <View className="flex-1 h-[1px] bg-slate-800" />
          </View>
          */}

          {/* Social Buttons 
          <View className="flex-row justify-center space-x-4 mb-10 gap-4">
            <TouchableOpacity className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 justify-center items-center">
              <Ionicons name="logo-google" size={24} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 justify-center items-center">
              <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 justify-center items-center">
              <Ionicons name="logo-github" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          */}

          {/* Footer */}
          <View className="flex-row justify-center items-center pb-8 pt-2">
            <Text className="text-slate-400 text-base">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity 
              onPress={() => setIsLoginMode(!isLoginMode)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              className="px-2 py-2"
            >
              <Text className="text-blue-500 text-lg font-extrabold tracking-wide">
                {isLoginMode ? 'Sign up' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

