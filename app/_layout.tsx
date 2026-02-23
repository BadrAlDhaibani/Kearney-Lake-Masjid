import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { DetailHeader } from '@/src/components/ui/DetailHeader';
import { useNotificationSetup } from '@/src/hooks/useNotificationSetup';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

/** Registers push token and sets up notification listeners */
function NotificationSetup() {
  useNotificationSetup();
  return null;
}

/** Watches for PASSWORD_RECOVERY auth events and redirects to reset-password */
function AuthEventHandler() {
  const { authEvent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authEvent?.type === 'PASSWORD_RECOVERY') {
      router.replace('/(auth)/reset-password');
    }
  }, [authEvent]);

  return null;
}

function RootLayoutNav() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <AuthEventHandler />
        <NotificationSetup />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen
            name="contact"
            options={{
              header: () => <DetailHeader title="Contact Us" />,
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              header: () => <DetailHeader title="Notifications" />,
            }}
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
