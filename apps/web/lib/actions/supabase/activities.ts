'use server';

import { env } from '@/lib/config/env';
import { supabaseClient } from '@/lib/config/supabaseClient';
import { Activity } from '@/src/app/api/activity/route';
import { Address } from 'viem';

export async function insertActivity({ activity }: { activity: Activity }) {
  const url = `${env.NEXT_PUBLIC_WEB_APP_API_URL}/activity`;
  const options: RequestInit = {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.WEB_APP_API_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activity),
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Failed to insert activity`);
  }

  const data = await response.json();

  return data;
}

export async function fetchActivities() {
  const { data, error } = await supabaseClient
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch activities');
  }

  return data;
}

export async function getUserActivities({ address }: { address: Address }) {
  const { data, error } = await supabaseClient
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .eq('user_address', address.toLowerCase());

  if (error) {
    throw new Error('Failed to user fetch activities');
  }

  return data;
}
