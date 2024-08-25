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

type MarketMetadata = {};

export type MarketSingleCardResponseWithMetadata = MarketSingleCardResponse & {
  metadata: MarketMetadata;
};

export type MarketGroupCardResponseWithMetadata = Omit<
  MarketGroupCardResponse,
  'markets'
> & {
  markets: MarketSingleCardResponseWithMetadata[];
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

export interface SingleMarket extends Market {
  creator: Creator;
  metadata: MarketMetadata;
}

interface Creator {
  name: string;
  imageURI?: string;
  link?: string;
  address?: string;
}

export type MarketResponseWithMetadata =
  | MarketGroupCardResponseWithMetadata
  | MarketSingleCardResponseWithMetadata;

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
  GHST = 'aavegotchi'
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

export interface CollateralToken {
  address: Address;
  decimals: number;
  symbol: string;
}

export enum MarketStatus {
  RESOLVED = 'RESOLVED',
  FUNDED = 'FUNDED',
  LOCKED = 'LOCKED'
}
