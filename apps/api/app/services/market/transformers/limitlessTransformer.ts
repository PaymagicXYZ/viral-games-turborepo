import { getMarketOutcomeBuyPrice } from '@/app/api/[...route]/utils/viem';
import { Tables } from '@/types/database.types';
import { LimitlessResponse } from '@/types/limitless';
import { MarketsWithMetadata } from '@/types/market';
import { LimitlessProvider } from '../providers/LimitlessProvider';

export async function transformLimitlessResponse(
  response: LimitlessResponse,
  metadata: Tables<'markets_with_tags'> | null,
): Promise<MarketsWithMetadata> {
  const outcomePrices = await LimitlessProvider.getMarketOutcomeBuyPrice(
    response,
  );

  return {
    data: [
      {
        collateralToken: response.collateralToken,
        conditionId: response.conditionId,
        creator: response.creator,
        description: response.description,
        expirationDate: response.expirationDate,
        expirationTimestamp: response.expirationTimestamp,
        expired: response.expired,
        id: response.address,
        liquidity: response.liquidity,
        liquidityFormatted: response.liquidityFormatted,
        ogImageURI: response.ogImageURI,
        tags: response.tags,
        title: response.title,
        // volume: response.volume,
        volumeFormatted: response.volumeFormatted,
        winningOutcomeIndex: response.winningOutcomeIndex,
        outcomePrices,
      },
    ],
    metadata,
  };
}
