'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import LottieLoading from '@/components/ui/lottie-loading';
import useFetchActivitiesQuery, {
  useActivitiesSubscription,
} from '@/lib/hooks/react-query/subscriptions/activitiesSubscription';
import type { Tables } from '@/lib/types/supabase';
import { generateRandomGradient } from '@/lib/utils';
import { timeAgoFormatter, formatAddress } from '@/lib/utils/formatters';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAddress } from 'viem';
import { ActivityListLoadingSkeleton } from './ActivityListLoadingSkeleton';

export default function ActivityList() {
  const { activities, isLoading } = useFetchActivitiesQuery();
  useActivitiesSubscription();

  if (isLoading) {
    return <ActivityListLoadingSkeleton />;
  }

  return (
    <section>
      {activities?.length ? (
        <div className='h-[800px] space-y-10 overflow-scroll'>
          {activities?.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Label className='px-4 text-zinc-200'>Loading...</Label>
      )}
    </section>
  );
}

export function ActivityItem({
  item,
  withActions,
}: {
  item: Tables<'activities'>;
  withActions?: boolean;
}) {
  const randomGradient = generateRandomGradient();
  const buyOrSellLabel = item.strategy === 'buy' ? 'bought' : 'sold';
  const yesOrNoLabel = item.outcome_index === 0 ? 'Yes' : 'No';
  const router = useRouter();

  const isUserAddress =
    isAddress(item.user_address) ||
    (item.user_address.startsWith('eoa:') &&
      isAddress(item.user_address.slice(4)));

  const address = isUserAddress
    ? item.user_address.startsWith('eoa:')
      ? item.user_address.slice(4)
      : item.user_address
    : item.user_address;

  const isFreeBet = item.asset_ticker === 'USDV';

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-4'>
        <div className='flex-shrink-0'>
          {item.pfp ? (
            <Image
              src={item.pfp}
              alt='pfp'
              width={0}
              height={0}
              className='h-[44px] w-[44px] rounded-full object-cover'
              sizes='100vw'
            />
          ) : (
            <div
              className='h-[44px] w-[44px] rounded-full'
              style={{ background: randomGradient }}
            />
          )}
        </div>
        <div className='flex-grow'>
          {isUserAddress ? (
            <Link className='text-sm' href={`/profile/${address}`}>
              {item.ens ? item.ens : formatAddress(address)}{' '}
            </Link>
          ) : (
            <Label className='text-sm'>{item.user_address} </Label>
          )}

          <Label className='text-gray-500'>just {buyOrSellLabel} </Label>
          <Label>{yesOrNoLabel} </Label>
          <Label className='text-gray-500'>for </Label>
          <Link
            className='text-sm'
            href={`/markets/${item.provider}/${item.market_address}?strategy=${item.strategy}&outcome_index=${item.outcome_index}&is_free_bet=${isFreeBet}`}
          >
            {item.market_title}{' '}
          </Link>
          <Label className='text-gray-500'>for </Label>
          <Label>
            {NumberUtil.formatThousands(item.tx_value, 6)} {item.asset_ticker}
          </Label>
        </div>
      </div>
      <div className='ml-[60px]'>
        <Label className='text-gray-500'>
          {timeAgoFormatter(item.created_at)}
        </Label>
      </div>
      {withActions && (
        <div className='ml-[60px] flex gap-5'>
          <Button
            onClick={() =>
              router.push(
                `/markets/${item.provider}/${item.market_address}?strategy=buy&outcome_index=${item.outcome_index}&is_free_bet=${isFreeBet}`,
              )
            }
            className='bg-green-600 hover:bg-green-700'
          >
            Buy
          </Button>
          <Button
            onClick={() =>
              router.push(
                `/markets/${item.provider}/${item.market_address}?strategy=sell&outcome_index=${item.outcome_index}&is_free_bet=${isFreeBet}`,
              )
            }
          >
            Sell
          </Button>
          <Button>Share</Button>
        </div>
      )}
    </div>
  );
}
