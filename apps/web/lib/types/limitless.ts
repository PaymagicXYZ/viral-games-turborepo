import { Tables } from '@repo/shared-types';
import { Address } from 'viem';

export type Token = {
  address: Address;
  symbol: string;
  decimals: number;
  name: string;
  logoUrl: string;
  priceOracleId: MarketTokensIds;
  id: MarketTokensIds;
};

export enum MarketTokensIds {
  DEGEN = 'degen-base',
  ETH = 'ethereum',
  WETH = 'ethereum',
  HIGHER = 'higher',
  MFER = 'mfercoin',
  ONCHAIN = 'onchain',
  REGEN = 'regen',
  USDC = 'usd-coin',
  VITA = 'vitadao',
  BETS = 'all-street-bets',
  GHST = 'aavegotchi',
}

export type TradeQuotes = {
  outcomeTokenAmount: string; // amount of outcome token to be traded based on collateral amount input or ctBalance
  outcomeTokenPrice: string; // average cost per outcome token
  roi: string; // return on investment aka profitability percentage
  priceImpact: string; // price fluctuation percentage
};

export enum MarketStatus {
  RESOLVED = 'RESOLVED',
  FUNDED = 'FUNDED',
  LOCKED = 'LOCKED',
}

type MarketMetadata = Tables<'markets_metadata'>;

export type MarketSingleCardResponseWithMetadata = MarketSingleCardResponse & {
  metadata: MarketMetadata;
};

export type MarketGroupCardResponseWithMetadata = Omit<
  MarketGroupCardResponse,
  'markets'
> & {
  markets: MarketSingleCardResponseWithMetadata[];
};

export type MarketResponseWithMetadata =
  | MarketGroupCardResponseWithMetadata
  | MarketSingleCardResponseWithMetadata;

export type OddsData = {
  prices: number[];
};

export type MarketSingleCardResponse = {
  address: string;
  title: string;
  proxyTitle: string | null;
  deadline: string;
  createdAt: string;
  volume: string;
  volumeFormatted: string;
  liquidity: string;
  liquidityFormatted: string;
  collateralToken: CollateralToken;
  category: string;
  prices: number[];
};

export type MarketGroupCardResponse = {
  slug: string;
  title: string;
  createdAt: string;
  deadline: string;
  collateralToken: CollateralToken;
  markets: MarketSingleCardResponse[];
  category: string;
};

export type MarketData = {
  data: (MarketGroupCardResponse | MarketSingleCardResponse)[];
  next: number;
};

export interface CollateralToken {
  address: Address;
  decimals: number;
  symbol: string;
}

export interface Market {
  address: Address;
  conditionId: Address;
  description: string;
  collateralToken: CollateralToken;
  title: string;
  proxyTitle: string | null;
  ogImageURI: string | null;
  expirationDate: string;
  expirationTimestamp: number;
  winningOutcomeIndex: number | null;
  expired: boolean;
  tags: string[];
  volume: string;
  volumeFormatted: string;
  liquidity: string;
  liquidityFormatted: string;
  prices: number[];
  status: MarketStatus;
  group?: {
    id: number;
    title: string;
    slug: string;
  };
}

interface Creator {
  name: string;
  imageURI?: string;
  link?: string;
  address?: string;
}

export interface SingleMarket extends Market {
  creator: Creator;
  metadata: MarketMetadata;
}

export type GetBalanceResult = {
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
  image: string;
  name: string;
  contractAddress: string;
  price: number;
  id: MarketTokensIds;
};

export type Category = {
  id: number;
  name: string;
};

export type BuySuccessResponse = {
  message: string;
  remainingBalance: number;
  updatedPortfolio: {
    shares: number;
  };
  updatedPoints: number;
};

export type BuyErrorResponse = {
  error: string;
};


export type AccountMarketResponse = {
  account_id: string
  market: {
    id: string
    closed: boolean
    collateral: {
      id: string
      name: string
      symbol: string
    }
  }
  collateralsInvested: string
  collateralsLocked: string
}

export interface RedeemParams {
  outcomeIndex: number
  marketAddress: Address
  collateralAddress: Address
  conditionId: Address
}
