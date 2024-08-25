import {
  MarketGroupCardResponse,
  MarketsWithMetadata,
  PaginatedMarketResponse,
} from '@/types/market';
import { GAMMA_API_URL } from '@/app/api/[...route]/utils/constants';
import { PolymarketResponse } from '@/types/polymarket';
import { transformPolymarketResponse } from '../transformers/polymarketTransformer';
import { BaseProvider } from './BaseProvider';
import { supabase } from '@/app/api/[...route]/utils';

export class PolymarketProvider extends BaseProvider {
  async getMarket(marketId: string): Promise<MarketsWithMetadata> {
    const res = await fetch(`${GAMMA_API_URL}/events?slug=${marketId}`);
    const data = (await res.json())[0] as PolymarketResponse;

    // Fetch metadata from Supabase
    const metadata = await this.fetchMetadata(marketId);
    // Transform the response
    return transformPolymarketResponse(data, metadata);
  }

  async getMarkets(
    limit: number,
    offset: number = 0,
  ): Promise<PaginatedMarketResponse> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('provider', 'polymarket')
      .range(offset, offset + limit - 1);

    if (!events) {
      // console.error('Error fetching markets from Supabase:', error);
      return {
        markets: [],
        offset: null,
      };
    }
    const metadatas = await this.fetchMetadatas(
      events.map((event) => event.slug),
    );
    const eventSlugs = events.map((event) => event.slug);
    const { data: markets } = await supabase
      .from('markets')
      .select('*')
      .in('eventSlug', eventSlugs);
    //   const eventsWithMetadata = data.reduce((acc, event) => {
    //   const events = await supabase.from()
    // const data = (await response.json()) as Array<PolymarketResponse>;
    // const marketsMetadata =

    return {
      markets: events.map((event): MarketGroupCardResponse => {
        const metadata = metadatas.find((m) => m.address === event.slug);
        const _markets =
          markets?.filter((m) => m.eventSlug === event.slug) || [];
        return {
          category: metadata?.tags?.[0] || 'General',
          title: event.title ?? 'N/A',
          collateralToken: {
            address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
            decimals: 6,
            symbol: 'USDC',
          },
          createdAt: event.createdAt,
          markets: _markets,
          deadline: event.endDate,
          slug: event.slug,
        };
      }),
      offset: offset + limit,
    };
  }
}
