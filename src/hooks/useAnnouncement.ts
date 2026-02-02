import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Announcement } from '@/src/types/database';

interface UseAnnouncementResult {
  announcement: Announcement | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnnouncement(id: string): UseAnnouncementResult {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncement = useCallback(async () => {
    if (!id) {
      setError('Invalid announcement ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        // Not found or not published
        setError('This announcement is no longer available.');
      } else {
        setError('Unable to load announcement. Please try again.');
      }
      console.error('Supabase error:', queryError);
    } else {
      setAnnouncement(data);
    }

    setIsLoading(false);
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  // Real-time subscription for this specific announcement
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`announcement_${id}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setError('This announcement has been removed.');
            setAnnouncement(null);
          } else if ((payload.new as Announcement)?.is_published === false) {
            setError('This announcement is no longer available.');
            setAnnouncement(null);
          } else {
            fetchAnnouncement();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id, fetchAnnouncement]);

  return {
    announcement,
    isLoading,
    error,
    refetch: fetchAnnouncement,
  };
}
