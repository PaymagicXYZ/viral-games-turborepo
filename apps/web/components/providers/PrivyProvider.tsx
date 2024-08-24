'use client';

import { env } from '@/lib/config/env';
import type { PrivyClientConfig } from '@privy-io/react-auth';
import { PrivyProvider as NextPrivyProvider } from '@privy-io/react-auth';
import type { PropsWithChildren } from 'react';

export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: true,
    noPromptOnSignature: false
  },
  loginMethods: ['wallet'],
  appearance: {
    showWalletLoginFirst: true
  }
};

export default function PrivyProvider({ children }: PropsWithChildren) {
  return (
    <NextPrivyProvider
      appId={env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={privyConfig}
    >
      {children}
    </NextPrivyProvider>
  );
}
