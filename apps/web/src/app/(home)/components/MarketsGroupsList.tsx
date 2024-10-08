'use client';

import { useInView } from 'react-intersection-observer';
import { Label } from '@/components/ui/label';
import { useMarketGroups } from '@/lib/services/MarketService';
import { Optional } from '@/lib/types';
import { MarketGroupCardResponse } from '@/lib/types/markets';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import MarketGroupsListLoadingSkeleton from './loading-skeletons/MarketGroupsListLoadingSkeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type MarketGroupsListProps = {
  filter: Optional<string>;
};

export default function MarketGroupsList({ filter }: MarketGroupsListProps) {
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
            '0x0e03eDc2A0ba38E803DaD62b31b6e6A2f4b216cc',
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
    return <MarketGroupsListLoadingSkeleton />;
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
}) => {
  const router = useRouter();

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const yesOutcomeHref = `/markets/${provider}/${slug}?strategy=buy&market_index=${marketIndex}&outcome_index=0`;
  const noOutcomeHref = `/markets/${provider}/${slug}?strategy=buy&market_index=${marketIndex}&outcome_index=1`;

  useEffect(() => {
    if (!inView) {
      return;
    }

    router.prefetch(`/markets/${provider}/${slug}`);
  }, [inView, router, provider, slug, marketIndex]);

  return (
    <div
      ref={ref}
      className={clsx('flex flex-col', {
        'h-full justify-between': isSingleView,
        'h-[45px]': !isSingleView,
      })}
    >
      <div
        className={clsx('flex', {
          'mt-auto gap-2': isSingleView,
          'items-center justify-between pr-2': !isSingleView,
        })}
      >
        {isSingleView ? (
          <>
            <Button
              onClick={(e) => {
                e.preventDefault();
                router.push(yesOutcomeHref);
              }}
              className='h-[29px] w-full'
            >
              Yes
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                router.push(noOutcomeHref);
              }}
              className='h-[29px] w-full'
            >
              No
            </Button>
          </>
        ) : (
          <>
            <div className='flex-grow overflow-hidden'>
              <Label className='line-clamp-1 text-[12px] text-gray-500'>
                {title}
              </Label>
            </div>
            <div className='ml-2 flex gap-2'>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  router.push(yesOutcomeHref);
                }}
                className='h-[29px] w-[79px]'
              >
                Yes
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  router.push(noOutcomeHref);
                }}
                className='h-[29px] w-[79px]'
              >
                No
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
