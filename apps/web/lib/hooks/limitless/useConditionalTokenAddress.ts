import { defaultChain, newSubgraphURI } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { Address, getAddress } from 'viem';

export interface IUseConditionalTokensAddr {
  marketAddr: Address | undefined;
}

export const useConditionalTokensAddr = ({
  marketAddr,
}: IUseConditionalTokensAddr) => {
  return useQuery({
    queryKey: [useConditionalTokensAddr.name, marketAddr],
    queryFn: async () => {
      if (!marketAddr) {
        return null;
      }
      const queryName = 'AutomatedMarketMaker';

      const response = await fetch(newSubgraphURI[defaultChain.id], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ${queryName} {
              ${queryName} (
                where: {
                  id: { 
                    _ilike: "${marketAddr}" 
                  } 
                }
              ) {
                conditionalTokens
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resData = await response.json();

      const [data] = resData.data?.[queryName] as {
        conditionalTokens: string;
      }[];
      return getAddress(data.conditionalTokens);
    },
    enabled: Boolean(marketAddr),
  });
};
