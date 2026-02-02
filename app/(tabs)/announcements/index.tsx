import { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnnouncements } from '@/src/hooks/useAnnouncements';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { AnnouncementsList } from '@/src/components/announcements/AnnouncementsList';

export default function AnnouncementsScreen() {
  const { announcements, isLoading, error, refetch } = useAnnouncements();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Loading state (initial load only)
  if (isLoading && announcements.length === 0) {
    return <LoadingSpinner message="Loading announcements..." />;
  }

  // Error state (only if no cached data)
  if (error && announcements.length === 0) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Couldn't Load Announcements"
        message={error}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  // Empty state (no announcements)
  if (announcements.length === 0) {
    return (
      <EmptyState
        icon="newspaper-outline"
        title="No Announcements Yet"
        message="Check back soon for updates from the mosque."
      />
    );
  }

  // Success state
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <AnnouncementsList
        announcements={announcements}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
