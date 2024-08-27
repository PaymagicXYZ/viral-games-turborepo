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
  const outcomePrices =
    await LimitlessProvider.getMarketOutcomeBuyPrice(response);
  const metadataTags = metadata?.tags?.map((t) => t.toLowerCase()) ?? [];

  const tags = [
    ...response.tags.map((t) => t.toLowerCase()),
    ...metadataTags,
    DEFAULT_LIMITLESS_TAG,
  ];

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
        ogImageURI:
          metadata?.image_uri ??
          'https://nzavwarwntmwtfrkfput.supabase.co/storage/v1/object/public/markets_images/app-logo.svg?t=2024-08-23T09%3A29%3A21.086Z',
        tags,
        title: response.title,
        // volume: response.volume,
        volumeFormatted: response.volumeFormatted,
        winningOutcomeIndex: response.winningOutcomeIndex,
        outcomePrices,
        chainId: 8453
      },
    ],
    metadata: {
      title: metadata?.title ?? response.title,
      address: metadata?.address ?? response.address,
      image_uri:
        metadata?.image_uri ??
        'https://nzavwarwntmwtfrkfput.supabase.co/storage/v1/object/public/markets_images/app-logo.svg?t=2024-08-23T09%3A29%3A21.086Z',
      provider: metadata?.provider ?? 'limitless',
      tags,
      created_at: metadata?.created_at ?? null,
    },
  };
}
