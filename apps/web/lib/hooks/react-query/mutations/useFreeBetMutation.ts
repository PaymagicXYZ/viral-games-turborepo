import { buyShares } from '@/lib/actions/viral-games-be';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

type ExchangePosition = {
  userId: string;
  address: string;
  amount: number;
  position: 'Yes' | 'No';
};

export function useFreeBetMutation(marketProvider: 'limitless' | 'polymarket') {
  const queryClient = useQueryClient();
  const account = useAccount();

  const { mutateAsync, error, isPending, status } = useMutation({
    mutationKey: ['free-exchange'],
    mutationFn: async (position: ExchangePosition) => {
      const { address, ...rest } = position;
      await buyShares({
        ...rest,
        marketId: address,
        socialProvider: 'eoa',
        provider: marketProvider,
      });
      return { market_address: position.address };
    },
    onSuccess: async (data: { market_address: string }) => {
      await queryClient.invalidateQueries({
        queryKey: ['tempPlayer', account.address],
      });

      await queryClient.invalidateQueries({
        queryKey: ['shares', data.market_address, account.address],
      });
    },
  });

  return { mutateAsync, error, isPending };
}
