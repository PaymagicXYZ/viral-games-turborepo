import { defaultChain, newSubgraphURI } from '@/lib/constants';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { Hash, formatUnits, Address } from 'viem';
import { useAccount } from 'wagmi';
import { usePriceOracle } from './PriceProvider';
import useSupportedTokens from '@/lib/hooks/useSupportedTokens';
import { useAllMarkets } from '@/lib/services/MarketService';

interface IHistoryService {
  trades: HistoryTrade[] | undefined;
  getTrades: () => Promise<QueryObserverResult<HistoryTrade[], Error>>;
  redeems: HistoryRedeem[] | undefined;
  getRedeems: () => Promise<QueryObserverResult<HistoryRedeem[], Error>>;
  positions: HistoryPosition[] | undefined;
  getPositions: () => Promise<QueryObserverResult<HistoryPosition[], Error>>;
  balanceInvested: string;
  balanceToWin: string;
}

const HistoryServiceContext = createContext({} as IHistoryService);

export const useHistory = () => useContext(HistoryServiceContext);

export const HistoryServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * ACCOUNT
   */
  const walletAddress = useAccount().address;

  /**
   * UTILS
   */
  const { convertAssetAmountToUsd } = usePriceOracle();
  const markets = useAllMarkets();

  const { supportedTokens } = useSupportedTokens();

  /**
   * QUERIES
   */
  const { data: trades, refetch: getTrades } = useQuery({
    queryKey: ['trades', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return [];
      }

      const queryName = 'Trade';

      const response = await fetch(newSubgraphURI[defaultChain.id], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          query: `
            query ${queryName} {
              ${queryName} (
                where: {transactor: { _ilike: "${walletAddress}" } }
              ) {
                market {
                  id
                  closed
                  funding
                  condition_id
                  collateral {
                    symbol
                  }
                }
                outcomeTokenAmounts
                outcomeTokenNetCost
                blockTimestamp
                transactionHash
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const _trades = data.data?.[queryName] as HistoryTrade[];
      _trades.map((trade) => {
        const collateralToken = supportedTokens?.find(
          (token) => token.symbol === trade.market.collateral?.symbol,
        );
        const outcomeTokenAmountBI = BigInt(
          trade.outcomeTokenAmounts.find(
            (amount) => BigInt(amount) != BigInt(0),
          ) ?? 0,
        );
        trade.outcomeTokenAmount = formatUnits(
          outcomeTokenAmountBI,
          collateralToken?.decimals || 18,
        );
        trade.strategy = Number(trade.outcomeTokenAmount) > 0 ? 'Buy' : 'Sell';
        trade.outcomeIndex = trade.outcomeTokenAmounts.findIndex(
          (amount) => BigInt(amount) != BigInt(0),
        );
        trade.collateralAmount = formatUnits(
          BigInt(trade.outcomeTokenNetCost),
          collateralToken?.decimals || 18,
        );
        trade.outcomeTokenPrice = (
          Number(trade.collateralAmount) / Number(trade.outcomeTokenAmount)
        ).toString();

        // trade.outcomePercent = Number(trade.outcomeTokenPrice)
      });

      _trades.sort(
        (tradeA, tradeB) =>
          Number(tradeB.blockTimestamp) - Number(tradeA.blockTimestamp),
      );

      return _trades;
    },
    enabled: !!walletAddress && !!supportedTokens?.length,
  });

  const { data: redeems, refetch: getRedeems } = useQuery({
    queryKey: ['redeems', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return [];
      }

      const queryName = 'Redemption';

      const response = await fetch(newSubgraphURI[defaultChain.id], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          query: `
            query ${queryName} {
              ${queryName} (
                where: {
                  redeemer: {
                    _ilike: "${walletAddress}"
                  } 
                }
              ) {
                payout
                conditionId
                indexSets
                blockTimestamp
                transactionHash
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const _redeems = data.data?.[queryName] as HistoryRedeem[];
      _redeems.map((redeem) => {
        redeem.collateralAmount = formatUnits(
          BigInt(redeem.payout),
          supportedTokens?.find(
            (token) => token.address === redeem.collateralToken,
          )?.decimals || 18,
        );
        redeem.outcomeIndex = redeem.indexSets[0] == '1' ? 0 : 1;
      });

      _redeems.filter((redeem) => Number(redeem.collateralAmount) > 0);

      _redeems.sort(
        (redeemA, redeemB) =>
          Number(redeemB.blockTimestamp) - Number(redeemA.blockTimestamp),
      );

      return _redeems;
    },
  });

  // Todo change to useMemo
  /**
   * Consolidate trades and redeems to get open positions
   */

  const { data: positions, refetch: getPositions } = useQuery({
    queryKey: ['positions', trades, redeems],
    queryFn: async () => {
      let _positions: HistoryPosition[] = [];
      console.log(trades);
      console.log(markets);
      trades?.forEach((trade) => {
        // TODO: replace hardcoded markets with dynamic

        const market = markets?.find(
          (market) =>
            market.address.toLowerCase() === trade.market.id.toLowerCase(),
        );

        if (
          !market ||
          (market.expired && market.winningOutcomeIndex !== trade.outcomeIndex) // TODO: redesign filtering lost positions
        ) {
          return;
        }
        const existingMarket = _positions.find(
          (position) =>
            position.market.id === trade.market.id &&
            position.outcomeIndex === trade.outcomeIndex,
        );

        const position = existingMarket ?? {
          market: trade.market,
          outcomeIndex: trade.outcomeIndex,
        };
        position.latestTrade = trade;
        position.collateralAmount = (
          Number(position.collateralAmount ?? 0) +
          Number(trade.collateralAmount)
        ).toString();
        position.outcomeTokenAmount = (
          Number(position.outcomeTokenAmount ?? 0) +
          Number(trade.outcomeTokenAmount)
        ).toString();
        if (!existingMarket) {
          _positions.push(position);
        }
      });

      // redeems?.forEach((redeem) => {
      //   const position = _positions.find(
      //     (position) =>
      //       position.market.conditionId === redeem.conditionId &&
      //       position.outcomeIndex == redeem.outcomeIndex
      //   )
      //   if (!position) {
      //     return
      //   }
      //   position.collateralAmount = (
      //     Number(position.collateralAmount ?? 0) - Number(redeem.collateralAmount)
      //   ).toString()
      //   position.outcomeTokenAmount = (
      //     Number(position.outcomeTokenAmount ?? 0) - Number(redeem.collateralAmount)
      //   ).toString()
      // })

      // filter redeemed markets
      _positions = _positions.filter(
        (position) =>
          !redeems?.find(
            (redeem) => redeem.conditionId === position.market.condition_id,
          ),
      );

      // filter markets with super small balance
      _positions = _positions.filter(
        (position) => Number(position.outcomeTokenAmount) > 0.00001,
      );

      // Todo remove this mapping
      return _positions.map((position) => ({
        ...position,
        market: {
          ...position.market,
          collateral: {
            symbol: position.market.collateral?.symbol
              ? position.market.collateral?.symbol
              : 'MFER',
          },
        },
      }));
    },
    enabled: !!walletAddress && !!markets?.length && !!trades,
  });

  /**
   * BALANCES
   */
  const balanceInvested = useMemo(() => {
    let _balanceInvested = 0;
    positions?.forEach((position) => {
      let positionUsdAmount = 0;
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateral?.symbol,
      );
      if (!!token) {
        positionUsdAmount = convertAssetAmountToUsd(
          token.priceOracleId,
          position.collateralAmount,
        );
      }
      _balanceInvested += positionUsdAmount;
    });
    return NumberUtil.toFixed(_balanceInvested, 2);
  }, [positions]);

  const balanceToWin = useMemo(() => {
    let _balanceToWin = 0;
    positions?.forEach((position) => {
      let positionOutcomeUsdAmount = 0;
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateral?.symbol,
      );
      if (!!token) {
        positionOutcomeUsdAmount = convertAssetAmountToUsd(
          token.priceOracleId,
          position.outcomeTokenAmount,
        );
      }
      _balanceToWin += positionOutcomeUsdAmount;
    });
    return NumberUtil.toFixed(_balanceToWin, 2);
  }, [positions]);

  const contextProviderValue: IHistoryService = {
    trades,
    getTrades,
    redeems,
    getRedeems,
    positions,
    getPositions,
    balanceInvested,
    balanceToWin,
  };

  return (
    <HistoryServiceContext.Provider value={contextProviderValue}>
      {children}
    </HistoryServiceContext.Provider>
  );
};

export type HistoryTrade = {
  market: HistoryMarket;
  strategy?: 'Buy' | 'Sell';
  outcomeIndex: number;
  outcomeTokenAmounts: string[];
  outcomeTokenAmount?: string; // outcome token amount traded
  outcomeTokenPrice?: string; // collateral per outcome token
  outcomeTokenNetCost: string;
  // outcomePercent?: number // 50% yes / 50% no
  collateralAmount?: string; // collateral amount traded
  blockTimestamp: string;
  transactionHash: Hash;
};

export type HistoryMarket = {
  id: Address;
  condition_id: Hash; //#TODO align namings to conditionId
  paused?: boolean;
  closed?: boolean;
  funding?: string;
  holdersCount?: number;
  collateral?: {
    symbol: string;
  };
};

export type HistoryRedeem = {
  payout: string; // collateral amount raw
  collateralAmount: string; // collateral amount formatted
  conditionId: Hash;
  indexSets: string[]; // ["1"] for Yes
  outcomeIndex: number;
  blockTimestamp: string;
  transactionHash: Hash;
  collateralToken: string;
};

export type HistoryPosition = {
  market: HistoryMarket;
  outcomeIndex: number;
  outcomeTokenAmount?: string;
  collateralAmount?: string; // collateral amount invested
  latestTrade?: HistoryTrade;
};
