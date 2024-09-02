'use client';

import Web3AuthConnectorInstance from '@/lib/config/web3Auth';
// import {
//   WagmiProvider as NextWagmiProvider,
//   createConfig,
// } from '@privy-io/wagmi';
import { WagmiProvider as NextWagmiProvider, createConfig } from 'wagmi';
import type { ReactNode } from 'react';
import { http } from 'viem';
import { base } from 'viem/chains';
type WagmiProviderProps = {
  children: ReactNode;
};

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    // walletConnect({
    //   projectId: "3314f39613059cb687432d249f1658d2",
    //   showQrModal: true,
    // }),
    Web3AuthConnectorInstance([base]),
  ],
});

export default function WagmiProvider({ children }: WagmiProviderProps) {
  return <NextWagmiProvider config={wagmiConfig}>{children}</NextWagmiProvider>;
}
