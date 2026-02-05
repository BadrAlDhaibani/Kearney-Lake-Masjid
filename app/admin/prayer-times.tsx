import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrayerTimes } from '@/src/hooks/usePrayerTimes';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { supabase } from '@/src/lib/supabase';
import { PrayerTime } from '@/src/types/database';
import { colors } from '@/src/constants/colors';

export default function PrayerTimesAdminScreen() {
  const { prayerTimes, isLoading, error, refetch } = usePrayerTimes();
  const [editedTimes, setEditedTimes] = useState<Record<string, Partial<PrayerTime>>>({});
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (id: string, field: keyof PrayerTime, value: any) => {
    setEditedTimes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (prayerId: string) => {
    const changes = editedTimes[prayerId];
    if (!changes || Object.keys(changes).length === 0) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('prayer_times')
        .update(changes)
        .eq('id', prayerId);

      if (error) throw error;

      Alert.alert('Success', 'Prayer time updated successfully');
      setEditedTimes((prev) => {
        const updated = { ...prev };
        delete updated[prayerId];
        return updated;
      });
      await refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update prayer time');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading prayer times..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Error Loading Prayer Times"
        message={error}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {prayerTimes.map((prayer) => {
          const edited = editedTimes[prayer.id] || {};
          const adhanTime = edited.adhan_time !== undefined ? edited.adhan_time : prayer.adhan_time;
          const iqamaTime = edited.iqama_time !== undefined ? edited.iqama_time : prayer.iqama_time;
          const isActive = edited.is_active !== undefined ? edited.is_active : prayer.is_active;
          const notes = edited.notes !== undefined ? edited.notes : prayer.notes;
          const hasChanges = Object.keys(edited).length > 0;

          return (
            <View key={prayer.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.prayerName}>{prayer.prayer_name}</Text>
                <View style={styles.activeToggle}>
                  <Text style={styles.activeLabel}>Active</Text>
                  <Switch
                    value={isActive}
                    onValueChange={(value) =>
                      handleFieldChange(prayer.id, 'is_active', value)
                    }
                    trackColor={{ false: colors.switchTrackInactive, true: colors.switchTrackActive }}
                    thumbColor={isActive ? colors.switchThumbActive : colors.switchThumbInactive}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Adhan Time (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={adhanTime || ''}
                  onChangeText={(value) =>
                    handleFieldChange(prayer.id, 'adhan_time', value || null)
                  }
                  placeholder="HH:MM (e.g., 06:00)"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Iqama Time *</Text>
                <TextInput
                  style={styles.input}
                  value={iqamaTime}
                  onChangeText={(value) => handleFieldChange(prayer.id, 'iqama_time', value)}
                  placeholder="HH:MM (e.g., 06:15)"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes || ''}
                  onChangeText={(value) =>
                    handleFieldChange(prayer.id, 'notes', value || null)
                  }
                  placeholder="Optional notes..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {hasChanges && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSave(prayer.id)}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
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
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMedium,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundWhite,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
