import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Add global error handler to catch fatal startup crashes in release mode
if (typeof ErrorUtils !== 'undefined') {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    Alert.alert(
      'Fatal Error',
      `${error.name}: ${error.message}\n\n${error.stack}`
    );
  });
}

import { auth } from '../src/config/firebase';
import '../src/services/syncService'; // Initialize offline sync listener
import UpdateModal from '../src/components/UpdateModal';
import { CustomAlertProvider } from '../src/components/CustomAlertProvider';

export default function Layout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
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
  );
}
