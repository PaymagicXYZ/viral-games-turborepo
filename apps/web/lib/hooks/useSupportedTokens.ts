import { Token } from '@/lib/types/limitless';
import { useQuery } from '@tanstack/react-query';

export default function useSupportedTokens() {
  const { data: supportedTokens } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const response = await fetch('https://api.limitless.exchange/tokens', {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch token data');
      }

      const data = await response.json();

      return data as Token[];
    }
  });

  return { supportedTokens };
}
