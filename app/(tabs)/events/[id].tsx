import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvent } from '@/src/hooks/useEvent';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { formatEventDateTime } from '@/src/lib/utils';
import { colors } from '@/src/constants/colors';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { event, isLoading, error } = useEvent(id);

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Event' }} />
        <LoadingSpinner message="Loading event..." />
      </>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <>
        <Stack.Screen options={{ title: 'Event' }} />
        <EmptyState
          icon="alert-circle-outline"
          title="Event Not Found"
          message={error ?? 'This event may have been removed.'}
        />
      </>
    );
  }

  const formattedDateTime = formatEventDateTime(event.start_time);

  return (
    <>
      <Stack.Screen options={{ title: event.title }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero image (only if exists) */}
        {event.image_url && (
          <Image
            source={{ uri: event.image_url }}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
          />
        )}

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formattedDateTime}</Text>
              {event.end_time && (
                <Text style={styles.infoSubtext}>
                  Until {formatEventDateTime(event.end_time).split(' at ')[1]}
                </Text>
              )}
            </View>
          </View>

          {/* Location */}
          {event.location && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
              </View>
            </View>
          )}

          {/* Capacity */}
          {event.capacity && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Capacity</Text>
                <Text style={styles.infoValue}>{event.capacity} spots available</Text>
              </View>
            </View>
          )}

          {/* Divider */}
          {event.description && <View style={styles.divider} />}

          {/* Description */}
          {event.description && (
            <>
              <Text style={styles.sectionTitle}>About this event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundWhite,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 32,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  infoSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.textDark,
    lineHeight: 24,
  },
});
