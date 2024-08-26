import { MarketMetadata, MarketsWithMetadata } from '@/types/market';
import { PolymarketResponse } from '@/types/polymarket';

export function transformPolymarketResponse(
  response: PolymarketResponse,
  metadata: MarketMetadata | null,
): MarketsWithMetadata {
  return {
    data: response.markets.map((market) => {
      // Note: Polymarket returns outcome prices as a stringified array
      const normalizedOutcomePrices = JSON.parse(
        market.outcomePrices,
      ) as string[];

      const winningIndex = normalizedOutcomePrices.findIndex(
        (price) => price === '1',
      );

      return {
        id: market.slug,
        title: market.question,
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
        liquidity: market.volume,
        liquidityFormatted: market.volumeNum.toString(),
        ogImageURI: market.image,
        tags: response.tags.map((tag) => tag.label),
        // volume: market.volume,
        volumeFormatted: market.volume,
        winningOutcomeIndex: winningIndex >= 0 ? winningIndex : null,
      };
    }),
    metadata,
  };
}
