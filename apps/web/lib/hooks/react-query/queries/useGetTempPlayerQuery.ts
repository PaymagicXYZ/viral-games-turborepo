import { getTempPlayer } from '@/lib/actions/viral-games-be';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

export default function useGetTempPlayerQuery() {
  const account = useAccount();

  const { data } = useQuery({
    queryKey: ['tempPlayer', account.address],
    queryFn: () => getTempPlayer({ user_address: account.address! }),
    enabled: Boolean(account.address),
  });

  return { data };
}
