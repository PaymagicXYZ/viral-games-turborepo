import { getMarketOutcomeBuyPrice } from '@/app/api/[...route]/utils/viem';
import { Tables } from '@/types/database.types';
import { LimitlessResponse } from '@/types/limitless';
import { MarketsWithMetadata } from '@/types/market';
import { LimitlessProvider } from '../providers/LimitlessProvider';
import { DEFAULT_LIMITLESS_TAG } from '@/app/api/[...route]/utils/constants';

export async function transformLimitlessResponse(
  response: LimitlessResponse,
  metadata: Tables<'markets_with_tags'> | null,
): Promise<MarketsWithMetadata> {
  const outcomePrices = await LimitlessProvider.getMarketOutcomeBuyPrice(
    response,
  );
  const metadataTags = metadata?.tags?.map((t) => t.toLowerCase()) ?? [];
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
        ogImageURI: metadata?.image_uri ?? response.ogImageURI,
        tags: [
          ...response.tags.map((t) => t.toLowerCase()),
          ...metadataTags,
          DEFAULT_LIMITLESS_TAG,
        ],
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
