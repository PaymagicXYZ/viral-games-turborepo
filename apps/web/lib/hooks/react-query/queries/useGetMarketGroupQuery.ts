import { getMarketGroup } from '@/lib/services/MarketService';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function useGetMarketGroupQuery() {
  const params = useParams<{ market_params: Array<string> }>();
  const [provider, identifier] = params.market_params;

  const { data, isLoading } = useQuery({
    queryKey: ['market_group', provider, identifier],
    queryFn: () => getMarketGroup({ provider, identifier }),
  });

  return { data, isLoading };
}
