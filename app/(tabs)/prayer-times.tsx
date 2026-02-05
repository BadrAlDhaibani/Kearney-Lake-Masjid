import { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrayerTimes } from '@/src/hooks/usePrayerTimes';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { NextPrayerBanner } from '@/src/components/prayer/NextPrayerBanner';
import { PrayerTimesList } from '@/src/components/prayer/PrayerTimesList';
import { colors } from '@/src/constants/colors';

export default function PrayerTimesScreen() {
  const { prayerTimes, nextPrayer, isLoading, error, refetch } = usePrayerTimes();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading && prayerTimes.length === 0) {
    return <LoadingSpinner message="Loading prayer times..." />;
  }

  if (error && prayerTimes.length === 0) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Couldn't Load Prayer Times"
        message={error}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  if (prayerTimes.length === 0) {
    return (
      <EmptyState
        icon="time-outline"
        title="No Prayer Times Available"
        message="Prayer times will appear here once they are added."
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <NextPrayerBanner prayer={nextPrayer} />
      <PrayerTimesList
        prayers={prayerTimes}
        nextPrayerId={nextPrayer?.id ?? null}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
