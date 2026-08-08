import '../global.css';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="utang" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
