// BaseMarketProvider.ts

import { MarketMetadata, MarketsWithMetadata } from '@/types/market';
import { MarketProvider } from '../MarketProvider';
import { supabase } from '@/app/api/[...route]/utils';

export abstract class BaseProvider implements MarketProvider {
  abstract getMarket(marketId: string): Promise<MarketsWithMetadata>;

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
}
