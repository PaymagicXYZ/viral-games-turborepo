import { getPortfolio } from '@/lib/actions/viral-games-api';
import { Optional } from '@/lib/types';
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

export default function useGetPortfolioQuery({
  userIdentifier,
  socialProvider,
}: {
  userIdentifier: Optional<string>;
  socialProvider: string;
}) {
  const { data } = useQuery<Portfolio, Error>({
    queryKey: ['portfolio', userIdentifier, socialProvider],
    queryFn: () =>
      getPortfolio({
        user_identifier: userIdentifier!,
        social_provider: socialProvider,
      }) as Promise<Portfolio>,
    enabled: Boolean(userIdentifier),
  });

  return { data };
}
