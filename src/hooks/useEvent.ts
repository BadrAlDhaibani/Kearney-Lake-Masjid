import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Event } from '@/src/types/database';

interface UseEventResult {
  event: Event | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvent(id: string | undefined): UseEventResult {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      setError('Event ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        setError('Event not found');
      } else {
        setError('Unable to load event. Please try again.');
        console.error('Supabase error:', queryError);
      }
    } else {
      setEvent(data);
    }

    setIsLoading(false);
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Real-time subscription for updates to this specific event
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`event_${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${id}`,
        },
        () => {
          fetchEvent();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id, fetchEvent]);

  return {
    event,
    isLoading,
    error,
    refetch: fetchEvent,
  };
}
