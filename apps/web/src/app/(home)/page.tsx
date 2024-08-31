import MarketGroupsList from './components/MarketsGroupsList';
import MarketGroupsOverview from './components/MarketsGroupOverview';
import MarketGroupsTags from './components/MarketGroupsTags';
import { Optional } from '@/lib/types';

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
      <MarketGroupsOverview />
      <div className='space-y-8'>
        <MarketGroupsTags filter={filter} />
        <MarketGroupsList filter={filter} />
      </div>
    </main>
  );
}
