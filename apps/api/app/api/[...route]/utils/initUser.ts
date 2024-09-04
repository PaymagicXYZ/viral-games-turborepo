import { supabase } from './supabase';

export const initUser = async (provider: string, userId: string) => {
  const user = await getUser({ userId, provider });

  // if user exists -> return it
  if (user) {
    return user;
  }

  // else create it
  const { data, error } = await supabase
    .from('temp_player')
    .insert([{ userId, provider, balance: 100 }])
    .select()
    .single();

  if (error) {
    return null;
  }

  return data as any;
};

export const getUser = async ({
  userId,
  provider,
}: {
  userId: string;
  provider: string;
}) => {
  const { data, error } = await supabase
    .from('temp_player')
    .select('*')
    .eq('userId', userId)
    .eq('provider', provider)
    .single();

  if (error) {
    throw new Error('Failed to fetch user');
  }

  return data;
};
