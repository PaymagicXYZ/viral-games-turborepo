'use client';

import { env } from '@/lib/config/env';
import posthog from 'posthog-js';
import { PostHogProvider as NextPostHogProvider } from 'posthog-js/react';
import { ReactNode } from 'react';

if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
) {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: `${window.location.origin}/ingest`,
    ui_host: 'https://app.posthog.com',
    capture_pageview: true,
  });
}

type PostHogProviderProps = { children: ReactNode };

export function PostHogProvider({ children }: PostHogProviderProps) {
  return <NextPostHogProvider client={posthog}>{children}</NextPostHogProvider>;
}
