import MarketGroupsList from './components/MarketsGroupsList';
import MarketGroupsOverview from './components/MarketsGroupOverview';
import MarketGroupsTags from './components/MarketGroupsTags';
import { Optional } from '@/lib/types';
import { Suspense } from 'react';
import MarketsGroupOverviewLoadingSkeleton from './components/loading-skeletons/MarketsGroupOverviewLoadingSkeleton';
import MarketGroupsListLoadingSkeleton from './components/loading-skeletons/MarketGroupsListLoadingSkeleton';
import MarketGroupsTagsLoadingSkeleton from './components/loading-skeletons/MarketGroupsTagsLoadingSkeleton';

type MarketPageProps = {
  searchParams: {
    filter: Optional<string>;
  };
};

export default function MarketsPage({
  searchParams: { filter },
}: MarketPageProps) {
  return (
    <main className='mt-14 space-y-14'>
      <Suspense fallback={<MarketsGroupOverviewLoadingSkeleton />}>
        <MarketGroupsOverview />
      </Suspense>
      <div className='space-y-8'>
        <Suspense fallback={<MarketGroupsTagsLoadingSkeleton />}>
          <MarketGroupsTags filter={filter} />
        </Suspense>
        <Suspense fallback={<MarketGroupsListLoadingSkeleton />}>
          <MarketGroupsList filter={filter} />
        </Suspense>
      </div>
    </main>
  );
}
