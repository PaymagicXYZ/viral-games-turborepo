import { Suspense } from 'react';
import MarketGroupDetails from './components/details/MarketGroupDetails';
import { MarketDetailsLoadingSkeleton } from './components/details/MarketDetailsLoadingSkeleton';
import MarketExchange from './components/exchange/MarketExchange';

type MarketPageProps = {
  params: {
    market_params: Array<string>;
  };
};

export default function MarketPage({ params }: MarketPageProps) {
  const [provider, marketIdentifier] = params.market_params;

  return (
    <main className='mt-10 flex flex-col-reverse gap-10 lg:min-h-[1041px] lg:flex-row'>
      <Suspense
        key={`${provider}-${marketIdentifier}`}
        fallback={<MarketDetailsLoadingSkeleton />}
      >
        <MarketGroupDetails
          provider={provider}
          marketIdentifier={marketIdentifier}
        />
      </Suspense>
      <MarketExchange />
    </main>
  );
}
