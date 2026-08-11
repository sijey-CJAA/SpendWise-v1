import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { auth } from '../src/config/firebase';

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="share" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
