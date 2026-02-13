import { StyleSheet, Text, View } from 'react-native';
import { PrayerTime } from '@/src/types/database';
import { formatTime12Hour } from '@/src/lib/utils';
import { colors } from '@/src/constants/colors';

interface NextPrayerBannerProps {
  prayer: PrayerTime | null;
}

export function NextPrayerBanner({ prayer }: NextPrayerBannerProps) {
  if (!prayer) {
    return null;
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Next prayer is ${prayer.prayer_name} at ${formatTime12Hour(prayer.iqama_time)}`}
    >
      <Text style={styles.label}>Next Prayer</Text>
      <Text style={styles.prayerName}>{prayer.prayer_name}</Text>
      <Text style={styles.time}>{formatTime12Hour(prayer.iqama_time)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: colors.whiteSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  prayerName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  time: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.primaryTint,
  },
});
