import { MarketsWithMetadata } from '@/types/market';
import { GAMMA_API_URL } from '@/app/api/[...route]/utils/constants';
import { PolymarketResponse } from '@/types/polymarket';
import { transformPolymarketResponse } from '../transformers/polymarketTransformer';
import { BaseProvider } from './BaseProvider';

export class PolymarketProvider extends BaseProvider {
  async getMarket(marketId: string): Promise<MarketsWithMetadata> {
    const res = await fetch(`${GAMMA_API_URL}/events?slug=${marketId}`);
    const data = (await res.json())[0] as PolymarketResponse;

    // Fetch metadata from Supabase
    const metadata = await this.fetchMetadata(marketId);
    // Transform the response
    return transformPolymarketResponse(data, metadata);
  }
}
