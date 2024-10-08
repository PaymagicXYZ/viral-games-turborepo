import { Tables } from '@repo/shared-types';
import { CollateralToken, LimitlessGroupMarket } from './limitless';

export interface PaginatedMarketResponse {
  markets: Array<MarketGroupCardResponse>;
  nextCursor?: null | string;
  offset?: string | null; // Note: To be deprecated
}

export type MarketGroupCardResponse = {
  slug: string;
  title: string;
  // createdAt: string;
  imageUrl: string;
  deadline: string;
  collateralToken: CollateralToken;
  markets: Array<MarketGroupOverviewRequired>;
  category: string[];
  provider: 'polymarket' | 'limitless' | 'custom';
};

export type MarketGroupOverviewRequired = {
  id: number | string;
  title: string;
  imageUrl: string | null;
};

export interface MarketsWithMetadata {
  data: Array<Market>;
  metadata: MarketMetadata | null;
  // Add other common properties
}

export type MarketProvider = 'polymarket' | 'limitless' | 'custom';

export interface Market {
  id: string; // Note: For polymarkets, this is the slug. For limitless, this is the FPMM address.
  conditionId: string;
  description: string;
  collateralToken: CollateralToken;
  title: string;
  ogImageURI: string | null;
  expirationDate: string;
  expirationTimestamp: number;
  winningOutcomeIndex: number | null;
  expired: boolean;
  tags: string[];
  // volume: string;
  volumeFormatted: string;
  liquidity: string;
  liquidityFormatted: string;
  outcomePrices: string[];
  group?: {
    id: number;
    title: string;
    slug: string;
  };
  creator: Creator;
  chainId: number;
  provider: 'polymarket' | 'limitless' | 'custom';
}

type OverviewMarket = Tables<'events'> & {
  metadata: MarketMetadata;
};

interface Creator {
  name: string;
  imageURI?: string;
  link?: string;
  address?: string;
}

export type MarketMetadata = Tables<'markets_with_tags'>;
