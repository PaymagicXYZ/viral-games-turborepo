import { DEFAULT_POLYMARKET_TAG } from '@/app/api/[...route]/utils/constants';
import { MarketMetadata, MarketsWithMetadata } from '@/types/market';
import { PolymarketResponse } from '@/types/polymarket';

export function transformPolymarketResponse(
  response: PolymarketResponse,
  metadata: MarketMetadata | null,
): MarketsWithMetadata {
  return {
    data: response.markets.map((market) => {
      // Note: Polymarket returns outcome prices as a stringified array
      const normalizedOutcomePrices = (
        JSON.parse(market.outcomePrices) as string[]
      ).map((price) => (+price * 100).toFixed(2));

      const winningIndex = normalizedOutcomePrices.findIndex(
        (price) => price === '1',
      );

      const metadataTags = metadata?.tags?.map((t) => t.toLowerCase()) ?? [];

      return {
        id: market.slug,
        title: market.groupItemTitle || market.question,
        description: market.description,
        outcomePrices: normalizedOutcomePrices,
        collateralToken: {
          address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
          decimals: 6,
          symbol: 'USDC',
        },
        conditionId: market.conditionId,
        creator: {
          name: 'Polymarket',
        },
        expirationDate: market.endDate,
        expirationTimestamp: new Date(market.endDate).getTime(),
        expired: market.active === false,
        liquidity: market.liquidity ?? '0',
        liquidityFormatted: market.liquidity ?? '0',
        ogImageURI:
          metadata?.image_uri ??
          market.image ??
          'https://nzavwarwntmwtfrkfput.supabase.co/storage/v1/object/public/markets_images/app-logo.svg?t=2024-08-23T09%3A29%3A21.086Z',
        tags: [
          ...response.tags.map((tag) => tag.label.toLowerCase()),
          ...metadataTags,
          DEFAULT_POLYMARKET_TAG,
        ],
        // volume: market.volume,
        volumeFormatted: market.volume,
        winningOutcomeIndex: winningIndex >= 0 ? winningIndex : null,
        chainId: 8453,
        provider: 'polymarket',
      };
    }),
    metadata: {
      // ...metadata, NOTE: Currently metadata for Polymarket is not set in supabase
      address: null,
      created_at: null,
      image_uri: null,
      tags: null,
      provider: 'polymarket',
      title: response.title,
    },
  };
}
