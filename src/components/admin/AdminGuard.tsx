import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isLoading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.replace('/(auth)/sign-in');
    } else if (!isAdmin) {
      router.replace('/(tabs)/more');
    }
  }, [isAdmin, isLoading, session]);

  if (isLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!session || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
