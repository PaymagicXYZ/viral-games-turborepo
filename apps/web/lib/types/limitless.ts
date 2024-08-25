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
