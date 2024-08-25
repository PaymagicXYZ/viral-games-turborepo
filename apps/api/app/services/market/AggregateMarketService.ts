// AggregateMarketService.ts
import { Market, MarketGroupCardResponse, PaginatedMarketResponse } from '@/types/market';
import { MarketProviderFactory } from './MarketProviderFactory';


type ProviderCursors = Record<string, string | null>;

export class AggregateMarketService {
  private providers = ['polymarket'];

  async getAggregatedMarkets(limit: number, cursors?: string): Promise<PaginatedMarketResponse> {
    let providerCursors: ProviderCursors = {};
    if (cursors) {
      try {
        providerCursors = JSON.parse(cursors) as ProviderCursors;
        console.log("providerCursors", providerCursors)
      } catch (error) {
        throw new Error('Invalid cursor format');
      }
    }

    const providerResponses = await Promise.all(
      this.providers.map(provider => 
        MarketProviderFactory.getProvider(provider).getMarkets(limit, providerCursors[provider] || undefined)
      )
    );

    const allMarkets: MarketGroupCardResponse[] = providerResponses.flatMap(response => response.markets);
    const nextCursors: ProviderCursors = {};

    this.providers.forEach((provider, index) => {
      nextCursors[provider] = providerResponses[index].offset;
    });

    const hasNextPage = Object.values(nextCursors).some(cursor => cursor !== null);

    return {
      markets: allMarkets.slice(0, limit),
      offset: hasNextPage ? JSON.stringify(nextCursors) : null
    };
  }
}