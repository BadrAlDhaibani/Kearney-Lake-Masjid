import { StyleSheet, Text, View } from 'react-native';
import { PrayerTime } from '@/src/types/database';
import { formatTime12Hour } from '@/src/lib/utils';

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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  containerHighlighted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
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
    color: '#212121',
  },
  prayerNameHighlighted: {
    color: '#1B5E20',
  },
  nextBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nextBadgeText: {
    color: '#fff',
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
    color: '#757575',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
  },
  timeValueHighlighted: {
    color: '#1B5E20',
  },
  notes: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
