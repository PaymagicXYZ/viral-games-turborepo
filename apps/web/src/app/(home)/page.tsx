import MarketGroupsList from './components/MarketsGroupsList';
import MarketGroupsOverview from './components/MarketsGroupOverview';
import MarketGroupsTags from './components/MarketGroupsTags';
import { Suspense } from 'react';

export default function MarketsPage() {
  return (
    <main className='mt-14 space-y-14'>
      <Suspense>
        <MarketGroupsOverview />
      </Suspense>
      <div className='space-y-8'>
        <Suspense>
          <MarketGroupsTags />
        </Suspense>
        <Suspense>
          <MarketGroupsList />
        </Suspense>
      </div>
    </main>
  );
}
