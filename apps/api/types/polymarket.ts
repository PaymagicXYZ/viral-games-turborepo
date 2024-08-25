// PolymarketResponse.ts
export interface PolymarketResponse {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  createdAt: string;
  updatedAt: string;
  competitive: number;
  volume24hr: number;
  enableOrderBook: boolean;
  liquidityClob: number;
  _sync: boolean;
  commentCount: number;
  markets: Array<PolymarketMarket>;
  tags: Array<Tag>;
  cyom: boolean;
  showAllOutcomes: boolean;
  showMarketImages: boolean;
  enableNegRisk: boolean;
  automaticallyActive: boolean;
}

interface Tag {
  id: string;
  label: string;
  slug: string;
  createdAt: string;
  _sync: boolean;
}

interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string[];
  outcomePrices: string; // Should be an array of strings but the api returns is stringified
  volume: string;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  archived: boolean;
  resolvedBy: string;
  restricted: boolean;
  groupItemTitle: string;
  groupItemThreshold: string;
  questionID: string;
  enableOrderBook: boolean;
  orderPriceMinTickSize: number;
  orderMinSize: number;
  volumeNum: number;
  liquidityNum: number;
  endDateIso: string;
  startDateIso: string;
  hasReviewedDates: boolean;
  volume24hr: number;
  clobTokenIds: string;
  umaBond: string;
  umaReward: string;
  volume24hrClob: number;
  volumeClob: number;
  liquidityClob: number;
  acceptingOrders: boolean;
  negRisk: boolean;
  commentCount: number;
  _sync: boolean;
  ready: boolean;
  funded: boolean;
  acceptingOrdersTimestamp: string;
  tags: Array<Tag>;
  cyom: boolean;
  competitive: number;
  pagerDutyNotificationEnabled: boolean;
  approved: boolean;
  clobRewards: Array<ClobReward>;
  rewardsMinSize: number;
  rewardsMaxSpread: number;
  spread: number;
  oneDayPriceChange: number;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  automaticallyActive: boolean;
}

interface ClobReward {
  id: string;
  conditionId: string;
  assetAddress: string;
  rewardsAmount: number;
  rewardsDailyRate: number;
  startDate: string;
  endDate: string;
}
