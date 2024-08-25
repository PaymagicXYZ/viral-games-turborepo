import {
  MarketGroupCardResponse,
  PaginatedMarketResponse,
} from '@/types/market';
import { MarketProviderFactory } from './MarketProviderFactory';

interface ProviderCursors {
  [provider: string]: string | null | undefined;
}

interface CursorData {
  providerCursors: ProviderCursors;
  offset: number;
}

export class AggregateMarketService {
  private providers = ['polymarket', 'limitless'];

  async getAggregatedMarkets(
    limit: number,
    cursor?: string,
  ): Promise<PaginatedMarketResponse> {
    let cursorData: CursorData = { providerCursors: {}, offset: 0 };

    if (cursor) {
      try {
        cursorData = JSON.parse(atob(cursor)) as CursorData;
      } catch (error) {
        throw new Error('Invalid cursor format');
      }
    }

    const providerResponses = await Promise.all(
      this.providers.map((provider) =>
        MarketProviderFactory.getProvider(provider).getMarkets(
          limit,
          cursorData.providerCursors[provider] || undefined,
        ),
      ),
    );

    const allMarkets: MarketGroupCardResponse[] = providerResponses.flatMap(
      (response) => response.markets,
    );

    const nextProviderCursors: ProviderCursors = {};
    this.providers.forEach((provider, index) => {
      nextProviderCursors[provider] = providerResponses[index].nextCursor;
    });

    const hasMore = allMarkets.length > cursorData.offset + limit;
    const nextOffset = cursorData.offset + limit;

    const nextCursorData: CursorData = {
      providerCursors: nextProviderCursors,
      offset: nextOffset,
    };
    // console.log('allMarkets', allMarkets[0]);
    return {
      markets: allMarkets.slice(cursorData.offset, nextOffset),
      nextCursor: hasMore ? btoa(JSON.stringify(nextCursorData)) : null,
    };
  }
}
