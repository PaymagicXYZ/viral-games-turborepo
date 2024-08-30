'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Market, MarketGroupResponse } from '@/lib/types/markets';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import clsx from 'clsx';
import { useQueryState } from 'nuqs';
import { Address } from 'viem';

export default function MarketOutcome({
  marketGroup,
}: {
  marketGroup: MarketGroupResponse;
}) {
  const [marketIndex, setMarketIndex] = useQueryState('market_index', {
    parse: (value) => (value ? Number(value) : 0),
    serialize: String,
    defaultValue: 0,
  });

  const [outcomeIndex, setOutcomeIndex] = useQueryState('outcome_index', {
    parse: (value) => (value ? Number(value) : 0),
    serialize: String,
    defaultValue: 0,
  });

  const isMarketGroup = marketGroup.data.length > 1;

  return (
    isMarketGroup && (
      <div>
        <div className='flex'>
          <Label className='text-gray-500'>Outcome</Label>
        </div>
        {marketGroup.data.map((market, _marketIndex) => (
          <MarketOptions
            key={market.id}
            market={market}
            onSelect={(outcomeIndex) => {
              setMarketIndex(_marketIndex);
              setOutcomeIndex(outcomeIndex);
            }}
            isMarketSelected={marketIndex === _marketIndex}
            outcomeIndex={outcomeIndex}
          />
        ))}
      </div>
    )
  );
}

function MarketOptions({
  market,
  onSelect,
  isMarketSelected,
  outcomeIndex,
}: {
  market: Market;
  onSelect: (outcomeIndex: number) => void;
  isMarketSelected: boolean;
  outcomeIndex: number;
}) {
  return (
    <div className='flex items-center justify-between py-2'>
      <Label className='text-sm'>{market.title}</Label>
      <div className='flex gap-2'>
        {market.outcomePrices.map((price, idx) => (
          <Button
            key={idx}
            onClick={() => onSelect(idx)}
            className={clsx('w-[140px] text-start text-xs', {
              'bg-green-600 hover:bg-green-700':
                isMarketSelected && outcomeIndex === idx,
            })}
          >
            {idx === 0 ? 'Yes' : 'No'} {NumberUtil.toFixed(price, 2)}%
          </Button>
        ))}
      </div>
    </div>
  );
}
