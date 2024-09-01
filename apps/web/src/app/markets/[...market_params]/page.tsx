import { Suspense } from 'react';
import MarketGroupDetails from './components/details/MarketGroupDetails';
import { MarketDetailsLoadingSkeleton } from './components/details/MarketDetailsLoadingSkeleton';
import MarketExchange from './components/exchange/MarketExchange';
import { getMarketGroup } from '@/lib/services/MarketService';
import { fetchMarkets } from '@/lib/actions/viral-games-api';

export async function generateStaticParams() {
  const data = await fetchMarkets();

  return data.markets.map((market) => ({
    market_params: [market.provider, market.slug],
  }));
}

type MarketPageProps = {
  params: {
    market_params: Array<string>;
  };
};

export default async function MarketPage({ params }: MarketPageProps) {
  const [provider, marketIdentifier] = params.market_params;

  const marketGroupAsync = getMarketGroup({
    provider,
    identifier: marketIdentifier,
  });

  return (
    <main className='mt-10 flex flex-col-reverse gap-10 lg:min-h-[1041px] lg:flex-row'>
      <Suspense
        key={`${provider}-${marketIdentifier}`}
        fallback={<MarketDetailsLoadingSkeleton />}
      >
        <MarketGroupDetails
          marketGroupAsync={marketGroupAsync}
          marketIdentifier={marketIdentifier}
        />
      </Suspense>
      <Suspense>
        <MarketExchange />
      </Suspense>
    </main>
  );
}
