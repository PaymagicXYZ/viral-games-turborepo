'use server';

import { supabaseClient } from '@/lib/config/supabaseClient';

export async function getTags() {
  const { data, error } = await supabaseClient
    .from('tags')
    .select('*')
    .order('index');

  if (error) {
    throw new Error('Failed to fetch tags');
  }

  return data;
}
