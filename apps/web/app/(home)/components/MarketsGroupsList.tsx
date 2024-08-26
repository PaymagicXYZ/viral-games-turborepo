'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import LottieLoading from '@/components/ui/lottie-loading';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketGroups } from '@/lib/services/MarketService';
import { MarketGroupCardResponse } from '@/lib/types/markets';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function MarketGroupsList() {
  const [filter] = useQueryState('filter');
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useMarketGroups();

  const dataLength =
    data?.pages.reduce((counter, page) => {
      return counter + page.markets.length;
    }, 0) ?? 0;

  const marketGroups = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page.markets)
        .sort((a, b) => {
          // Check for specific IDs first
          const specialIds = [
            '0x6eb23e842B10D243eE3a9a2663e8E599bC98E198',
            '0x9fBb8A757F1b973C65A96c964F648814Ad8D73B7',
          ];
          if (specialIds.includes(a.slug) || specialIds.includes(a.slug))
            return -1;
          if (specialIds.includes(b.slug) || specialIds.includes(b.slug))
            return 1;

          // Then sort by provider
          if (a.provider === 'limitless' && b.provider !== 'limitless')
            return -1;
          if (a.provider !== 'limitless' && b.provider === 'limitless')
            return 1;

          return 0;
        }) || []
    );
  }, [data?.pages]);

  const filteredMarketsGroups = useMemo(() => {
    if (!filter) {
      return marketGroups; // Return all markets groups if no filter is selected
    }

    return marketGroups.filter((market: MarketGroupCardResponse) => {
      if (!market.category) {
        return false;
      }

      return market.category.includes(filter.toLowerCase());
    });
  }, [marketGroups, filter]);

  if (isLoading) {
    return (
      <div className='h-[20px]'>
        <LottieLoading />
      </div>
    );
  }

  const loadMore = () => {
    if (!isFetching && hasNextPage) {
      fetchNextPage();
    }
  };

  if (!marketGroups.length) {
    return <Label>No data</Label>;
  }

  return (
    <InfiniteScroll
      dataLength={dataLength}
      next={loadMore}
      hasMore={hasNextPage}
      loader={<Label>Loading...</Label>}
    >
      <div className='grid grid-cols-1 gap-4 pb-4 pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {filteredMarketsGroups.map((marketGroup, idx) => (
          <MarketGroupItem key={idx} marketGroup={marketGroup} />
        ))}
      </div>
    </InfiniteScroll>
  );
}

type MarketGroupItemProps = {
  marketGroup: MarketGroupCardResponse;
};

function MarketGroupItem({ marketGroup }: MarketGroupItemProps) {
  const router = useRouter();

  const openMarketWithPreselectedStrategy = ({
    outcomeIndex,
  }: {
    outcomeIndex: number;
  }) => {
    router.push(
      `/markets/${marketGroup.provider}/${marketGroup.slug}?strategy=buy&outcome_index=${outcomeIndex}`,
    );
  };

  const isMarketsGroup = marketGroup.markets.length > 1;

  return (
    <div className='flex h-full w-full flex-col border-2 border-black p-4 shadow-sm'>
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
        <div className='mb-4 h-[64px] '>
          <Label className='line-clamp-3 flex-grow cursor-pointer text-sm'>
            {marketGroup.title}
          </Label>
        </div>

        {!isMarketsGroup ? (
          <MarketView
            openMarketWithPreselectedStrategy={
              openMarketWithPreselectedStrategy
            }
          />
        ) : (
          <div className='h-[100px] overflow-auto'>
            {marketGroup.markets.map((market) => (
              <MarketView
                key={market.id}
                title={market.title}
                openMarketWithPreselectedStrategy={
                  openMarketWithPreselectedStrategy
                }
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
  openMarketWithPreselectedStrategy: ({
    outcomeIndex,
  }: {
    outcomeIndex: number;
  }) => void;
};

const MarketView: React.FC<MarketViewProps> = ({
  title,
  openMarketWithPreselectedStrategy,
}) => (
  <div className='flex flex-1 flex-col justify-end gap-2'>
    <Label className='line-clamp-3 text-[10px]'>{title}</Label>
    <div className='flex items-center gap-2 overflow-scroll pb-2 pr-1'>
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openMarketWithPreselectedStrategy({ outcomeIndex: 0 });
        }}
        className='w-full'
      >
        Yes
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openMarketWithPreselectedStrategy({ outcomeIndex: 1 });
        }}
        className='w-full'
      >
        No
      </Button>
    </div>
  </div>
);
