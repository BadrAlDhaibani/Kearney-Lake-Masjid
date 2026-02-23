import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/constants/colors';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotificationPreferences } from '@/src/hooks/useNotificationPreferences';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

const PRAYER_TOGGLES = [
  { key: 'prayer_fajr', label: 'Fajr' },
  { key: 'prayer_dhuhr', label: 'Dhuhr' },
  { key: 'prayer_asr', label: 'Asr' },
  { key: 'prayer_maghrib', label: 'Maghrib' },
  { key: 'prayer_isha', label: 'Isha' },
  { key: 'prayer_jummah', label: 'Jummah' },
] as const;

const COMMUNITY_TOGGLES = [
  { key: 'event_reminders', label: 'Event Reminders' },
  { key: 'announcements', label: 'Announcements' },
] as const;

export default function NotificationsScreen() {
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const {
    preferences,
    isLoading,
    error,
    hasPermission,
    updatePreference,
    enableNotifications,
  } = useNotificationPreferences();
  const [enabling, setEnabling] = useState(false);

  // Auth guard: redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/(auth)/sign-in');
    }
  }, [authLoading, session]);

  if (authLoading || (!session && !authLoading)) {
    return <LoadingSpinner />;
  }

  const handleEnable = async () => {
    setEnabling(true);
    try {
      const success = await enableNotifications();
      if (!success) {
        Alert.alert(
          'Notifications Disabled',
          Platform.OS === 'ios'
            ? 'Please enable notifications in Settings > Kearney Lake Masjid.'
            : 'Please enable notifications in your device settings.',
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to enable notifications. Please try again.');
    } finally {
      setEnabling(false);
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updatePreference(key, value);
    } catch {
      Alert.alert('Error', 'Failed to update preference. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading preferences..." />;
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centeredContent}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No permission or no preferences row — show enable prompt
  if (!hasPermission || !preferences) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centeredContent}>
          <View style={styles.enableIconContainer}>
            <Ionicons name="notifications-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.enableTitle}>Stay Updated</Text>
          <Text style={styles.enableDescription}>
            Get reminders for prayer times, upcoming events, and community announcements.
          </Text>
          <TouchableOpacity
            style={[styles.enableButton, enabling && styles.enableButtonDisabled]}
            onPress={handleEnable}
            disabled={enabling}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Enable notifications"
          >
            <Ionicons name="notifications" size={20} color={colors.white} />
            <Text style={styles.enableButtonText}>
              {enabling ? 'Enabling...' : 'Enable Notifications'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Preferences loaded — show toggles
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>PRAYER REMINDERS</Text>
        <View style={styles.section}>
          {PRAYER_TOGGLES.map((toggle, index) => (
            <View
              key={toggle.key}
              style={[
                styles.toggleRow,
                index < PRAYER_TOGGLES.length - 1 && styles.toggleRowBorder,
              ]}
            >
              <Text style={styles.toggleLabel}>{toggle.label}</Text>
              <Switch
                value={preferences[toggle.key]}
                onValueChange={(value) => handleToggle(toggle.key, value)}
                trackColor={{ false: colors.switchTrackInactive, true: colors.switchTrackActive }}
                thumbColor={
                  preferences[toggle.key]
                    ? colors.switchThumbActive
                    : colors.switchThumbInactive
                }
                accessibilityRole="switch"
                accessibilityLabel={`${toggle.label} prayer reminder`}
                accessibilityState={{ checked: preferences[toggle.key] }}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>COMMUNITY UPDATES</Text>
        <View style={styles.section}>
          {COMMUNITY_TOGGLES.map((toggle, index) => (
            <View
              key={toggle.key}
              style={[
                styles.toggleRow,
                index < COMMUNITY_TOGGLES.length - 1 && styles.toggleRowBorder,
              ]}
            >
              <Text style={styles.toggleLabel}>{toggle.label}</Text>
              <Switch
                value={preferences[toggle.key]}
                onValueChange={(value) => handleToggle(toggle.key, value)}
                trackColor={{ false: colors.switchTrackInactive, true: colors.switchTrackActive }}
                thumbColor={
                  preferences[toggle.key]
                    ? colors.switchThumbActive
                    : colors.switchThumbInactive
                }
                accessibilityRole="switch"
                accessibilityLabel={`${toggle.label} notifications`}
                accessibilityState={{ checked: preferences[toggle.key] }}
              />
            </View>
          ))}
        </View>

        <Text style={styles.footerText}>
          Notifications are sent to this device only. You can change these settings at any time.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  enableIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  enableTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  enableDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  enableButtonDisabled: {
    opacity: 0.6,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 4,
    marginBottom: 8,
    marginTop: 8,
  },
  section: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
