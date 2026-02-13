import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { ContactCategory } from '@/src/types/database';

interface UseContactCategoriesResult {
  categories: ContactCategory[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useContactCategories(): UseContactCategoriesResult {
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('contact_categories')
      .select('*')
      .order('display_order');

    if (queryError) {
      setError('Unable to load contact information. Please try again.');
      console.error('Supabase error:', queryError);
    } else {
      setCategories(data ?? []);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
}
