import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated, Alert, ActivityIndicator } from 'react-native';
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
    } catch (error) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <ExpoImage 
              source={require('../../assets/SpendWiseLogo.svg')} 
              style={styles.logo} 
              contentFit="contain"
            />
          </View>
          <Text style={styles.title}>{isLoginMode ? 'Welcome Back!' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>{isLoginMode ? 'Sign in to manage your finances.' : 'Join SpendWise to track expenses.'}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={styles.loginBtn}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleAuth}
              activeOpacity={0.9}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>{isLoginMode ? 'Login' : 'Sign Up'}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>{isLoginMode ? "Don't have an account? " : "Already have an account? "}</Text>
          <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text style={styles.signupText}>{isLoginMode ? 'Sign up' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ecfdf5', // Soft emerald tint
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: '#3b82f6',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 15,
  },
  signupText: {
    color: '#10b981', // Emerald green
    fontSize: 15,
    fontWeight: '700',
  }
});
