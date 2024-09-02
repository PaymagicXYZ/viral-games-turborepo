import { DEFAULT_CUSTOM_PROVIDER_TAG } from '@/app/api/[...route]/utils/constants';
import { MarketMetadata, MarketsWithMetadata } from '@/types/market';
import { Tables } from '@repo/shared-types';

export function transformCustomResponse(
  market: Tables<'markets'>,
  metadata: MarketMetadata | null,
): MarketsWithMetadata {
  const metadataTags = metadata?.tags?.map((t) => t.toLowerCase()) ?? [];
  return {
    data: [
      {
        id: market.eventSlug!,
        title: market.title,
        description: market.description,
        outcomePrices: ['50', '50'],
        collateralToken: {
          address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
          decimals: 6,
          symbol: 'USDC',
        },
        conditionId: market.id.toString(),
        creator: {
          name: 'Viral Games',
        },
        expirationDate: market.createdAt, // TODO
        expirationTimestamp: new Date(market.createdAt).getTime(), // TODO
        expired: false,
        liquidity: '0',
        liquidityFormatted: '0',
        ogImageURI:
          metadata?.image_uri ??
          market.imageUrl ??
          'https://nzavwarwntmwtfrkfput.supabase.co/storage/v1/object/public/markets_images/app-logo.svg?t=2024-08-23T09%3A29%3A21.086Z',
        tags: [...metadataTags, DEFAULT_CUSTOM_PROVIDER_TAG],
        // volume: market.volume,
        volumeFormatted: '0',
        winningOutcomeIndex: null, // TODO
        chainId: 8453,
        provider: 'custom',
      },
    ],
    metadata: {
      // ...metadata, NOTE: Currently metadata for Polymarket is not set in supabase
      address: metadata?.address ?? null,
      created_at: metadata?.created_at ?? null,
      image_uri: metadata?.image_uri ?? market.imageUrl,
      tags: metadataTags,
      provider: 'custom',
      title: metadata?.title ?? market.title,
    },
  };
}
