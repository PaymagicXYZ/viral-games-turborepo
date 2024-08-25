import { Market } from "@/types/market";

export interface MarketProvider {
  getMarket(marketId: string): Promise<Market>;
}
