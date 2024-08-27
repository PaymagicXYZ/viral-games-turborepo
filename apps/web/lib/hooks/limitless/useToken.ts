import { Token } from '@/lib/types/limitless';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Address } from 'viem';

export const useToken = (contractAddress?: string | Address | null) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['token', contractAddress],
    queryFn: async () => {
      const dataExists = queryClient.getQueryData(['token', contractAddress]);
      if (!!dataExists) {
        return dataExists as Token;
      }

      const response = await fetch(
        `https://api.limitless.exchange/tokens/${contractAddress}`,
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch token data');
      }

      const data = await response.json();

      return data as Token;
    },
    enabled: !!contractAddress,
  });
};
