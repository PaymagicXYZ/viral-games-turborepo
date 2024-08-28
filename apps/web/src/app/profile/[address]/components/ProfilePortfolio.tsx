'use client';

import { useHistory } from '@/components/providers/HistoryProvider';
import useGetPortfolioQuery from '@/lib/hooks/react-query/queries/useGetFreePortfolioQuery';
import {
  FreePositionItem,
  PositionItem,
} from '@/src/app/markets/[...market_params]/components/details/MarketPositions';

export default function ProfilePortfolio() {
  const { positions: allMarketsPositions } = useHistory();
  const { data: portfolio } = useGetPortfolioQuery();

  return (
    <section className='h-[320px] space-y-6 overflow-auto'>
      {allMarketsPositions?.map((position, idx) => (
        <PositionItem
          key={idx}
          position={position}
          tokenSymbol={position.latestTrade?.market.collateral?.symbol}
        />
      ))}
      {portfolio?.positions?.map(
        (
          position: {
            outcome_index: number;
            shares: number;
            market_address: string;
          },
          idx: number,
        ) => <FreePositionItem key={idx} position={position} />,
      )}
    </section>
  );
}
