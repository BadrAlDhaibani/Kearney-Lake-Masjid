import { StyleSheet, Text, View } from 'react-native';
import { PrayerTime } from '@/src/types/database';
import { formatTime12Hour } from '@/src/lib/utils';
import { colors } from '@/src/constants/colors';

interface PrayerTimeCardProps {
  prayer: PrayerTime;
  isNext: boolean;
}

export function PrayerTimeCard({ prayer, isNext }: PrayerTimeCardProps) {
  const containerStyle = [
    styles.container,
    isNext && styles.containerHighlighted,
  ];

  const accessibilityLabel = prayer.adhan_time
    ? `${prayer.prayer_name}, Adhan at ${formatTime12Hour(prayer.adhan_time)}, Iqama at ${formatTime12Hour(prayer.iqama_time)}`
    : `${prayer.prayer_name}, Iqama at ${formatTime12Hour(prayer.iqama_time)}`;

  return (
    <View
      style={containerStyle}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      testID="prayer-card"
    >
      <View style={styles.header}>
        <Text style={[styles.prayerName, isNext && styles.prayerNameHighlighted]}>
          {prayer.prayer_name}
        </Text>
        {isNext && (
          <View style={styles.nextBadge}>
            <Text style={styles.nextBadgeText}>Next</Text>
          </View>
        )}
      </View>

      <View style={styles.timesRow}>
        {prayer.adhan_time && (
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Adhan</Text>
            <Text style={[styles.timeValue, isNext && styles.timeValueHighlighted]}>
              {formatTime12Hour(prayer.adhan_time)}
            </Text>
          </View>
        )}
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Iqama</Text>
          <Text style={[styles.timeValue, isNext && styles.timeValueHighlighted]}>
            {formatTime12Hour(prayer.iqama_time)}
          </Text>
        </View>
      </View>

      {prayer.notes && (
        <Text style={styles.notes}>{prayer.notes}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerHighlighted: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryLight,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  prayerNameHighlighted: {
    color: colors.primary,
  },
  nextBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nextBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  timesRow: {
    flexDirection: 'row',
    gap: 24,
  },
  timeBlock: {
    minWidth: 80,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  timeValueHighlighted: {
    color: colors.primary,
  },
  notes: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
