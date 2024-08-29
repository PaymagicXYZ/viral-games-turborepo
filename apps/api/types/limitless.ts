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

export interface LimitlessGroupMarketResponse {
  slug: string
  hidden: boolean;
  outcomeTokens: string
  title: string
  ogImageURI: string
  expirationDate: string
  expired: boolean;
  creator: Creator;
  collateralToken: CollateralToken;
  tags: string[];
  createdAt: string
  category: string
  status: string
  markets: Array<LimitlessResponse>;
}

// Note: Response for an individual event present in the limitless api /all response
export interface LimitlessGroupOverviewResponse {
  slug: string;
  title: string;
  createdAt: string;
  deadline: string;
  collateralToken: CollateralToken;
  markets: Array<LimitlessGroupMarket>;
}

// Note: Response for an individual market present in the limitless api /all response
export interface LimitlessOverviewResponse extends LimitlessGroupMarket {
  deadline: string;
  collateralToken: CollateralToken;
}

// Note: Response for a market that's part of an event in the limitless api /all response
export interface LimitlessGroupMarket {
  address: string;
  title: string;
  proxyTitle: string | null;
  createdAt: string;
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
