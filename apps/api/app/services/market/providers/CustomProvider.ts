import {
  MarketGroupCardResponse,
  MarketGroupOverviewRequired,
  MarketsWithMetadata,
  PaginatedMarketResponse,
} from '@/types/market';
import { BaseProvider } from './BaseProvider';
import { supabase } from '@/app/api/[...route]/utils';
import { transformCustomResponse } from '../transformers/customTransformer';
import { DEFAULT_CUSTOM_PROVIDER_TAG } from '@/app/api/[...route]/utils/constants';
export class CustomProvider extends BaseProvider {
  async getMarket(marketId: string): Promise<MarketsWithMetadata> {
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .ilike('slug', marketId)
      .limit(1)
      .maybeSingle();

    if (!event) {
      return {
        data: [],
        metadata: null,
      };
    }

    const { data } = await supabase
      .from('markets')
      .select('*')
      .ilike('eventSlug', marketId)
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
    return transformCustomResponse(data, event, metadata);
  }

  // TODO
  async getMarkets(
    limit: number,
    offset: string = '0',
  ): Promise<PaginatedMarketResponse> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('provider', 'custom')
      .order('endDate', { ascending: false })
      .range(+offset, +offset + limit - 1);

    if (!events) {
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

    return {
      markets: events.map((event): MarketGroupCardResponse => {
        const metadata = metadatas.find((m) => m.address === event.slug);
        const _markets: Array<MarketGroupOverviewRequired> =
          markets
            ?.filter((m) => m.eventSlug === event.slug)
            .map((m) => ({
              id: m.id,
              title: m.title,
              imageUrl: m.imageUrl,
            })) || [];
        const _tags = [DEFAULT_CUSTOM_PROVIDER_TAG];
        const metadataTags = metadata?.tags?.map((t) => t.toLowerCase()) ?? [];
        _tags.push(...metadataTags);
        return {
          category: _tags,
          title: event.title ?? 'N/A',
          collateralToken: {
            address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
            decimals: 6,
            symbol: 'USDC',
          },
          provider: 'custom',
          markets: _markets,
          deadline: event.endDate,
          slug: event.slug,
          imageUrl:
            metadata?.image_uri ??
            event.imageUrl ??
            'https://nzavwarwntmwtfrkfput.supabase.co/storage/v1/object/public/markets_images/app-logo.svg?t=2024-08-23T09%3A29%3A21.086Z',
        };
      }),
      offset: offset + limit,
    };
  }
}
