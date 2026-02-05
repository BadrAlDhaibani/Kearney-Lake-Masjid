import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Announcement } from '@/src/types/database';
import { AnnouncementCard } from './AnnouncementCard';
import { colors } from '@/src/constants/colors';

interface AnnouncementsListProps {
  announcements: Announcement[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function AnnouncementsList({
  announcements,
  onRefresh,
  refreshing = false,
}: AnnouncementsListProps) {
  const router = useRouter();

  const handleAnnouncementPress = (id: string) => {
    router.push(`/(tabs)/announcements/${id}` as any);
  };

  return (
    <FlatList
      data={announcements}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AnnouncementCard
          announcement={item}
          onPress={() => handleAnnouncementPress(item.id)}
        />
      )}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <Text style={styles.sectionHeader}>Latest News & Updates</Text>
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
