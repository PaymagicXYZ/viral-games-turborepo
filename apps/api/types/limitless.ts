export interface LimitlessResponse {
  address: string;
  conditionId: string;
  description: string;
  collateralToken: CollateralToken;
  deadline: string;
  title: string;
  proxyTitle: string | null;
  ogImageURI: string;
  expirationDate: string;
  expirationTimestamp: number;
  winningOutcomeIndex: number | null;
  status: string;
  expired: boolean;
  creator: Creator;
  tags: string[];
  volume: string;
  volumeFormatted: string;
  liquidity: string;
  liquidityFormatted: string;
}

export interface CollateralToken {
  address: string;
  decimals: number;
  symbol: string;
}
interface Creator {
  name: string;
  imageURI: string;
  link: string;
}
