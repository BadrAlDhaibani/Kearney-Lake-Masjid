import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '@/src/types/database';
import { formatEventTime } from '@/src/lib/utils';
import { colors } from '@/src/constants/colors';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const formattedTime = formatEventTime(event.start_time);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${formattedTime}${event.location ? `, at ${event.location}` : ''}`}
      accessibilityHint="Tap to view event details"
    >
      {/* Square thumbnail */}
      <Image
        source={
          event.image_url
            ? { uri: event.image_url }
            : require('@/assets/images/icon.png')
        }
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Time */}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>{formattedTime}</Text>
        </View>

        {/* Location */}
        {event.location && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}

        {/* Capacity indicator */}
        {event.capacity && (
          <View style={styles.capacityBadge}>
            <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.capacityText}>
              {event.capacity} spots
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  capacityText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
});
