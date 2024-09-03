'use client';

import Web3AuthConnectorInstance from '@/lib/config/web3Auth';
// import {
//   WagmiProvider as NextWagmiProvider,
//   createConfig,
// } from '@privy-io/wagmi';
import { WagmiProvider as NextWagmiProvider, createConfig } from 'wagmi';
import type { ReactNode } from 'react';
import { http } from 'viem';
// import { base } from 'viem/chains';
import { base } from 'wagmi/chains';
type WagmiProviderProps = {
  children: ReactNode;
};

export const wagmiConfig = createConfig({
  chains: [
    {
      ...base,
      blockExplorers: {
        default: {
          url: [base.blockExplorers.default.url],
        } as any,
      },
    },
  ],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    Web3AuthConnectorInstance([
      {
        ...base,
        blockExplorers: {
          default: {
            url: [base.blockExplorers.default.url],
          } as any,
        },
      },
    ]),
  ],
});

export default function WagmiProvider({ children }: WagmiProviderProps) {
  return <NextWagmiProvider config={wagmiConfig}>{children}</NextWagmiProvider>;
}
