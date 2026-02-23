import { useEffect, useRef } from 'react';
import { addNotificationResponseReceivedListener, type EventSubscription } from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import {
  configureNotificationHandler,
  setupAndroidChannel,
  registerForPushNotifications,
} from '@/src/lib/notifications';

/**
 * Root-level hook that handles push notification setup.
 * Call once from the root layout (inside AuthProvider).
 *
 * - Configures foreground notification display
 * - Sets up Android notification channel
 * - Registers push token when user is authenticated
 * - Listens for notification taps and navigates accordingly
 */
export function useNotificationSetup(): void {
  const { user } = useAuth();
  const router = useRouter();
  const responseListenerRef = useRef<EventSubscription | null>(null);

  // One-time setup: foreground handler + Android channel
  useEffect(() => {
    configureNotificationHandler();
    setupAndroidChannel();
  }, []);

  // Register push token when user is authenticated
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      const token = await registerForPushNotifications();
      if (!token || cancelled) return;

      // Upsert: if this user+token combo exists, update timestamp.
      // If not, insert with default preferences from the database schema.
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(
          {
            user_id: user.id,
            expo_push_token: token,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,expo_push_token' }
        );

      if (error) {
        console.error('Failed to save push token:', error.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Listen for notification taps and navigate
  useEffect(() => {
    responseListenerRef.current = addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.type === 'announcement' && data?.id) {
          router.push(`/(tabs)/announcements/${data.id}`);
        } else if (data?.type === 'event' && data?.id) {
          router.push(`/(tabs)/events/${data.id}`);
        }
        // Prayer reminders just open the app (default behavior)
      }
    );

    return () => {
      responseListenerRef.current?.remove();
    };
  }, [router]);
}
