'use client';

import { useMarketGroups } from '@/lib/services/MarketService';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebounce } from 'use-debounce';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useOutsideClick } from '@/lib/hooks/useOutsideClick';
import { MarketGroupCardResponse } from '@/lib/types/markets';

export default function MarketsSearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debounceSearchQuery] = useDebounce(searchQuery, 300);
  const [isFocused, setIsFocused] = useState(false);

  const closeSearch = () => {
    setIsFocused(false);
  };

  const containerRef = useOutsideClick(closeSearch);
  return (
    <>
      {isFocused && (
        <div className='relative w-full rounded-lg bg-gray-200 xl:w-[331px]' />
      )}
      <div
        ref={containerRef}
        className={`rounded-lg bg-white ${
          isFocused
            ? 'absolute left-0 mx-auto w-full'
            : 'relative w-full bg-gray-200 xl:w-[331px]'
        }`}
      >
        <MarketsSearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
        />
        {searchQuery && (
          <MarketsList debouncedSearchQuery={debounceSearchQuery} />
        )}
      </div>
    </>
  );
}

interface MarketsSearchInputProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  isFocused: boolean;
  setIsFocused: Dispatch<SetStateAction<boolean>>;
}

function MarketsSearchInput({
  searchQuery,
  setSearchQuery,
  isFocused,
  setIsFocused,
}: MarketsSearchInputProps) {
  const overlayStyles = `fixed inset-0 bg-neutral-950/95 z-10 transition-opacity h-full ${
    isFocused ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const resetState = () => {
    setSearchQuery('');
    setIsFocused(false);
  };

  return (
    <>
      <div
        className={overlayStyles}
        onClick={() => {
          if (isFocused) {
            resetState();
          }
        }}
      />
      <div
        className={`relative mx-auto ${
          isFocused ? 'w-[95%] xl:w-[627px]' : 'w-full xl:w-[331px]'
        }`}
      >
        <div className={`relative z-20 ${isFocused ? 'bg-white p-4' : ''}`}>
          <Search
            className={`absolute z-30 h-[26px] w-[26px] text-zinc-400 ${
              isFocused ? 'left-6 top-7' : 'left-2 top-3'
            }`}
          />

          <Input
            className='bg-gray-200 px-10 py-6'
            type='text'
            value={searchQuery}
            onFocus={handleFocus}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder='Search by market'
          />
        </div>
      </div>
    </>
  );
}

interface MarketsList {
  debouncedSearchQuery: string;
}

function MarketsList({ debouncedSearchQuery }: MarketsList) {
  const { data, isLoading } = useMarketGroups();

  const markets = useMemo(() => {
    return data?.pages.flatMap((page) => page.markets) || [];
  }, [data?.pages]);

  const filteredData = useMemo(() => {
    if (!markets) {
      return [];
    }

    if (!markets) return [];
    return markets.filter((market) =>
      market.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    );
  }, [markets, debouncedSearchQuery]);

  const renderLabel = () => {
    let labelText = isLoading
      ? 'Loading...'
      : filteredData.length && filteredData.length > 0
        ? `${filteredData.length} search results found`
        : `No results found`;

    return (
      <Label
        className={`my-auto px-4 font-medium leading-tight xl:text-base ${
          !isLoading && !filteredData.length
            ? 'text-center text-red-500'
            : 'text-gray-500'
        }`}
      >
        {labelText}
      </Label>
    );
  };

  return (
    <div className='absolute left-1/2 z-30 mx-auto h-[450px] w-[95%] -translate-x-1/2 bg-white pt-4 md:px-0 xl:h-[300px] xl:w-[627px]'>
      <div className='mx-auto h-[435px] w-[95%] overflow-y-auto rounded-lg border-zinc-800 xl:h-[285px] xl:w-[595px]'>
        <div className='mb-4'>{renderLabel()}</div>
        <div id='scrollable-markets-search-list' className='flex flex-col'>
          <InfiniteScroll
            dataLength={filteredData.length}
            next={() => {
              // if (!isFetching) {
              //   return fetchNextPage();
              // }
            }}
            className='mb-4 grid grid-cols-1 px-4'
            hasMore={false}
            loader={<Label>Loading...</Label>}
            scrollableTarget='scrollable-markets-search-list'
          >
            {filteredData.map((market, idx) => (
              <MarketItem key={idx} market={market} />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}

interface MarketItemProps {
  market: MarketGroupCardResponse;
}

function MarketItem({ market }: MarketItemProps) {
  return (
    <Link
      href={`/markets/${market.provider}/${market.slug}`}
      className='flex h-[94px] items-center gap-4'
    >
      <div className='flex-none'>
        <div className='relative h-[68px] w-[67px]'>
          <Image
            src={market.imageUrl ?? '/viral-game/market-thumbnail.svg'}
            fill
            className='rounded-sm object-cover'
            alt='market-image'
          />
        </div>
      </div>
      <div className='h-[63px]'>
        <Label className='line-clamp-3 cursor-pointer text-black'>
          {market.title}
        </Label>
      </div>
    </Link>
  );
}
