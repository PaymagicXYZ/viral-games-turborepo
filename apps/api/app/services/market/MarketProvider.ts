import { Tables } from '@/types/database.types';
import {
  Market,
  MarketsWithMetadata,
  PaginatedMarketResponse,
} from '@/types/market';

export interface MarketProvider {
  getMarket(marketId: string): Promise<MarketsWithMetadata>;
  getMarkets(limit: number, offset?: string): Promise<PaginatedMarketResponse>;
}
