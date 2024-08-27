'use client';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMarketData } from '@/lib/hooks/limitless/useMarketData';
import useSupportedTokens from '@/lib/hooks/useSupportedTokens';
import { useWinningIndex } from '@/lib/services/MarketService';
import { CollateralToken } from '@/lib/types/limitless';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import { useMemo } from 'react';
import { Address } from 'viem';

type MarketVotesPercentagesProps = {
  address: Address;
  collateralToken: CollateralToken;
  prices: Array<number>;
};

export default function MarketVotesPercentages({
  address,
  collateralToken,
  prices,
}: MarketVotesPercentagesProps) {
  const { data: winningIndex } = useWinningIndex(address);
  const resolved = winningIndex === 0 || winningIndex === 1;
  const { supportedTokens } = useSupportedTokens();
  const { outcomeTokensPercent } = useMarketData({
    marketAddress: address,
    collateralToken: supportedTokens?.find(
      (token) => token.address === collateralToken.address,
    ),
  });

  const [yesProbability, noProbability] = useMemo(
    () => [
      !resolved
        ? NumberUtil.toFixed(outcomeTokensPercent?.[0], 1)
        : winningIndex === 0
          ? '100'
          : '0',
      !resolved
        ? NumberUtil.toFixed(outcomeTokensPercent?.[1], 1)
        : winningIndex === 1
          ? '100'
          : '0',
    ],
    [outcomeTokensPercent, resolved, winningIndex],
  );

  return (
    <div className='flex items-center justify-between gap-4 bg-gray-200 px-2 py-1'>
      <div className='flex flex-col items-center gap-2'>
        <Label className='text-xs text-gray-500'>Yes</Label>
        <Label className='text-xs text-gray-500'>{yesProbability}%</Label>
      </div>
      <Separator orientation='vertical' className='bg-black' />
      <div className='flex flex-col items-center gap-2'>
        <Label className='text-xs text-gray-500'>No</Label>
        <Label className='text-xs text-gray-500'>{noProbability}%</Label>
      </div>
    </div>
  );
}
