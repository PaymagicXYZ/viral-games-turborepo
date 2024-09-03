import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { AccountMarketResponse } from '@/lib/types/limitless';
import { newSubgraphURI } from '@/lib/constants';
import { base } from 'viem/chains';

export function useUsersMarkets() {
  const { address } = useAccount()

  return useQuery<AccountMarketResponse[]>({
    queryKey: ['createdMarkets', address],
    queryFn: async () => {
      if (!address) {
        return []
      }
      const queryName = 'GetAccountDetails'
      const query = `query ${queryName}  {
        AccountMarket(
          where: {
            account_id: { 
              _ilike: "${address}" 
            }
          }
          order_by: { collateralsLocked: desc }
        ) {
          account_id
          market {
            id
            closed
            conditionId: condition_id
            collateral {
              id
              name
              symbol
            }
            condition {
              resolutionTimestamp
            }
          }
          collateralsInvested
          collateralsLocked
        }
      }`

      const response = await fetch(newSubgraphURI[base.id], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()
      return data.data['AccountMarket']
    },
    enabled: !!address,
  })
}
