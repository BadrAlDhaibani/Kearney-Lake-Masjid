import { useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '@/src/hooks/useEvents';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { EventsList } from '@/src/components/events/EventsList';
import { colors } from '@/src/constants/colors';

export default function EventsScreen() {
  const { events, isLoading, error, refetch } = useEvents();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Loading state (initial load only)
  if (isLoading && events.length === 0) {
    return <LoadingSpinner message="Loading events..." />;
  }

  // Error state (only if no cached data)
  if (error && events.length === 0) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Couldn't Load Events"
        message={error}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  // Empty state (no upcoming events)
  if (events.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="No Upcoming Events"
        message="Check back soon for community events and gatherings."
      />
    );
  }

  // Success state
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <EventsList
        events={events}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
