'use client';

import { PropsWithChildren } from 'react';
import PrivyProvider from './PrivyProvider';
import ReactQueryProvider from './ReactQueryProvider';
import WagmiProvider from './WagmiProvider';
import { PriceOracleProvider } from './PriceProvider';
import { BalanceServiceProvider } from './BalanceProvider';
import { HistoryServiceProvider } from './HistoryProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ReactQueryProvider>
      <PrivyProvider>
        <WagmiProvider>
          <PriceOracleProvider>
            <BalanceServiceProvider>
              <HistoryServiceProvider>{children}</HistoryServiceProvider>
            </BalanceServiceProvider>
          </PriceOracleProvider>
        </WagmiProvider>
      </PrivyProvider>
    </ReactQueryProvider>
  );
}
