import {
  defaultChain,
  newSubgraphURI,
  ONE_HOUR_IN_MILLISECONDS,
} from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Address, getAddress } from 'viem';
import { useWinningIndex } from '../services/MarketService';

interface YesBuyChartData {
  yesBuyChartData: [number, number];
}

export default function useChartData({ address }: { address: Address }) {
  const { data: winningIndex } = useWinningIndex(address);
  const resolved = winningIndex === 0 || winningIndex === 1;

  const { data: prices } = useQuery({
    queryKey: ['prices', address],
    queryFn: async () => {
      const query = `query prices {
          AutomatedMarketMakerPricing(where: { market_id: { _ilike: "${address}" } }) {
            yesBuyChartData
          }
      }`;

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
      const pricingData = responseData.data
        ?.AutomatedMarketMakerPricing as YesBuyChartData[];

      return flattenPriceData(pricingData);
    },
    enabled: Boolean(address),
  });

  const chartData = useMemo(() => {
    const _prices: number[][] = prices ?? [];
    const data = resolved
      ? [
          ...(_prices ?? []),
          !!_prices[_prices.length - 1]
            ? [
                _prices[_prices.length - 1][0] + ONE_HOUR_IN_MILLISECONDS,
                winningIndex === 0 ? 100 : 0,
              ]
            : [Date.now(), 100],
        ].filter((priceData) => {
          const [, value] = priceData;
          return !!value;
        })
      : _prices;

    // special case hotfix
    const special = {
      [getAddress('0xD0BC7FCea7500d485329e0aaE36e0512815684BF')]: {
        index: 0,
        timestamp: 1722745928000, // aug 4 2024
        exists: true,
      },
    };
    if (special[address]?.exists) {
      const _index = special[address].index;

      if (data[_index]) {
        data[_index][0] = special[address].timestamp;

        for (
          let index = 0;
          index < Array.from({ length: 10 }).length;
          index++
        ) {
          data.splice(index + 1, 0, [
            data[index][0] + ONE_HOUR_IN_MILLISECONDS,
            data[index][1],
          ]);
        }
      }
    }

    return data;
  }, [prices, winningIndex, resolved]);

  return { prices, chartData };
}

const flattenPriceData = (data: YesBuyChartData[]): number[][] => {
  if (!data || data.length === 0) {
    return [];
  }

  const flattenData: number[][] = [];

  // Append current timestamp with the last price
  const lastTrade = [
    ...filterBrokenPrice(data[data.length - 1].yesBuyChartData),
  ];
  lastTrade[0] = Math.floor(Date.now());
  data.push({ yesBuyChartData: lastTrade as [number, number] });

  for (let i = 0; i < data.length - 1; i++) {
    const currentTrade = filterBrokenPrice(data[i].yesBuyChartData);
    const nextTrade = filterBrokenPrice(data[i + 1].yesBuyChartData);

    flattenData.push(currentTrade);

    let currentTime = currentTrade[0];
    while (currentTime + ONE_HOUR_IN_MILLISECONDS < nextTrade[0]) {
      currentTime += ONE_HOUR_IN_MILLISECONDS;
      flattenData.push([currentTime, currentTrade[1]]);
    }
  }

  return flattenData;
};

const filterBrokenPrice = (nums: [number, number]) => {
  nums[0] = isNaN(nums[0]) ? 0 : nums[0];
  nums[1] = isNaN(nums[1]) ? Number(50) : nums[1];
  return nums;
};
