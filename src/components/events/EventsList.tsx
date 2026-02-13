import { useMemo } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Event } from '@/src/types/database';
import { EventCard } from './EventCard';
import { getEventDateKey, formatEventDateHeader } from '@/src/lib/utils';
import { colors } from '@/src/constants/colors';

interface EventSection {
  title: string;
  dateKey: string;
  data: Event[];
}

interface EventsListProps {
  events: Event[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function EventsList({
  events,
  onRefresh,
  refreshing = false,
}: EventsListProps) {
  const router = useRouter();

  // Group events by date
  const sections = useMemo((): EventSection[] => {
    const grouped: Record<string, Event[]> = {};

    for (const event of events) {
      const dateKey = getEventDateKey(event.start_time);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    }

    // Convert to sections array, sorted by date
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, data]) => ({
        title: formatEventDateHeader(data[0].start_time),
        dateKey,
        data,
      }));
  }, [events]);

  const handleEventPress = (id: string) => {
    router.push({ pathname: '/(tabs)/events/[id]', params: { id } });
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard event={item} onPress={() => handleEventPress(item.id)} />
      )}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
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
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  separator: {
    height: 0,
  },
  sectionSeparator: {
    height: 8,
  },
});
