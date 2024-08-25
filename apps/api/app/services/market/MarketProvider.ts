import { Tables } from '@/types/database.types';
import { Market, MarketsWithMetadata } from '@/types/market';

export interface MarketProvider {
  getMarket(marketId: string): Promise<MarketsWithMetadata>;
  fetchMetadata(marketId: string): Promise<Tables<'markets_with_tags'> | null>;
}
