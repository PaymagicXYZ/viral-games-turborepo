import { Label } from '@/components/ui/label';
import LinkButton from '@/components/ui/link-button';
import { MarketGroupCardResponse } from '@/lib/types/markets';
import Image from 'next/image';
import { fetchMarkets } from './MarketsGroupsList';

export default async function MarketGroupsOverview() {
  const data = await fetchMarkets();

  const marketGroups =
    data?.markets.sort((a, b) => {
      // Check for specific IDs first
      const specialIds = [
        '0x6eb23e842B10D243eE3a9a2663e8E599bC98E198',
        '0x0e03eDc2A0ba38E803DaD62b31b6e6A2f4b216cc',
        '0x9fBb8A757F1b973C65A96c964F648814Ad8D73B7',
      ];
      if (specialIds.includes(a.slug) || specialIds.includes(a.slug)) return -1;
      if (specialIds.includes(b.slug) || specialIds.includes(b.slug)) return 1;

      // Then sort by provider
      if (a.provider === 'limitless' && b.provider !== 'limitless') return -1;
      if (a.provider !== 'limitless' && b.provider === 'limitless') return 1;

      return 0;
    }) || [];

  return (
    <section className='hidden h-[208px] overflow-x-auto md:block'>
      <div className='flex gap-7'>
        {marketGroups.map((marketGroup, idx) => (
          <MarketGroup key={idx} marketGroup={marketGroup} />
        ))}
      </div>
    </section>
  );
}

type MarketGroupProps = {
  marketGroup: MarketGroupCardResponse;
};

function MarketGroup({ marketGroup }: MarketGroupProps) {
  return (
    <div className='flex h-[400px] w-[270px] flex-shrink-0 flex-col-reverse items-center gap-4 border-2 border-black p-5 shadow-sm md:h-[188px] md:w-[505px] md:flex-row'>
      <div className='flex h-full flex-col justify-between gap-4'>
        <Label className='line-clamp-2 text-sm'>{marketGroup.title}</Label>
        <Image
          src={`/${marketGroup.provider}.svg`}
          alt='provider-logo'
          width={27}
          height={27}
        />
        <LinkButton
          href={`/markets/${marketGroup.provider}/${marketGroup.slug}?market_index=0`}
          className='w-full md:w-[132px]'
        >
          Bet Now
        </LinkButton>
      </div>
      <div className='flex-none'>
        <div className='relative h-48 w-56 md:size-36'>
          <Image
            src={marketGroup.imageUrl ?? '/market-thumbnail.svg'}
            alt='market-image'
            fill
            className='rounded-sm object-cover'
            sizes='100vw'
          />
        </div>
      </div>
    </div>
  );
}
