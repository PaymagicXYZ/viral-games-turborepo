import {
  MarketGroupCardResponse,
  MarketGroupOverviewRequired,
  MarketsWithMetadata,
  PaginatedMarketResponse,
} from '@/types/market';
import {
  LimitlessGroupMarketResponse,
  LimitlessGroupOverviewResponse,
  LimitlessOverviewResponse,
  LimitlessResponse,
} from '@/types/limitless';
import { transformLimitlessResponse } from '../transformers/limitlessTransformer';
import { supabase } from '@/app/api/[...route]/utils';
import { getMarketOutcomeBuyPrice } from '@/app/api/[...route]/utils/viem';
import { BaseProvider } from './BaseProvider';
import { DEFAULT_LIMITLESS_TAG } from '@/app/api/[...route]/utils/constants';
import { isAddress } from 'viem';

export class LimitlessProvider extends BaseProvider {
  async getMarket(marketId: string): Promise<MarketsWithMetadata> {
    const isSingleMarket = isAddress(marketId);
    const apiEndpoint = isSingleMarket ? 'markets' : 'markets-groups';
    // Implement Polymarket-specific fetching logic
    const res = await fetch(
      `https://api.limitless.exchange/${apiEndpoint}/${marketId}`,
    );
    const data = (await res.json()) as
      | LimitlessResponse
      | LimitlessGroupMarketResponse;

    const metadata = await this.fetchMetadata(marketId);

    if ('slug' in data) {
      // Note: Response is a market group
      return transformLimitlessResponse(data, metadata);
    } else {
      // Note: Response is a single market
      return transformLimitlessResponse(data, metadata);
    }
  }

  async getMarkets(
    limit: number,
    offset: string = '0',
  ): Promise<PaginatedMarketResponse> {
    const res = await fetch(
      `https://api.limitless.exchange/markets/active?limit=50`,
    );
    const events = (await res.json()) as Array<
      LimitlessOverviewResponse | LimitlessGroupOverviewResponse
    >;

    if (!events) {
      return {
        markets: [],
        offset: null,
      };
    }

    const metadatas = await this.fetchMetadatas(
      events.map((event) => {
        const isEventGroup = 'slug' in event; // Note: check if the event is a group or a single market
        const marketIdentifier = isEventGroup ? event.slug : event.address;
        return marketIdentifier;
      }),
    );

    return {
      markets: events.map((event): MarketGroupCardResponse => {
        const isEventGroup = 'slug' in event; // Note: check if the event is a group or a single market
        const marketIdentifier = isEventGroup ? event.slug : event.address;
        const metadata = metadatas.find((m) => {
          return m.address === marketIdentifier;
        });
        const _markets: Array<MarketGroupOverviewRequired> = isEventGroup
          ? event.markets.map((m) => ({
              id: m.address,
              imageUrl: metadata?.image_uri ?? '',
              title: m.title,
            }))
          : []; // TODO: Once 'Groups' go live, we need to update this
        const _tags = [DEFAULT_LIMITLESS_TAG];
        const metadataTags = metadata?.tags?.map((t) => t.toLowerCase()) ?? [];
        // const eventTags = isEventGroup ? event.tags?.map((tag) => tag.toLowerCase()) || [];
        _tags.push(...metadataTags);
        return {
          category: _tags,
          title: event.title ?? 'N/A',
          collateralToken: event.collateralToken,
          provider: 'limitless',
          markets: _markets,
          deadline: new Date(event.deadline).toISOString(),
          slug: isEventGroup ? event.slug : event.address,
          imageUrl:
            metadata?.image_uri ??
            'https://nzavwarwntmwtfrkfput.supabase.co/storage/v1/object/public/markets_images/app-logo.svg?t=2024-08-23T09%3A29%3A21.086Z',
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

  static async getMarketOutcomeBuyPrice(market: {
    expired: boolean;
    winningOutcomeIndex: number | null;
    collateralToken: { decimals: number; symbol: string };
    address: string;
  }) {
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
