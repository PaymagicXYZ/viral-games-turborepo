import { Tables } from './supabase';

export type CollateralToken = {
  address: string;
  decimals: number;
  symbol: string;
};

export type SupabaseMarket = {
  description: string;
  eventSlug: string | null;
  id: number;
  imageUrl: string | null;
  title: string;
};

export type MarketGroupCardResponse = {
  slug: string;
  title: string;
  provider: 'polymarket' | 'limitless';
  deadline: string;
  category: string;
  collateralToken: CollateralToken;
  markets: SupabaseMarket[];
  imageUrl: string | null;
};

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
}

export interface MarketGroupResponse {
  data: Array<Market>;
  metadata: Tables<'markets_metadata'>;
}

interface Creator {
  name: string;
  imageURI?: string;
  link?: string;
  address?: string;
}

export type PaginatedMarketResponse = {
  markets: MarketGroupCardResponse[];
  nextCursor: string | null;
};
