import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { session, authEvent, clearAuthEvent, isLoading } = useAuth();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading || hasNavigated.current) return;

    // If PASSWORD_RECOVERY event arrived, navigate immediately
    if (authEvent === 'PASSWORD_RECOVERY') {
      hasNavigated.current = true;
      clearAuthEvent();
      router.replace('/(auth)/reset-password');
      return;
    }

    // Otherwise wait for deep link processing to complete before falling back.
    // The deep link listener in AuthContext runs async — give it time to call
    // setSession and trigger onAuthStateChange before we give up.
    const timer = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      if (session) {
        // Email confirmation — user is now signed in
        router.replace('/(tabs)/more');
      } else {
        router.replace('/(auth)/sign-in');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, session, authEvent]);

  return <LoadingSpinner message="Verifying your account..." />;
}
