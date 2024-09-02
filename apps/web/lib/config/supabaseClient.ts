import { createClient } from '@supabase/supabase-js';
import type { Database } from '@repo/shared-types';
import { env } from './env';

export const supabaseClient = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);
