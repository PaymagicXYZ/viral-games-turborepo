import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    WEB_APP_API_SECRET: z.string(),
    CRON_SECRET: z.string(),
    NEYNAR_API_KEY: z.string(),
    VIRAL_GAMES_BE_API_SECRET: z.string(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_WEB_APP_BASE_URL: z.string().url(),
    NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
    NEXT_PUBLIC_VIRAL_GAMES_BE_API: z.string().url(),
    NEXT_PUBLIC_WEB_APP_API_URL: z.string().url(),
    NEXT_PUBLIC_LIMITLESS_API_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID: z.string(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    NEXT_PUBLIC_WEB_APP_BASE_URL: process.env.NEXT_PUBLIC_WEB_APP_BASE_URL,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    VIRAL_GAMES_BE_API_SECRET: process.env.VIRAL_GAMES_BE_API_SECRET,
    NEXT_PUBLIC_VIRAL_GAMES_BE_API: process.env.NEXT_PUBLIC_VIRAL_GAMES_BE_API,
    NEXT_PUBLIC_WEB_APP_API_URL: process.env.NEXT_PUBLIC_WEB_APP_API_URL,
    NEXT_PUBLIC_LIMITLESS_API_URL: process.env.NEXT_PUBLIC_LIMITLESS_API_URL,
    NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID:
      process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID,

    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    WEB_APP_API_SECRET: process.env.WEB_APP_API_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
  },
});
