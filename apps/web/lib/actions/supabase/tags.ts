'use server';

import { supabaseClient } from '@/lib/config/supabaseClient';
import { unstable_cache as cache } from 'next/cache';

export const getTags = cache(
  async () => {
    const { data, error } = await supabaseClient
      .from('tags')
      .select('*')
      .order('index');

    if (error) {
      throw new Error('Failed to fetch tags');
    }

    return data;
  },
  ['tags'],
  { revalidate: 60 },
);
