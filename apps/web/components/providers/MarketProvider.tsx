import { fixedProductMarketMakerABI } from '@/abis/fixedProductMakerABI';
import { publicClient } from '@/lib/config/publicClient';
import { defaultChain, LIMIT_PER_PAGE, newSubgraphURI } from '@/lib/constants';
import {
  Market,
  MarketResponseWithMetadata,
  SingleMarket
} from '@/lib/types/limitless';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Address, formatUnits, getContract, parseUnits } from 'viem';

/**
 * Fetches and manages paginated active market data using the `useInfiniteQuery` hook.
 * Active market is FUNDED market and not hidden only
 *
 * @returns {MarketData[]} which represents pages of markets
 */
export type Markets = {
  data: MarketResponseWithMetadata[];
  next: number;
};

export function useLimitlessActiveMarkets(filter?: string | null) {
  return useInfiniteQuery<Markets, Error>({
    queryKey: ['markets', filter],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/providers/limitless?active=true&page=${pageParam}`;

      const response = await fetch(baseUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch ACTIVE limitless markets: ${response.status}`
        );
      }

      const data = await response.json();

      return { data: data.data, next: (pageParam as number) + 1 };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.data.length < LIMIT_PER_PAGE ? null : lastPage.next;
    },
    refetchOnWindowFocus: false
  });
}

// const { data: marketOnChainPercentageData } = useQuery({
//   queryKey: ['marketOnChainPercentageData'],
//   queryFn: async () => {
//     const markets =
//   },
// })

export function useAllMarkets() {
  const { data: markets } = useQuery<{ data: Array<Market> }, Error>({
    queryKey: ['allMarkets'],
    queryFn: async () => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/providers/limitless`;

      const response = await fetch(baseUrl);

      if (!response.ok) {
        return { data: [] };
      }

      return await response.json();
    }
  });

  return useMemo(() => markets?.data ?? [], [markets]);
}

export function useMarketByConditionId(conditionId: string) {
  const { data: market } = useQuery({
    queryKey: ['marketByConditionId', conditionId],
    queryFn: async () => {
      const url = `${process.env.NEXT_PUBLIC_LIMITLESS_API_URL}/markets/conditions/${conditionId}`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to fetch marketByConditionId');
      }

      const data = await response.json();

      return data;
    }
  });

  return useMemo(() => market ?? null, [market]);
}

export function useMarket(address?: string) {
  return useQuery({
    queryKey: ['market', address],
    queryFn: async () => await getMarket({ marketAddress: address! }),
    enabled: !!address && address !== '0x'
  });
}

export const getMarket = async ({
  marketAddress
}: {
  marketAddress: string;
}): Promise<SingleMarket> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/providers/limitless/${marketAddress}`,
    {
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch market data');
  }

  const data = await response.json();
  const market = data.data as SingleMarket;

  let prices = [50, 50];

  //TODO remove this hot-fix
  if (market.expired) {
    if (market?.winningOutcomeIndex === 0) {
      prices = [100, 0];
    } else if (market?.winningOutcomeIndex === 1) {
      prices = [0, 100];
    } else {
      prices = [50, 50];
    }
  } else {
    const buyPrices = await getMarketOutcomeBuyPrice(
      market.collateralToken.decimals,
      market.address
    );

    const sum = buyPrices[0] + buyPrices[1];
    const outcomeTokensPercentYes = +((buyPrices[0] / sum) * 100).toFixed(1);
    const outcomeTokensPercentNo = +((buyPrices[1] / sum) * 100).toFixed(1);
    prices = [outcomeTokensPercentYes, outcomeTokensPercentNo];
  }

  return {
    ...market,
    prices
  };
};

const getMarketOutcomeBuyPrice = async (
  decimals: number,
  marketAddress: Address
) => {
  const fixedProductMarketMakerContract = getContract({
    address: marketAddress,
    abi: fixedProductMarketMakerABI,
    client: publicClient
  });
  const collateralDecimals = decimals;
  const collateralAmount = collateralDecimals <= 6 ? `0.0001` : `0.0000001`;
  const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals);
  const outcomeTokenAmountYesBI =
    (await fixedProductMarketMakerContract.read.calcBuyAmount([
      collateralAmountBI,
      0
    ])) as bigint;
  const outcomeTokenAmountNoBI =
    (await fixedProductMarketMakerContract.read.calcBuyAmount([
      collateralAmountBI,
      1
    ])) as bigint;
  const outcomeTokenAmountYes = formatUnits(
    outcomeTokenAmountYesBI,
    collateralDecimals
  );
  const outcomeTokenAmountNo = formatUnits(
    outcomeTokenAmountNoBI,
    collateralDecimals
  );
  const outcomeTokenPriceYes =
    Number(collateralAmount) / Number(outcomeTokenAmountYes);
  const outcomeTokenPriceNo =
    Number(collateralAmount) / Number(outcomeTokenAmountNo);

  return [outcomeTokenPriceYes, outcomeTokenPriceNo];
};

export const useWinningIndex = (marketAddr: string) =>
  useQuery({
    queryKey: ['winning-index', marketAddr],
    queryFn: async () => {
      const query = `
      query getMarketWinningIndex {
        AutomatedMarketMaker(
          where: { 
            id: { 
              _ilike: "${marketAddr}" 
            } 
          }
        ) {
          condition {
            payoutNumerators
          }
        }
      }
      `;

      const response = await fetch(newSubgraphURI[defaultChain.id], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      const data: {
        condition?: {
          payoutNumerators?: number[] | null;
        };
      }[] = responseData.data?.AutomatedMarketMaker;
      const [market] = data;

      const payoutNumerators = market?.condition?.payoutNumerators;
      if (!payoutNumerators) return null;

      const result = payoutNumerators.findIndex((num) => num === 1);

      return result;
    }
  });
