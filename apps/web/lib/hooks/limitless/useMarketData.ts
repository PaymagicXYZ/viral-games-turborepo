import { defaultChain, newSubgraphURI } from '@/lib/constants';
import { publicClient } from '@/lib/config/publicClient';
import { useMarketGroup } from '@/lib/services/MarketService';
import { Optional } from '@/lib/types';
import { CollateralToken } from '@/lib/types/limitless';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Address, formatUnits, getContract, parseUnits } from 'viem';
import { fixedProductMarketMakerABI } from '@/abis/fixedProductMakerABI';

interface IUseMarketData {
  marketAddress?: Address;
  collateralToken?: Optional<CollateralToken>;
}

export const useProductMarketMakerContract = ({ market }: { market: any }) => {
  const fixedProductMarketMakerContract = useMemo(
    () =>
      market
        ? getContract({
            address: market.address as Address,
            abi: fixedProductMarketMakerABI,
            client: publicClient,
          })
        : null,
    [market],
  );

  return fixedProductMarketMakerContract;
};

export const useMarketData = ({
  marketAddress,
  collateralToken,
}: IUseMarketData) => {
  const { data } = useMarketGroup('limitless', marketAddress as string);

  const market = data?.data[0];

  const fixedProductMarketMakerContract = useProductMarketMakerContract({
    market,
  });

  const { data: outcomeTokensBuyPrice } = useQuery({
    queryKey: [
      'outcomeTokensBuyPrice',
      fixedProductMarketMakerContract?.address,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract || !collateralToken) {
        return [0, 0];
      }

      const collateralDecimals = collateralToken?.decimals ?? 18;
      const collateralAmount = collateralDecimals <= 6 ? `0.0001` : `0.0000001`;
      const collateralAmountBI = parseUnits(
        collateralAmount,
        collateralDecimals,
      );
      const outcomeTokenAmountYesBI =
        (await fixedProductMarketMakerContract.read.calcBuyAmount([
          collateralAmountBI,
          0,
        ])) as bigint;
      const outcomeTokenAmountNoBI =
        (await fixedProductMarketMakerContract.read.calcBuyAmount([
          collateralAmountBI,
          1,
        ])) as bigint;
      const outcomeTokenAmountYes = formatUnits(
        outcomeTokenAmountYesBI,
        collateralDecimals,
      );
      const outcomeTokenAmountNo = formatUnits(
        outcomeTokenAmountNoBI,
        collateralDecimals,
      );
      const outcomeTokenPriceYes =
        Number(collateralAmount) / Number(outcomeTokenAmountYes);
      const outcomeTokenPriceNo =
        Number(collateralAmount) / Number(outcomeTokenAmountNo);

      return [outcomeTokenPriceYes, outcomeTokenPriceNo];
    },
    enabled: !!collateralToken,
  });

  const { data: outcomeTokensSellPrice } = useQuery({
    queryKey: [
      'outcomeTokensSellPrice',
      fixedProductMarketMakerContract?.address,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract) {
        return [0, 0];
      }

      const collateralDecimals = collateralToken?.decimals ?? 18;
      const collateralAmount = collateralDecimals <= 6 ? `0.0001` : `0.0000001`;
      const collateralAmountBI = parseUnits(
        collateralAmount,
        collateralDecimals,
      );
      const outcomeTokenAmountYesBI =
        (await fixedProductMarketMakerContract.read.calcSellAmount([
          collateralAmountBI,
          0,
        ])) as bigint;
      const outcomeTokenAmountNoBI =
        (await fixedProductMarketMakerContract.read.calcSellAmount([
          collateralAmountBI,
          1,
        ])) as bigint;
      const outcomeTokenAmountYes = formatUnits(
        outcomeTokenAmountYesBI,
        collateralDecimals,
      );
      const outcomeTokenAmountNo = formatUnits(
        outcomeTokenAmountNoBI,
        collateralDecimals,
      );
      const outcomeTokenPriceYes =
        Number(collateralAmount) / Number(outcomeTokenAmountYes);
      const outcomeTokenPriceNo =
        Number(collateralAmount) / Number(outcomeTokenAmountNo);

      return [outcomeTokenPriceYes, outcomeTokenPriceNo];
    },
    // enabled: false,
  });

  const { data: outcomeTokensPercent } = useQuery({
    queryKey: [
      'outcomeTokensPercent',
      fixedProductMarketMakerContract?.address,
      outcomeTokensBuyPrice,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract || !outcomeTokensBuyPrice) {
        return [50, 50];
      }

      const sum = outcomeTokensBuyPrice[0] + outcomeTokensBuyPrice[1];
      const outcomeTokensPercentYes = +(
        (outcomeTokensBuyPrice[0] / sum) *
        100
      ).toFixed(1);
      const outcomeTokensPercentNo = +(
        (outcomeTokensBuyPrice[1] / sum) *
        100
      ).toFixed(1);

      return [outcomeTokensPercentYes, outcomeTokensPercentNo];
    },
  });

  const { data: liquidityAndVolume } = useQuery({
    queryKey: ['marketData', marketAddress],
    queryFn: async () => {
      if (!marketAddress && !collateralToken) {
        return;
      }
      const queryName = 'AutomatedMarketMaker';

      const response = await fetch(newSubgraphURI[defaultChain.id], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          query: `
        query ${queryName} {
          ${queryName} (
            where: {
              id: { 
                _ilike: "${marketAddress}" 
              } 
            }
          ) {
            funding
            totalVolume
          }
        }
      `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const [_marketData] = data.data?.[queryName] as MarketData[];
      const liquidity = formatUnits(
        BigInt(_marketData.funding),
        collateralToken?.decimals || 18,
      );
      const volume = formatUnits(
        BigInt(_marketData.totalVolume ?? '0'),
        collateralToken?.decimals || 18,
      );

      return {
        liquidity,
        volume,
      };
    },
    enabled: !!market && !!collateralToken,
  });

  return {
    outcomeTokensBuyPrice,
    outcomeTokensSellPrice,
    outcomeTokensPercent,
    ...liquidityAndVolume,
  };
};

type MarketData = {
  funding: string;
  totalVolume: string;
};
