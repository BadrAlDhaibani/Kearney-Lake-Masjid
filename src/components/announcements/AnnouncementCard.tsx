import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Announcement } from '@/src/types/database';
import { formatAnnouncementDate } from '@/src/lib/utils';
import { colors } from '@/src/constants/colors';

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress: () => void;
}

export function AnnouncementCard({ announcement, onPress }: AnnouncementCardProps) {
  const formattedDate = formatAnnouncementDate(announcement.published_at);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${announcement.title}, published ${formattedDate}`}
      accessibilityHint="Tap to read full announcement"
    >
      {/* Image with placeholder */}
      <Image
        source={
          announcement.image_url
            ? { uri: announcement.image_url }
            : require('@/assets/images/icon.png')
        }
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {announcement.title}
        </Text>

        {/* Date */}
        <View style={styles.metadata}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {/* Content preview */}
        <Text style={styles.preview} numberOfLines={3}>
          {announcement.content}
        </Text>

        {/* Read more indicator */}
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>Read more</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  preview: {
    fontSize: 15,
    color: colors.textMedium,
    lineHeight: 22,
    marginBottom: 12,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
