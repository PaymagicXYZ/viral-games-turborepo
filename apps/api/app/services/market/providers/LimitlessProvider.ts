import {
  MarketGroupCardResponse,
  MarketsWithMetadata,
  PaginatedMarketResponse,
} from '@/types/market';
import { LimitlessResponse } from '@/types/limitless';
import { transformLimitlessResponse } from '../transformers/limitlessTransformer';
import { supabase } from '@/app/api/[...route]/utils';
import { getMarketOutcomeBuyPrice } from '@/app/api/[...route]/utils/viem';
import { BaseProvider } from './BaseProvider';
import { DEFAULT_LIMITLESS_TAG } from '@/app/api/[...route]/utils/constants';

export class LimitlessProvider extends BaseProvider {
  async getMarket(marketId: string): Promise<MarketsWithMetadata> {
    // Implement Polymarket-specific fetching logic
    const res = await fetch(
      `https://api.limitless.exchange/markets/${marketId}`,
    );
    const data = (await res.json()) as LimitlessResponse;

    // Fetch metadata from Supabase
    const metadata = await this.fetchMetadata(marketId);
    // Transform the response
    return transformLimitlessResponse(data, metadata);
  }

  async getMarkets(
    limit: number,
    offset: string = '0',
  ): Promise<PaginatedMarketResponse> {
    const res = await fetch(`https://api.limitless.exchange/markets/active`);
    const events = (await res.json()) as Array<LimitlessResponse>;

    if (!events) {
      return {
        markets: [],
        offset: null,
      };
    }
    const metadatas = await this.fetchMetadatas(
      events.map((event) => event.address),
    );

    return {
      markets: events.map((event): MarketGroupCardResponse => {
        const metadata = metadatas.find((m) => m.address === event.address);
        const _markets: never[] = []; // TODO: Once 'Groups' go live, we need to update this
        const _tags = [DEFAULT_LIMITLESS_TAG];
        const metadataTags = metadata?.tags?.map((t) => t.toLowerCase()) ?? [];
        const eventTags = event.tags?.map((tag) => tag.toLowerCase()) || [];
        _tags.push(...metadataTags, ...eventTags);
        return {
          category: _tags,
          title: event.title ?? 'N/A',
          collateralToken: event.collateralToken,
          provider: 'limitless',
          markets: _markets,
          deadline: new Date(event.expirationTimestamp ?? 0).toISOString(),
          slug: event.address,
          imageUrl: metadata?.image_uri ?? event.ogImageURI,
        };
      }),
      offset: (offset + limit).toString(),
    };
  }

  async fetchMetadata(marketId: string) {
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

  static async getMarketOutcomeBuyPrice(market: LimitlessResponse) {
    let outcomePrices = ['50', '50'];

    //TODO remove this hot-fix
    if (market.expired) {
      if (market?.winningOutcomeIndex === 0) {
        outcomePrices = ['100', '0'];
      } else if (market?.winningOutcomeIndex === 1) {
        outcomePrices = ['0', '100'];
      } else {
        outcomePrices = ['50', '50'];
      }
    } else {
      const buyPrices = await getMarketOutcomeBuyPrice(
        market.collateralToken.decimals,
        market.address,
        'base',
      );

      const sum = buyPrices[0] + buyPrices[1];
      const outcomeTokensPercentYes = +((buyPrices[0] / sum) * 100).toFixed(1);
      const outcomeTokensPercentNo = +((buyPrices[1] / sum) * 100).toFixed(1);

      outcomePrices = [
        outcomeTokensPercentYes.toString(),
        outcomeTokensPercentNo.toString(),
      ];
    }

    return outcomePrices;
  }
}
