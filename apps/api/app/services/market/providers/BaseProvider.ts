// BaseMarketProvider.ts

import {
  MarketMetadata,
  MarketsWithMetadata,
  PaginatedMarketResponse,
} from '@/types/market';
import { MarketProvider } from '../MarketProvider';
import { supabase } from '@/app/api/[...route]/utils';

export abstract class BaseProvider implements MarketProvider {
  abstract getMarket(marketId: string): Promise<MarketsWithMetadata>;
  abstract getMarkets(
    limit: number,
    offset?: string,
  ): Promise<PaginatedMarketResponse>;

  async fetchMetadata(marketId: string): Promise<MarketMetadata | null> {
    const { data, error } = await supabase
      .from('markets_with_tags')
      .select('*')
      .eq('address', marketId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching metadata from Supabase:', error);
      return null;
    }

    return data;
  }

  async fetchMetadatas(marketIds: string[]): Promise<Array<MarketMetadata>> {
    const { data, error } = await supabase
      .from('markets_with_tags')
      .select('*')
      .in('address', marketIds);

    if (error) {
      console.error('Error fetching metadata from Supabase:', error);
      return [];
    }

    return data;
  }
}
