import { MarketsWithMetadata, PaginatedMarketResponse } from '@/types/market';
import { BaseProvider } from './BaseProvider';

export class CustomProvider extends BaseProvider {
  async getMarket(marketId: string): Promise<MarketsWithMetadata> {
    // TODO: Implement CustomProvider-specific fetching logic
    return null as any;
  }
  async getMarkets(
    limit: number,
    offset: string = '0',
  ): Promise<PaginatedMarketResponse> {
    // TODO: Implement CustomProvider-specific fetching logic
    return null as any;
  }
}
