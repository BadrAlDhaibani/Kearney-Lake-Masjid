import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Event } from '@/src/types/database';

interface UseEventsResult {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useEvents(includeUnpublished = false): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let query = supabase.from('events').select('*');

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    // Only fetch upcoming events (start_time >= now)
    const now = new Date().toISOString();
    query = query.gte('start_time', now);

    const { data, error: queryError } = await query.order('start_time', {
      ascending: true,
    });

    if (queryError) {
      setError('Unable to load events. Please try again.');
      console.error('Supabase error:', queryError);
    } else {
      setEvents(data ?? []);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, [includeUnpublished]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Real-time subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel('events_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          // Only refresh if it affects published events
          if (
            payload.eventType === 'DELETE' ||
            (payload.new as Event)?.is_published === true ||
            (payload.old as Event)?.is_published === true
          ) {
            fetchEvents();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
    lastUpdated,
  };
}
