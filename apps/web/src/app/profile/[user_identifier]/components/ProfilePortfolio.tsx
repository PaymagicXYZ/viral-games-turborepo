'use client';

import { useHistory } from '@/components/providers/HistoryProvider';
import useGetPortfolioQuery from '@/lib/hooks/react-query/queries/useGetFreePortfolioQuery';
import { useAllMarkets } from '@/lib/services/MarketService';
import { Optional } from '@/lib/types';
import {
  FreePositionItem,
  PositionItem,
} from '@/src/app/markets/[...market_params]/components/details/MarketPositions';
import { useEffect, useMemo } from 'react';

type ProfilePortfolioProps = {
  userAddress: Optional<string>;
  socialProvider: string;
  userFid: Optional<number>;
};

export default function ProfilePortfolio({
  userAddress,
  socialProvider,
  userFid,
}: ProfilePortfolioProps) {
  const { positions: allMarketsPositions, setWalletAddress } = useHistory();
  const allMarkets = useAllMarkets();
  const { data: portfolio } = useGetPortfolioQuery({
    userIdentifier:
      socialProvider === 'eoa' ? userAddress : userFid?.toString(),
    socialProvider,
  });

  useEffect(() => {
    setWalletAddress(userAddress);
  }, [userAddress, setWalletAddress]);

  const enrichedPositions = useMemo(() => {
    return allMarketsPositions?.map((position) => {
      const correspondingMarket = allMarkets.find(
        (market) =>
          market.address.toLowerCase() === position.market.id.toLowerCase(),
      );
      return {
        ...position,
        title: correspondingMarket?.title || 'Unknown Market',
      };
    });
  }, [allMarketsPositions, allMarkets]);

  console.log(enrichedPositions?.length);

  return (
    <section className='h-[320px] space-y-6 overflow-auto'>
      {enrichedPositions?.map((position, idx) => (
        <PositionItem
          title={position.title}
          key={idx}
          position={position}
          tokenSymbol={position.latestTrade?.market.collateral?.symbol}
        />
      ))}
      {portfolio &&
        Object.entries(portfolio?.positions ?? {}).map(([key, positions]) =>
          positions.map((position, idx) => (
            <FreePositionItem key={`${key}-${idx}`} position={position} />
          )),
        )}
      {/* {portfolio?.positions?.map(
        (
          position: {
            marketId: string;
            outcomeIndex: number;
            shares: number;
            title: number;
          },
          idx: number,
        ) => <FreePositionItem key={idx} position={position} />,
      )} */}
    </section>
  );
}
