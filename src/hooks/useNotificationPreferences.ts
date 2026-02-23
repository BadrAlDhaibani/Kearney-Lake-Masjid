import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { NotificationPreferences } from '@/src/types/database';
import { registerForPushNotifications } from '@/src/lib/notifications';

interface UseNotificationPreferencesResult {
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean | null;
  updatePreference: (key: string, value: boolean) => Promise<void>;
  enableNotifications: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook for reading and updating notification preferences for the current device.
 * Fetches the preferences row matching the current user + device push token.
 */
export function useNotificationPreferences(): UseNotificationPreferencesResult {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Check permission status and get token on mount
  useEffect(() => {
    if (!user || Platform.OS === 'web') {
      setIsLoading(false);
      setHasPermission(false);
      return;
    }

    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (granted) {
        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          setPushToken(tokenData.data);
        } catch {
          setHasPermission(false);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    })();
  }, [user?.id]);

  // Fetch preferences once we have user + token
  const fetchPreferences = useCallback(async () => {
    if (!user || !pushToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('expo_push_token', pushToken)
      .limit(1)
      .single();

    if (queryError) {
      // PGRST116 = no rows found — user hasn't registered on this device yet
      if (queryError.code === 'PGRST116') {
        setPreferences(null);
      } else {
        setError('Unable to load notification preferences.');
        console.error('Supabase error:', queryError);
      }
    } else {
      setPreferences(data as NotificationPreferences);
    }

    setIsLoading(false);
  }, [user?.id, pushToken]);

  useEffect(() => {
    if (pushToken) {
      fetchPreferences();
    }
  }, [pushToken, fetchPreferences]);

  // Toggle a single preference with optimistic update
  const updatePreference = useCallback(
    async (key: string, value: boolean) => {
      if (!preferences) return;

      const previousValue = preferences[key as keyof NotificationPreferences];
      setPreferences((prev) => (prev ? { ...prev, [key]: value } : null));

      const { error: updateError } = await supabase
        .from('notification_preferences')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('id', preferences.id);

      if (updateError) {
        // Revert optimistic update
        setPreferences((prev) => (prev ? { ...prev, [key]: previousValue } : null));
        throw new Error('Failed to update preference');
      }
    },
    [preferences?.id]
  );

  // Request permission, get token, create preferences row
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    const token = await registerForPushNotifications();
    if (!token) {
      setHasPermission(false);
      return false;
    }

    setHasPermission(true);
    setPushToken(token);

    // Upsert with default preferences
    const { data, error: upsertError } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: user.id,
          expo_push_token: token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,expo_push_token' }
      )
      .select()
      .single();

    if (upsertError) {
      setError('Failed to enable notifications.');
      console.error('Upsert error:', upsertError);
      return false;
    }

    setPreferences(data as NotificationPreferences);
    return true;
  }, [user?.id]);

  return {
    preferences,
    isLoading,
    error,
    hasPermission,
    updatePreference,
    enableNotifications,
    refetch: fetchPreferences,
  };
}
