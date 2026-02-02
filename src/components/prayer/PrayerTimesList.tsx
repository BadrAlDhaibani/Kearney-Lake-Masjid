import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { PrayerTime } from '@/src/types/database';
import { PrayerTimeCard } from './PrayerTimeCard';

interface PrayerTimesListProps {
  prayers: PrayerTime[];
  nextPrayerId: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function PrayerTimesList({
  prayers,
  nextPrayerId,
  onRefresh,
  refreshing = false,
}: PrayerTimesListProps) {
  return (
    <FlatList
      data={prayers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PrayerTimeCard
          prayer={item}
          isNext={item.id === nextPrayerId}
        />
      )}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <Text style={styles.sectionHeader}>Today's Prayer Times</Text>
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2f95dc"
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
