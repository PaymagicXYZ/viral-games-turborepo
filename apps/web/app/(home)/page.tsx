import MarketGroupsList from './components/MarketsGroupsList';
import MarketGroupsOverview from './components/MarketsGroupOverview';
import MarketGroupsTags from './components/MarketGroupsTags';

export default function MarketsPage() {
  return (
    <main className='mt-14 space-y-14'>
      <MarketGroupsOverview />
      <div className='space-y-8'>
        <MarketGroupsTags />
        <MarketGroupsList />
      </div>
    </main>
  );
}
