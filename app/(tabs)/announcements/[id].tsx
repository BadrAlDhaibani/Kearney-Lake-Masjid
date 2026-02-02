import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAnnouncement } from '@/src/hooks/useAnnouncement';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { formatAnnouncementDate } from '@/src/lib/utils';
import { Ionicons } from '@expo/vector-icons';

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { announcement, isLoading, error } = useAnnouncement(id);

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Announcement' }} />
        <LoadingSpinner message="Loading announcement..." />
      </>
    );
  }

  // Error state
  if (error || !announcement) {
    return (
      <>
        <Stack.Screen options={{ title: 'Announcement' }} />
        <EmptyState
          icon="alert-circle-outline"
          title="Announcement Not Found"
          message={error ?? 'This announcement may have been removed.'}
        />
      </>
    );
  }

  const formattedDate = formatAnnouncementDate(announcement.published_at);

  return (
    <>
      <Stack.Screen options={{ title: announcement.title }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero image (only if exists) */}
        {announcement.image_url && (
          <Image
            source={{ uri: announcement.image_url }}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
          />
        )}

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{announcement.title}</Text>

          {/* Date */}
          <View style={styles.metadata}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Full content */}
          <Text style={styles.body}>{announcement.content}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    lineHeight: 32,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
  },
});
