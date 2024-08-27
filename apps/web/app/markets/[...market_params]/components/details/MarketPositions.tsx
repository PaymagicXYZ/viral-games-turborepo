'use client';

import {
  useHistory,
  HistoryPosition,
} from '@/components/providers/HistoryProvider';
import { Label } from '@/components/ui/label';
import useGetFreeSharesQuery from '@/lib/hooks/react-query/queries/useGetFreeSharesQuery';
import { formatAddress } from '@/lib/utils/formatters';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import { useMemo } from 'react';

export default function MarketPositions({
  marketIdentifier,
  tokenSymbol,
  prices,
}: {
  marketIdentifier: string;
  tokenSymbol: string;
  prices: Array<string>;
}) {
  const { positions: allMarketsPositions } = useHistory();
  const { data: freePositions } = useGetFreeSharesQuery({
    marketAddress: marketIdentifier,
  });

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) =>
          position.market.id.toLowerCase() === marketIdentifier.toLowerCase(),
      ),
    [allMarketsPositions, marketIdentifier],
  );

  const isPortfolioVisible =
    positions?.length || freePositions?.positions?.length;

  return isPortfolioVisible ? (
    <div className='flex flex-col gap-2'>
      <Label className='text-base text-gray-500'>Portfolio</Label>
      {positions?.map((position, idx) => (
        <PositionItem
          key={idx}
          position={position}
          tokenSymbol={tokenSymbol}
          prices={prices}
        />
      ))}
      {freePositions?.positions?.map(
        (
          position: {
            outcome_index: number;
            shares: number;
            market_address: string;
          },
          idx: number,
        ) => <FreePositionItem key={idx} position={position} />,
      )}
    </div>
  ) : null;
}

export function PositionItem({
  position,
  tokenSymbol,
  prices,
}: {
  position: HistoryPosition;
  tokenSymbol?: string;
  prices?: Array<string>;
}) {
  const getOutcomeNotation = () => {
    const outcomeTokenId = position.outcomeIndex ?? 0;
    const defaultOutcomes = ['Yes', 'No'];

    return defaultOutcomes[outcomeTokenId];
  };

  const contracts = NumberUtil.toFixed(position.outcomeTokenAmount, 6);

  const currentContractsPrice =
    +(position.outcomeTokenAmount || 1) *
    ((Number(prices?.[position.outcomeIndex] ?? 0) || 1) / 100);

  const contractPrice =
    currentContractsPrice / +(position?.collateralAmount || 1);

  const contractPriceChanged = useMemo(() => {
    let price;
    if (contractPrice < 1) {
      price = NumberUtil.toFixed((1 - contractPrice) * 100, 0);
      return <Label className='text-xs text-red-500'>{price}%&#x2193;</Label>;
    }

    price = NumberUtil.toFixed((contractPrice - 1) * 100, 0);
    return <Label className='text-xs text-green-500'>{price}%&#x2191;</Label>;
  }, [contractPrice]);

  const invested = `${NumberUtil.toFixed(
    position.collateralAmount,
    6,
  )} ${tokenSymbol}`;

  const initialPrice = `${NumberUtil.toFixed(
    position.latestTrade?.outcomeTokenPrice,
    3,
  )} ${tokenSymbol}`;

  const currentPrice = `${NumberUtil.toFixed(
    (Number(prices?.[position.outcomeIndex] ?? 0) || 1) / 100,
    3,
  )} ${tokenSymbol}`;

  const toWin = `${NumberUtil.toFixed(
    position.outcomeTokenAmount,
    6,
  )} ${tokenSymbol}`;

  const currentContractPrice = `${NumberUtil.toFixed(
    currentContractsPrice,
    6,
  )} ${tokenSymbol}`;

  return (
    <div className='flex w-full flex-col gap-6 bg-gray-200 px-2 py-4'>
      <div className='flex flex-col flex-wrap justify-between gap-4 md:flex-row'>
        <div className='flex gap-2'>
          <Label className='text-xs text-gray-500'>Vote</Label>
          <Label className='text-xs text-gray-500'>
            {getOutcomeNotation()}
          </Label>
        </div>
        <div className='flex flex-col gap-4 lg:flex-row'>
          <div className='flex flex-col gap-1 md:flex-row'>
            <Label className='text-xs text-gray-500'>{contracts}</Label>
            <Label className='text-xs text-gray-500'>Contracts</Label>
          </div>
          <div className='flex flex-col gap-1 md:flex-row'>
            {prices && (
              <Label className='text-xs text-gray-500'>
                {currentContractPrice}
              </Label>
            )}
            <Label className='text-xs text-gray-500'>
              {contractPriceChanged}
            </Label>
          </div>
        </div>
      </div>
      <div className='flex flex-col flex-wrap justify-between gap-4 md:flex-row'>
        <div className='flex flex-col gap-2'>
          <Label className='text-xs text-gray-500'>Invested</Label>
          <Label className='text-xs text-gray-500'>{invested}</Label>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-xs text-gray-500'>Initial Price</Label>
          <Label className='text-xs text-gray-500'>{initialPrice}</Label>
        </div>
        {prices && (
          <div className='flex flex-col gap-2'>
            <Label className='text-xs text-gray-500'>Current Price</Label>
            <Label className='text-xs text-gray-500'>{currentPrice}</Label>
          </div>
        )}
        <div className='flex flex-col gap-2'>
          <Label className='text-xs text-gray-500'>To Win</Label>
          <Label className='text-xs text-gray-500'>{toWin}</Label>
        </div>
      </div>
    </div>
  );
}

export function FreePositionItem({
  position,
}: {
  position: {
    shares: number;
    outcome_index: number;
    market_address: string;
  };
}) {
  const formattedVote = position.outcome_index === 0 ? 'Yes' : 'No';

  return (
    <div className='flex w-full flex-col gap-6 bg-gray-200 px-2 py-4'>
      <div className='flex justify-between'>
        <Label className='text-xs text-gray-500'>
          Vote {formattedVote} (Free bet)
        </Label>
        <Label className='text-xs text-gray-500'>
          Market Address: {formatAddress(position.market_address)}
        </Label>
      </div>
      <div className='flex flex-col gap-2'>
        <Label className='text-xs text-gray-500'>Shares</Label>
        <Label className='text-xs text-gray-500'>{position.shares}</Label>
      </div>
    </div>
  );
}
