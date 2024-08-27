import { getShares } from '@/lib/actions/viral-games-be';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

export default function useGetFreeSharesQuery({
  marketAddress,
}: {
  marketAddress: string;
}) {
  const { address } = useAccount();

  const { data } = useQuery({
    queryKey: ['shares', marketAddress, address],
    queryFn: () =>
      getShares({ user_address: address!, market_address: marketAddress }),
    enabled: Boolean(marketAddress && address),
  });

  return {
    data,
  };
}
