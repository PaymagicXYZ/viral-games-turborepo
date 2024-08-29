import { Tables } from '@/types/database.types';
import {
  LimitlessGroupMarketResponse,
  LimitlessResponse,
} from '@/types/limitless';
import { MarketsWithMetadata } from '@/types/market';
import { LimitlessProvider } from '../providers/LimitlessProvider';
import { DEFAULT_LIMITLESS_TAG } from '@/app/api/[...route]/utils/constants';

export async function transformLimitlessResponse(
  response: LimitlessResponse | LimitlessGroupMarketResponse,
  metadata: Tables<'markets_with_tags'> | null,
): Promise<MarketsWithMetadata> {
  if ('slug' in response) {
    // Note: Response is a market group
    return await handleGroupMarket(response, metadata);
  }
  // Note: Response is a single market
  return await handleSingleMarket(response, metadata);
}

const handleSingleMarket = async (
  data: LimitlessResponse,
  metadata: Tables<'markets_with_tags'> | null,
) => {
  // TODO: contract multicall for outcome prices
  const outcomePrices = await LimitlessProvider.getMarketOutcomeBuyPrice({
    address: data.address,
    collateralToken: data.collateralToken,
    expired: data.expired,
    winningOutcomeIndex: data.winningOutcomeIndex,
  });
  const metadataTags = metadata?.tags?.map((t) => t.toLowerCase()) ?? [];

  const tags = [
    ...data.tags.map((t) => t.toLowerCase()),
    ...metadataTags,
    DEFAULT_LIMITLESS_TAG,
  ];

  return {
    data: [
      {
        collateralToken: data.collateralToken,
        conditionId: data.conditionId,
        creator: data.creator,
        description: data.description,
        expirationDate: data.expirationDate,
        expirationTimestamp: data.expirationTimestamp,
        expired: data.expired,
        id: data.address,
        liquidity: data.liquidity,
        liquidityFormatted: data.liquidityFormatted,
        ogImageURI:
          metadata?.image_uri ??
          'https://nzavwarwntmwtfrkfput.supabase.co/storage/v1/object/public/markets_images/app-logo.svg?t=2024-08-23T09%3A29%3A21.086Z',
        tags,
        title: data.title,
        // volume: data.volume,
        volumeFormatted: data.volumeFormatted,
        winningOutcomeIndex: data.winningOutcomeIndex,
        outcomePrices,
        chainId: 8453,
        provider: 'limitless' as const,
      },
    ],
    metadata: {
      title: metadata?.title ?? data.title,
      address: metadata?.address ?? data.address,
      image_uri:
        metadata?.image_uri ??
        'https://nzavwarwntmwtfrkfput.supabase.co/storage/v1/object/public/markets_images/app-logo.svg?t=2024-08-23T09%3A29%3A21.086Z',
      provider: metadata?.provider ?? 'limitless',
      tags,
      created_at: metadata?.created_at ?? null,
    },
  };
};

const handleGroupMarket = async (
  data: LimitlessGroupMarketResponse,
  metadata: Tables<'markets_with_tags'> | null,
) => {
  return {
    data: await Promise.all(
      data.markets.map(async (market) => {
        const metadataTags = metadata?.tags?.map((t) => t.toLowerCase()) ?? [];
        const tags = [
          ...data.tags.map((t) => t.toLowerCase()),
          ...metadataTags,
          DEFAULT_LIMITLESS_TAG,
        ];
        const outcomePrices = await LimitlessProvider.getMarketOutcomeBuyPrice({
          address: market.address,
          collateralToken: market.collateralToken,
          expired: market.expired,
          winningOutcomeIndex: market.winningOutcomeIndex,
        });

        return {
          collateralToken: market.collateralToken,
          conditionId: market.conditionId,
          creator: market.creator,
          description: market.description,
          expirationDate: market.expirationDate,
          expirationTimestamp: market.expirationTimestamp,
          expired: market.expired,
          id: market.address,
          liquidity: market.liquidity,
          liquidityFormatted: market.liquidityFormatted,
          ogImageURI:
            metadata?.image_uri ??
            'https://nzavwarwntmwtfrkfput.supabase.co/storage/v1/object/public/markets_images/app-logo.svg?t=2024-08-23T09%3A29%3A21.086Z',
          tags,
          title: market.title,
          // volume: data.volume,
          volumeFormatted: market.volumeFormatted,
          winningOutcomeIndex: market.winningOutcomeIndex,
          outcomePrices,
          chainId: 8453,
          provider: 'limitless' as const,
        };
      }),
    ),
    metadata: {
      address: null,
      created_at: null,
      image_uri: null,
      tags: null,
      provider: 'limitless',
      title: data.title,
    },
  };
};
