import { getPortfolio } from '@/lib/actions/viral-games-api';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

interface Position {
  marketId: string;
  outcomeIndex: number;
  shares: number;
  title: string;
}

interface Portfolio {
  positions: {
    [key: string]: Position[];
  };
}

export default function useGetPortfolioQuery() {
  const account = useAccount();

  const { data } = useQuery<Portfolio, Error>({
    queryKey: ['portfolio', account.address],
    queryFn: () =>
      getPortfolio({ user_address: account.address! }) as Promise<Portfolio>,
    enabled: Boolean(account.address),
  });

  return { data };
}
