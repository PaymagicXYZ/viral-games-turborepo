import { Tables } from './database.types';
import { CollateralToken } from './limitless';

export interface PaginatedMarketResponse {
  markets: Array<MarketGroupCardResponse>;
  nextCursor?:  null | string;
  offset?: string | null; // Note: To be deprecated
}

export type MarketGroupCardResponse = {
  slug: string;
  title: string;
  // createdAt: string;
  imageUrl: string;
  deadline: string;
  collateralToken: CollateralToken;
  markets: Array<Tables<'markets'>>;
  category: string[];
  provider: 'polymarket' | 'limitless';
};

export interface MarketsWithMetadata {
  data: Array<Market>;
  metadata: MarketMetadata | null;
  // Add other common properties
}

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
