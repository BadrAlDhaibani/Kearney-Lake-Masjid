import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { supabase } from '@/src/lib/supabase';
import { colors } from '@/src/constants/colors';

// Converts separate date ("YYYY-MM-DD") + time ("HH:MM") fields to ISO timestamp
function toISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

// Extracts "YYYY-MM-DD" from an ISO timestamp
function toDateField(iso: string): string {
  return iso.split('T')[0];
}

// Extracts "HH:MM" from an ISO timestamp
function toTimeField(iso: string): string {
  return new Date(iso).toTimeString().slice(0, 5);
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(date).getTime());
}

function isValidTime(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

export default function EventFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setDescription(data.description || '');
        setLocation(data.location || '');
        setStartDate(toDateField(data.start_time));
        setStartTime(toTimeField(data.start_time));
        if (data.end_time) {
          setEndDate(toDateField(data.end_time));
          setEndTime(toTimeField(data.end_time));
        }
        setCapacity(data.capacity ? String(data.capacity) : '');
        setImageUrl(data.image_url || '');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to load event');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }
    if (!startDate.trim() || !startTime.trim()) {
      Alert.alert('Validation Error', 'Start date and time are required');
      return;
    }
    if (!isValidDate(startDate)) {
      Alert.alert('Validation Error', 'Start date must be in YYYY-MM-DD format');
      return;
    }
    if (!isValidTime(startTime)) {
      Alert.alert('Validation Error', 'Start time must be in HH:MM format');
      return;
    }
    if ((endDate && !endTime) || (!endDate && endTime)) {
      Alert.alert('Validation Error', 'Provide both end date and end time, or leave both empty');
      return;
    }
    if (endDate && !isValidDate(endDate)) {
      Alert.alert('Validation Error', 'End date must be in YYYY-MM-DD format');
      return;
    }
    if (endTime && !isValidTime(endTime)) {
      Alert.alert('Validation Error', 'End time must be in HH:MM format');
      return;
    }

    const capacityNum = capacity.trim() ? parseInt(capacity.trim(), 10) : null;
    if (capacity.trim() && (isNaN(capacityNum!) || capacityNum! <= 0)) {
      Alert.alert('Validation Error', 'Capacity must be a positive number');
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        start_time: toISO(startDate, startTime),
        end_time: endDate && endTime ? toISO(endDate, endTime) : null,
        capacity: capacityNum,
        image_url: imageUrl.trim() || null,
      };

      if (id) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', id);

        if (error) throw error;

        Alert.alert('Success', 'Event updated successfully');
      } else {
        const { error } = await supabase
          .from('events')
          .insert({ ...eventData, is_published: false });

        if (error) throw error;

        Alert.alert('Success', 'Event created successfully');
      }

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading event..." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: id ? 'Edit Event' : 'Create Event' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.field}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter event title"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter event description"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Main Prayer Hall"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.rowField]}>
                <Text style={styles.label}>Start Date *</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={[styles.field, styles.rowFieldSmall]}>
                <Text style={styles.label}>Start Time *</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.rowField]}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={[styles.field, styles.rowFieldSmall]}>
                <Text style={styles.label}>End Time</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Capacity</Text>
              <TextInput
                style={styles.input}
                value={capacity}
                onChangeText={setCapacity}
                placeholder="Leave blank for unlimited"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />
              <Text style={styles.helpText}>
                Leave blank for open entry events
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.helpText}>
                Paste a direct link to an image hosted online
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={id ? 'Update event' : 'Create event'}
              accessibilityState={{ disabled: saving }}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : id ? 'Update Event' : 'Create Event'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              accessibilityState={{ disabled: saving }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowField: {
    flex: 2,
  },
  rowFieldSmall: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMedium,
    marginBottom: 8,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
