import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Announcement } from '@/src/types/database';

interface UseAnnouncementsResult {
  announcements: Announcement[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useAnnouncements(): UseAnnouncementsResult {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (queryError) {
      setError('Unable to load announcements. Please try again.');
      console.error('Supabase error:', queryError);
    } else {
      setAnnouncements(data ?? []);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Real-time subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel('announcements_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          // Only refresh if it affects published announcements
          if (
            payload.eventType === 'DELETE' ||
            (payload.new as Announcement)?.is_published === true ||
            (payload.old as Announcement)?.is_published === true
          ) {
            fetchAnnouncements();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchAnnouncements]);

  return {
    announcements,
    isLoading,
    error,
    refetch: fetchAnnouncements,
    lastUpdated,
  };
}
