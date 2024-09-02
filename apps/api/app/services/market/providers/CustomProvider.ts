import { MarketsWithMetadata, PaginatedMarketResponse } from '@/types/market';
import { BaseProvider } from './BaseProvider';
import { supabase } from '@/app/api/[...route]/utils';
import { transformCustomResponse } from '../transformers/customTransformer';
export class CustomProvider extends BaseProvider {
  async getMarket(marketId: string): Promise<MarketsWithMetadata> {
    const { data } = await supabase
      .from('markets')
      .select('*')
      .eq('eventSlug', marketId)
      .limit(1)
      .maybeSingle();

    if (!data) {
      return {
        data: [],
        metadata: null,
      };
    }
    // Fetch metadata from Supabase
    const metadata = await this.fetchMetadata(marketId);
    // Transform the response
    return transformCustomResponse(data, metadata);
  }

  // TODO
  async getMarkets(
    limit: number,
    offset: string = '0',
  ): Promise<PaginatedMarketResponse> {
    return {
      markets: [],
      nextCursor: null,
    };
  }
}
