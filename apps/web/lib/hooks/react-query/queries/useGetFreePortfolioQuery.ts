import { getPortfolio } from '@/lib/actions/viral-games-api';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

export default function useGetPortfolioQuery() {
  const account = useAccount();

  const { data } = useQuery({
    queryKey: ['portfolio', account.address],
    queryFn: () => getPortfolio({ user_address: account.address! }),
    enabled: Boolean(account.address),
  });

  return { data };
}
