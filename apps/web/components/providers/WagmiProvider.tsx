'use client';

import {
  WagmiProvider as NextWagmiProvider,
  createConfig
} from '@privy-io/wagmi';
import type { ReactNode } from 'react';
import { http } from 'viem';
import { base } from 'viem/chains';

type WagmiProviderProps = {
  children: ReactNode;
};

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http()
  }
});

export default function WagmiProvider({ children }: WagmiProviderProps) {
  return <NextWagmiProvider config={wagmiConfig}>{children}</NextWagmiProvider>;
}
