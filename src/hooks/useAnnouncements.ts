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

export function useAnnouncements(includeUnpublished = false): UseAnnouncementsResult {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let query = supabase.from('announcements').select('*');

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error: queryError } = await query.order(
      includeUnpublished ? 'created_at' : 'published_at',
      { ascending: false }
    );

    if (queryError) {
      setError('Unable to load announcements. Please try again.');
      console.error('Supabase error:', queryError);
    } else {
      setAnnouncements(data ?? []);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, [includeUnpublished]);

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
