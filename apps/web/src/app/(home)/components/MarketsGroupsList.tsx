import { Label } from '@/components/ui/label';
import LinkButton from '@/components/ui/link-button';
import { fetchMarkets } from '@/lib/actions/viral-games-api';
import { env } from '@/lib/config/env';
import { LIMIT_PER_PAGE } from '@/lib/constants';
import { Optional } from '@/lib/types';
import {
  MarketGroupCardResponse,
  PaginatedMarketResponse,
} from '@/lib/types/markets';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

type MarketGroupsListProps = {
  filter: Optional<string>;
};

export default async function MarketGroupsList({
  filter,
}: MarketGroupsListProps) {
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

  const filteredMarketsGroups = !filter
    ? marketGroups
    : marketGroups.filter((market: MarketGroupCardResponse) => {
        if (!market.category) {
          return false;
        }

        return market.category.includes(filter.toLowerCase());
      });

  return (
    <div className='grid grid-cols-1 gap-4 pb-4 pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {filteredMarketsGroups.map((marketGroup, idx) => (
        <MarketGroupItem key={idx} marketGroup={marketGroup} />
      ))}
    </div>
  );
}

type MarketGroupItemProps = {
  marketGroup: MarketGroupCardResponse;
};

function MarketGroupItem({ marketGroup }: MarketGroupItemProps) {
  const isMarketsGroup = marketGroup.markets.length > 1;

  return (
    <div className='flex h-[282px] w-full flex-col border-2 border-black p-4 shadow-sm'>
      <Link
        className='flex h-full flex-col'
        href={`/markets/${marketGroup.provider}/${marketGroup.slug}`}
      >
        <div className='mb-4'>
          <div className='relative flex w-full items-start justify-between'>
            <Image
              src={marketGroup.imageUrl ?? '/market-thumbnail.svg'}
              alt='market-image'
              className='h-[62px] w-[61px] rounded-sm object-cover'
              width={0}
              height={0}
              sizes='100vw'
            />
            <Image
              src={`/${marketGroup.provider}.svg`}
              alt='provider-logo'
              width={27}
              height={27}
            />
          </div>
        </div>
        <div className='mb-10 h-[64px]'>
          <Label className='line-clamp-3 flex-grow cursor-pointer text-sm'>
            {marketGroup.title}
          </Label>
        </div>

        {!isMarketsGroup ? (
          <MarketView
            isSingleView
            marketIndex={0}
            provider={marketGroup.provider}
            slug={marketGroup.slug}
          />
        ) : (
          <div className='h-[100px] overflow-auto'>
            {marketGroup.markets.map((market, marketIndex) => (
              <MarketView
                key={market.id}
                title={market.title}
                marketIndex={marketIndex}
                provider={marketGroup.provider}
                slug={marketGroup.slug}
              />
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}

type MarketViewProps = {
  title?: string;
  isSingleView?: boolean;
  marketIndex: number;
  provider: string;
  slug: string;
};

const MarketView: React.FC<MarketViewProps> = ({
  title,
  isSingleView,
  marketIndex,
  provider,
  slug,
}) => (
  <div
    className={clsx('flex flex-col', {
      'h-full justify-between': isSingleView,
      'h-[45px]': !isSingleView,
    })}
  >
    <div
      className={clsx('flex', {
        'mt-auto  gap-2': isSingleView,
        'items-center justify-between pr-2': !isSingleView,
      })}
    >
      {isSingleView ? (
        <>
          <LinkButton
            scroll
            href={`/markets/${provider}/${slug}?strategy=buy&market_index=${marketIndex}&outcome_index=0`}
            className='h-[29px] w-full'
          >
            Yes
          </LinkButton>
          <LinkButton
            scroll
            href={`/markets/${provider}/${slug}?strategy=buy&market_index=${marketIndex}&outcome_index=1`}
            className='h-[29px] w-full'
          >
            No
          </LinkButton>
        </>
      ) : (
        <>
          <div className='flex-grow overflow-hidden'>
            <Label className='line-clamp-1 text-[12px] text-gray-500'>
              {title}
            </Label>
          </div>
          <div className='ml-2 flex gap-2'>
            <LinkButton
              scroll
              className='h-[29px] w-[79px]'
              href={`/markets/${provider}/${slug}?strategy=buy&market_index=${marketIndex}&outcome_index=0`}
            >
              Yes
            </LinkButton>
            <LinkButton
              scroll
              href={`/markets/${provider}/${slug}?strategy=buy&market_index=${marketIndex}&outcome_index=1`}
              className='h-[29px] w-[79px]'
            >
              No
            </LinkButton>
          </div>
        </>
      )}
    </div>
  </div>
);
