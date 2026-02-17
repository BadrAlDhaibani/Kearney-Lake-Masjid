import { Stack } from 'expo-router';
import { DetailHeader } from '@/src/components/ui/DetailHeader';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="sign-in"
        options={{
          header: () => <DetailHeader title="Sign In" />,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          header: () => <DetailHeader title="Create Account" />,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          header: () => <DetailHeader title="Reset Password" />,
        }}
      />
      <Stack.Screen
        name="callback"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          header: () => <DetailHeader title="Set New Password" />,
        }}
      />
    </Stack>
  );
}
