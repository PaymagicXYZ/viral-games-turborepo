import { fixedProductMarketMakerABI } from '@/abis/fixedProductMakerABI';
import { defaultChain, LIMIT_PER_PAGE, newSubgraphURI } from '@/lib/constants';
import { MarketResponseWithMetadata, Market } from '@/lib/types/limitless';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Address, formatUnits, getContract, parseUnits } from 'viem';

import {
  MarketGroupResponse,
  PaginatedMarketResponse,
} from '@/lib/types/markets';
import { publicClient } from '@/lib/config/publicClient';
import { env } from '@/lib/config/env';

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

export function useMarketGroups(filter?: string | null) {
  return useInfiniteQuery<PaginatedMarketResponse, Error>({
    queryKey: ['markets', filter],
    queryFn: async ({ pageParam = null }) => {
      let baseUrl = `${env.NEXT_PUBLIC_VIRAL_GAMES_BE_API}/markets?limit=${LIMIT_PER_PAGE}`;

      if (pageParam) {
        baseUrl += `&cursor=${pageParam}`;
      }

      const response = await fetch(baseUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch markets: ${response.status}`);
      }

      const data: PaginatedMarketResponse = await response.json();
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null,
    refetchOnWindowFocus: false,
  });
}

export function useAllMarkets() {
  const { data: markets } = useQuery<Array<Market>, Error>({
    queryKey: ['allMarkets'],
    queryFn: async () => {
      const baseUrl = `${env.NEXT_PUBLIC_LIMITLESS_API_URL}/markets`;

      const response = await fetch(baseUrl);

      if (!response.ok) {
        return { data: [] };
      }

      const data = await response.json();

      return data;
    },
  });

  return useMemo(() => {
    return markets ?? [];
  }, [markets]);
}

export function useMarketByConditionId(conditionId: string) {
  const { data: market } = useQuery({
    queryKey: ['marketByConditionId', conditionId],
    queryFn: async () => {
      const url = `${env.NEXT_PUBLIC_LIMITLESS_API_URL}/markets/conditions/${conditionId}`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to fetch marketByConditionId');
      }

      const data = await response.json();

      return data;
    },
  });

  return useMemo(() => market ?? null, [market]);
}

export function useMarketGroup(provider: string, identifier: string) {
  return useQuery({
    queryKey: ['market', provider, identifier],
    queryFn: async () => await getMarketGroup({ provider, identifier }),
    enabled: Boolean(provider && identifier),
  });
}

export const getMarketGroup = async ({
  provider,
  identifier,
}: {
  provider: string;
  identifier: string;
}): Promise<MarketGroupResponse> => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_VIRAL_GAMES_BE_API}/markets/${provider}/${identifier}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch market data');
  }

  const data = await response.json();

  return data;
};

const getMarketOutcomeBuyPrice = async (
  decimals: number,
  marketAddress: Address,
) => {
  const fixedProductMarketMakerContract = getContract({
    address: marketAddress,
    abi: fixedProductMarketMakerABI,
    client: publicClient,
  });
  const collateralDecimals = decimals;
  const collateralAmount = collateralDecimals <= 6 ? `0.0001` : `0.0000001`;
  const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals);
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
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
    },
  });
