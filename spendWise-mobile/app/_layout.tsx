import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState, Component, ErrorInfo } from 'react';
import { Alert, Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { auth } from '../src/config/firebase';
import '../src/services/syncService'; // Initialize offline sync listener
import UpdateModal from '../src/components/UpdateModal';
import { CustomAlertProvider } from '../src/components/CustomAlertProvider';

// Global error reference so we can trigger the modal from outside React
let showGlobalError: ((error: Error) => void) | null = null;

if (typeof ErrorUtils !== 'undefined') {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (showGlobalError) {
      showGlobalError(error);
    } else {
      Alert.alert('Fatal Error', `${error.name}: ${error.message}\n\n${error.stack}`);
    }
  });
}

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <GlobalErrorModal error={this.state.error} onDismiss={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function GlobalErrorModal({ error, onDismiss }: { error: Error | null, onDismiss: () => void }) {
  if (!error) return null;
  return (
    <Modal visible={!!error} animationType="slide" transparent={false}>
      <View className="flex-1 bg-[#121212] pt-12 px-6">
        <View className="flex-row items-center mb-6">
          <Ionicons name="warning" size={32} color="#ef4444" />
          <Text className="text-white text-2xl font-bold ml-3">App Crashed!</Text>
        </View>
        <Text className="text-gray-400 mb-4">An unexpected error occurred. You can screenshot this to help debug the problem.</Text>
        
        <View className="bg-brand-card-bg p-4 rounded-xl border border-red-500/30 flex-1 mb-6">
          <ScrollView showsVerticalScrollIndicator={true}>
            <Text className="text-red-400 font-bold text-lg mb-2">{error?.name}: {error?.message}</Text>
            <Text className="text-gray-400 text-xs font-mono">{error?.stack}</Text>
          </ScrollView>
        </View>
        
        <TouchableOpacity 
          className="w-full bg-[#2563eb] py-4 rounded-xl shadow-md justify-center items-center mb-8"
          onPress={onDismiss}
        >
          <Text className="text-white font-bold text-lg">Dismiss & Try to Continue</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function LayoutContent() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [globalError, setGlobalError] = useState<Error | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    showGlobalError = (err: Error) => setGlobalError(err);
    return () => { showGlobalError = null; };
  }, []);

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
      if (user) {
        import('../src/services/syncService').then(({ syncService }) => {
          syncService.processQueue();
        });
      }
    });
    return subscriber; 
  }, [initializing]);

  useEffect(() => {
    if (initializing) return;

    const isLoginScreen = segments[0] === 'index';

    if (user && isLoginScreen) {
      router.replace('/dashboard');
    } else if (!user && !isLoginScreen) {
      router.replace('/');
    }
  }, [user, initializing, segments]);

  if (initializing) return null;

  return (
    <>
      <CustomAlertProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="share" />
          <Stack.Screen name="analytics" />
          <Stack.Screen name="history" />
        </Stack>
        <UpdateModal />
      </CustomAlertProvider>
      <GlobalErrorModal error={globalError} onDismiss={() => setGlobalError(null)} />
    </>
  );
}

export default function Layout() {
  return (
    <ErrorBoundary>
      <LayoutContent />
    </ErrorBoundary>
  );
}
