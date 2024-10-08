import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@repo/shared-types';
import { env } from './env';

export const supabaseBrowserClient = createBrowserClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_KEY,
);
