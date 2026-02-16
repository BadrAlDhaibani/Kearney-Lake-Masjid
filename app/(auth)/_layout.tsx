import { Stack } from 'expo-router';
import { HeaderBackButton } from '@/src/components/ui/HeaderBackButton';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: '',
        headerLeft: () => <HeaderBackButton />,
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: 'Sign In' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Create Account' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Reset Password' }} />
    </Stack>
  );
}
