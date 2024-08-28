'use client';

import { PropsWithChildren } from 'react';
import PrivyProvider from './PrivyProvider';
import ReactQueryProvider from './ReactQueryProvider';
import WagmiProvider from './WagmiProvider';
import { PriceOracleProvider } from './PriceProvider';
import { BalanceServiceProvider } from './BalanceProvider';
import { HistoryServiceProvider } from './HistoryProvider';
import { TradingServiceProvider } from './TradingProvider';
import { PostHogProvider } from './PosthogProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <PostHogProvider>
      <ReactQueryProvider>
        <PrivyProvider>
          <WagmiProvider>
            <PriceOracleProvider>
              <BalanceServiceProvider>
                <HistoryServiceProvider>
                  <TradingServiceProvider>{children}</TradingServiceProvider>
                </HistoryServiceProvider>
              </BalanceServiceProvider>
            </PriceOracleProvider>
          </WagmiProvider>
        </PrivyProvider>
      </ReactQueryProvider>
    </PostHogProvider>
  );
}
