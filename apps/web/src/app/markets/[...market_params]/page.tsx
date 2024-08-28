import { getMarketGroup } from '@/lib/services/MarketService';
import { Suspense } from 'react';
import MarketGroupDetails from './components/details/MarketGroupDetails';
import MarketExchange from './components/exchange/MarketExchange';
import LottieLoading from '@/components/ui/lottie-loading';

type MarketPageProps = {
  params: {
    market_params: Array<string>;
  };
};

export default async function MarketPage({ params }: MarketPageProps) {
  const [provider, identifier] = params.market_params;
  const marketGroup = await getMarketGroup({ identifier, provider });

  return (
    <main className='mt-10 flex flex-col-reverse gap-10 lg:min-h-[1041px] lg:flex-row'>
      <Suspense
        fallback={
          <div className='h-[200px] w-full'>
            <LottieLoading />
          </div>
        }
      >
        <MarketGroupDetails marketGroup={marketGroup} />
      </Suspense>
      <Suspense fallback={<LottieLoading />}>
        <MarketExchange markets={marketGroup.data} provider={provider} />
      </Suspense>
    </main>
  );
}
