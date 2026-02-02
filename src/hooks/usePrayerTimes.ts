import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/src/lib/supabase';
import { PrayerTime } from '@/src/types/database';
import { parseTimeToMinutes } from '@/src/lib/utils';

interface UsePrayerTimesResult {
  prayerTimes: PrayerTime[];
  nextPrayer: PrayerTime | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function usePrayerTimes(): UsePrayerTimesResult {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate next prayer based on current time
  const nextPrayer = useMemo(() => {
    if (prayerTimes.length === 0) return null;

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const isFriday = currentTime.getDay() === 5;

    // Filter prayers for next prayer calculation
    // Jummah only counts on Fridays
    const eligiblePrayers = prayerTimes.filter((prayer) => {
      if (prayer.prayer_name === 'Jummah' && !isFriday) {
        return false;
      }
      return true;
    });

    // Find first prayer whose iqama_time is after current time
    const upcoming = eligiblePrayers.find((prayer) => {
      const prayerMinutes = parseTimeToMinutes(prayer.iqama_time);
      return prayerMinutes > nowMinutes;
    });

    // If all prayers passed, return first eligible prayer (tomorrow's Fajr conceptually)
    return upcoming ?? eligiblePrayers[0] ?? null;
  }, [prayerTimes, currentTime]);

  const fetchPrayerTimes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('prayer_times')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (queryError) {
      setError('Unable to load prayer times. Please try again.');
      console.error('Supabase error:', queryError);
    } else {
      setPrayerTimes(data ?? []);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  // Real-time subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel('prayer_times_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prayer_times' },
        () => {
          fetchPrayerTimes();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchPrayerTimes]);

  // Update current time every minute for next prayer calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  return {
    prayerTimes,
    nextPrayer,
    isLoading,
    error,
    refetch: fetchPrayerTimes,
    lastUpdated,
  };
}
