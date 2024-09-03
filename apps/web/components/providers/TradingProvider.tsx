import { conditionalTokensABI } from '@/abis/conditionalTokenABI';
import { fixedProductMarketMakerABI } from '@/abis/fixedProductMakerABI';
import { useConditionalTokensAddr } from '@/lib/hooks/limitless/useConditionalTokenAddress';
import { useToken } from '@/lib/hooks/limitless/useToken';
import { publicClient } from '@/lib/config/publicClient';
import { useMarketData } from '@/lib/hooks/limitless/useMarketData';
import { sleep } from '@/lib/utils';
import { calcSellAmountInCollateral } from '@/lib/utils/limitless/CalcSellAmount';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type Address,
  type Hash,
  Hex,
  formatUnits,
  getAddress,
  getContract,
  parseUnits,
  zeroHash,
} from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount } from 'wagmi';
import useErrorToast from '@/lib/hooks/toasts/useErrorToast';
import useGenericToast from '@/lib/hooks/toasts/useGenericToast';
import useSuccessToast from '@/lib/hooks/toasts/useSuccessToast';

import { Market } from '@/lib/types/markets';
import { useBalanceService } from './BalanceProvider';
import { useWeb3Service } from '@/lib/services/Web3Service';
import { RedeemParams } from '@/lib/types/limitless';

interface ITradingServiceContext {
  market: Market | null;
  setMarket: (market: Market | null) => void;
  strategy: 'Buy' | 'Sell';
  setStrategy: (side: 'Buy' | 'Sell') => void;
  balanceOfCollateralToSellYes: string;
  balanceOfCollateralToSellNo: string;
  collateralAmount: string;
  setCollateralAmount: (amount: string) => void;
  quotesYes: TradeQuotes | null | undefined;
  quotesNo: TradeQuotes | null | undefined;
  buy: (outcomeTokenId: number) => Promise<string | undefined>;
  sell: (outcomeTokenId: number) => Promise<string | undefined>;
  trade: (outcomeTokenId: number) => Promise<string | undefined>;
  redeem: (params: RedeemParams) => Promise<string | undefined>
  status: TradingServiceStatus;
  tradeStatus: TradingServiceStatus;
  approveModalOpened: boolean;
  setApproveModalOpened: Dispatch<SetStateAction<boolean>>;
  approveBuy: () => Promise<string | undefined>;
  approveSell: () => Promise<string | undefined>;
}

const TradingServiceContext = createContext({} as ITradingServiceContext);

export const TradingServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * UI HELPERS
   */
  const { triggerSuccessToast } = useSuccessToast();
  const { triggerErrorToast } = useErrorToast();
  const { triggerToast } = useGenericToast();
  const DISCORD_LINK = 'https://discord.gg/UQtv7h5ZFE';

  /**
   * SERVICES
   */
  const queryClient = useQueryClient();
  // const { getTrades, getRedeems } = useHistory();
  const account = useAccount().address;

  /**
   * OPTIONS
   */
  const [market, setMarket] = useState<Market | null>(null);
  const [strategy, setStrategy] = useState<'Buy' | 'Sell'>('Buy');
  const [approveModalOpened, setApproveModalOpened] = useState(false);

  /**
   * REFRESH / REFETCH
   */
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.includes('markets/0x')) {
      return;
    }
    setMarket(null);
    setCollateralAmount('');
    setStrategy('Buy');
  }, [pathname]);

  const {
    data: conditionalTokensAddress,
    refetch: getConditionalTokensAddress,
  } = useConditionalTokensAddr({
    marketAddr: !market ? undefined : getAddress(market.id),
  });
  useEffect(() => {
    if (!market) {
      getConditionalTokensAddress();
    }
  }, [market]);

  // TODO: refactor
  const refetchChain = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['outcomeTokensBuyPrice', market?.id],
    });
    await queryClient.invalidateQueries({
      queryKey: ['outcomeTokensSellPrice', market?.id],
    });
    // await refetchbalanceOfSmartWallet();
    await updateSellBalance();
  };

  // TODO: refactor
  const refetchSubgraph = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['marketData', market?.id],
    });
    // await getTrades();
    // await getRedeems();
  };

  /**
   * CONTRACTS
   * TODO: incapsulate with utils
   */
  const fixedProductMarketMakerContract = useMemo(
    () =>
      market
        ? getContract({
            address: market.id as Address,
            abi: fixedProductMarketMakerABI,
            client: publicClient,
          })
        : undefined,
    [market],
  );

  const conditionalTokensContract = getContract({
    address: conditionalTokensAddress!,
    abi: conditionalTokensABI,
    client: publicClient,
  });

  const { data: collateralToken } = useToken(market?.collateralToken.address);

  /**
   * BALANCE TO BUY
   */
  const { balanceOfSmartWallet, refetchbalanceOfSmartWallet } =
    useBalanceService();

  /**
   * BALANCE TO SELL
   */
  const [balanceOfOutcomeTokenYes, setBalanceOfOutcomeTokenYes] = useState('0'); // getCTBalance
  const [balanceOfOutcomeTokenNo, setBalanceOfOutcomeTokenNo] = useState('0');
  const [balanceOfCollateralToSellYes, setBalanceOfCollateralToSellYes] =
    useState('0'); // ctBalance converted to collateral
  const [balanceOfCollateralToSellNo, setBalanceOfCollateralToSellNo] =
    useState('0');

  const getCTBalance = async (
    account: Address | undefined,
    outcomeIndex: number,
  ): Promise<bigint> => {
    if (!market || !account || !conditionalTokensContract) {
      return BigInt(0);
    }

    const collectionId = (await conditionalTokensContract.read.getCollectionId([
      zeroHash, // Since we don't support complicated conditions at the moment
      market.conditionId,
      1 << outcomeIndex,
    ])) as Hash;
    const positionId = (await conditionalTokensContract.read.getPositionId([
      market.collateralToken.address,
      collectionId,
    ])) as bigint;
    const balance = (await conditionalTokensContract.read.balanceOf([
      account,
      positionId,
    ])) as bigint;
    return balance;
  };

  const updateSellBalance = useCallback(async () => {
    setBalanceOfOutcomeTokenYes('0');
    setBalanceOfOutcomeTokenNo('0');
    setBalanceOfCollateralToSellYes('0');
    setBalanceOfCollateralToSellNo('0');

    if (!market || !fixedProductMarketMakerContract || strategy != 'Sell') {
      return;
    }

    const balanceOfOutcomeTokenBIYes = await getCTBalance(account, 0);
    const _balanceOfOutcomeTokenYes = formatUnits(
      balanceOfOutcomeTokenBIYes,
      collateralToken?.decimals || 18,
    );
    const balanceOfOutcomeTokenCroppedYes = NumberUtil.toFixed(
      _balanceOfOutcomeTokenYes.toString(),
      10,
    );
    setBalanceOfOutcomeTokenYes(balanceOfOutcomeTokenCroppedYes);

    const balanceOfOutcomeTokenBINo = await getCTBalance(account, 1);
    const _balanceOfOutcomeTokenNo = formatUnits(
      balanceOfOutcomeTokenBINo,
      collateralToken?.decimals || 18,
    );
    const balanceOfOutcomeTokenCroppedNo = NumberUtil.toFixed(
      _balanceOfOutcomeTokenNo.toString(),
      10,
    );
    setBalanceOfOutcomeTokenNo(balanceOfOutcomeTokenCroppedNo);

    const holdingsYes = await getCTBalance(market.id as Address, 0);
    const otherHoldingsYes: bigint[] = [];
    for (let index = 0; index < 2; index++) {
      if (index != 0) {
        const balance = await getCTBalance(market.id as Address, index);
        otherHoldingsYes.push(balance);
      }
    }
    const feeBI = (await fixedProductMarketMakerContract.read.fee()) as bigint;
    const fee = Number(formatUnits(feeBI, 18));
    let balanceOfCollateralToSellBIYes =
      calcSellAmountInCollateral(
        parseUnits(
          balanceOfOutcomeTokenCroppedYes,
          collateralToken?.decimals || 18,
        ),
        holdingsYes,
        otherHoldingsYes,
        fee,
      ) ?? BigInt(0);
    // small balance to zero
    if (
      balanceOfCollateralToSellBIYes <
      parseUnits('0.000001', collateralToken?.decimals || 18)
    ) {
      balanceOfCollateralToSellBIYes = BigInt(0);
    }

    const _balanceOfCollateralToSellYes = formatUnits(
      balanceOfCollateralToSellBIYes,
      collateralToken?.decimals || 18,
    );

    setBalanceOfCollateralToSellYes(_balanceOfCollateralToSellYes);

    const holdingsNo = await getCTBalance(market.id as Address, 1);
    const otherHoldingsNo: bigint[] = [];
    for (let index = 0; index < 2; index++) {
      if (index != 1) {
        const balance = await getCTBalance(market.id as Address, index);
        otherHoldingsNo.push(balance);
      }
    }

    let balanceOfCollateralToSellBINo =
      calcSellAmountInCollateral(
        parseUnits(
          balanceOfOutcomeTokenCroppedNo,
          collateralToken?.decimals || 18,
        ),
        holdingsNo,
        otherHoldingsNo,
        fee,
      ) ?? BigInt(0);
    // small balance to zero
    if (
      balanceOfCollateralToSellBINo <
      parseUnits('0.000001', collateralToken?.decimals || 18)
    ) {
      balanceOfCollateralToSellBINo = BigInt(0);
    }

    const _balanceOfCollateralToSellNo = formatUnits(
      balanceOfCollateralToSellBINo,
      collateralToken?.decimals || 18,
    );

    setBalanceOfCollateralToSellNo(_balanceOfCollateralToSellNo);
  }, [
    account,
    market,
    strategy,
    fixedProductMarketMakerContract,
    conditionalTokensContract?.address,
  ]);

  useEffect(() => {
    updateSellBalance();
  }, [market, strategy, conditionalTokensAddress]);

  /**
   * AMOUNT
   */
  const [collateralAmount, setCollateralAmount] = useState<string>('');
  const collateralAmountBI = useMemo(
    () => parseUnits(collateralAmount ?? '0', collateralToken?.decimals || 18),
    [collateralAmount, collateralToken],
  );

  // const isExceedsBalance = useMemo(() => {
  //   if (strategy == 'Buy') {
  //     if (balanceOfSmartWallet) {
  //       const balanceItem = balanceOfSmartWallet.find(
  //         (balance) => balance.contractAddress === market?.collateralToken[defaultChain.id]
  //       )
  //       return Number(collateralAmount) > Number(balanceItem?.formatted)
  //     }
  //     return Number(collateralAmount) > 0
  //   }
  //   return Number(collateralAmount) > Number(balanceOfCollateralToSell)
  // }, [strategy, balanceOfCollateralToSell, collateralAmount, balanceOfSmartWallet, market])

  const isInvalidCollateralAmount = collateralAmountBI <= BigInt(0);

  /**
   * QUOTES
   */
  const [quotesYes, setQuotesYes] = useState<TradeQuotes | null>(null);
  const [quotesNo, setQuotesNo] = useState<TradeQuotes | null>(null);
  // current price for price impact calculation
  const {
    outcomeTokensBuyPrice: outcomeTokensBuyPriceCurrent,
    outcomeTokensSellPrice: outcomeTokensSellPriceCurrent,
  } = useMarketData({
    marketAddress: market?.id as Address,
    collateralToken,
  });

  useQuery({
    queryKey: [
      'tradeQuotesYes',
      fixedProductMarketMakerContract?.address,
      collateralAmount,
      balanceOfOutcomeTokenYes,
      0,
      strategy,
      outcomeTokensBuyPriceCurrent,
      outcomeTokensSellPriceCurrent,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract || !(Number(collateralAmount) > 0)) {
        setQuotesYes(null);
        return null;
      }

      let outcomeTokenAmountBI = BigInt(0);
      if (strategy == 'Buy') {
        outcomeTokenAmountBI =
          (await fixedProductMarketMakerContract.read.calcBuyAmount([
            collateralAmountBI,
            0,
          ])) as bigint;
      } else if (strategy == 'Sell') {
        outcomeTokenAmountBI =
          (await fixedProductMarketMakerContract.read.calcSellAmount([
            collateralAmountBI,
            0,
          ])) as bigint;

        // limit max outcome token amount to balance
        const balanceOfOutcomeTokenBI = parseUnits(
          balanceOfOutcomeTokenYes,
          collateralToken?.decimals || 18,
        );
        if (outcomeTokenAmountBI > balanceOfOutcomeTokenBI) {
          outcomeTokenAmountBI = balanceOfOutcomeTokenBI;
        }
      }

      if (outcomeTokenAmountBI == BigInt(0)) {
        setQuotesYes(null);
        return null;
      }

      const outcomeTokenAmount = formatUnits(
        outcomeTokenAmountBI,
        collateralToken?.decimals || 18,
      );
      const outcomeTokenPrice = (
        Number(collateralAmount) / Number(outcomeTokenAmount)
      ).toString();
      const roi = (
        (Number(outcomeTokenAmount) / Number(collateralAmount) - 1) *
        100
      ).toString();
      const outcomeTokensPriceCurrent =
        strategy == 'Buy'
          ? outcomeTokensBuyPriceCurrent
          : outcomeTokensSellPriceCurrent;
      const priceImpact = Math.abs(
        (Number(outcomeTokenPrice) /
          Number(outcomeTokensPriceCurrent?.[0] ?? 1) -
          1) *
          100,
      ).toString();

      const _quotes: TradeQuotes = {
        outcomeTokenPrice,
        outcomeTokenAmount,
        roi,
        priceImpact,
      };

      setQuotesYes(_quotes);
      return quotesYes;
    },
  });

  useQuery({
    queryKey: [
      'tradeQuotesNo',
      fixedProductMarketMakerContract?.address,
      collateralAmount,
      balanceOfOutcomeTokenNo,
      1,
      strategy,
      outcomeTokensBuyPriceCurrent,
      outcomeTokensSellPriceCurrent,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract || !(Number(collateralAmount) > 0)) {
        setQuotesNo(null);
        return null;
      }

      let outcomeTokenAmountBI = BigInt(0);
      if (strategy == 'Buy') {
        outcomeTokenAmountBI =
          (await fixedProductMarketMakerContract.read.calcBuyAmount([
            collateralAmountBI,
            1,
          ])) as bigint;
      } else if (strategy == 'Sell') {
        outcomeTokenAmountBI =
          (await fixedProductMarketMakerContract.read.calcSellAmount([
            collateralAmountBI,
            1,
          ])) as bigint;

        // limit max outcome token amount to balance
        const balanceOfOutcomeTokenBI = parseUnits(
          balanceOfOutcomeTokenNo,
          collateralToken?.decimals || 18,
        );
        if (outcomeTokenAmountBI > balanceOfOutcomeTokenBI) {
          outcomeTokenAmountBI = balanceOfOutcomeTokenBI;
        }
      }

      if (outcomeTokenAmountBI == BigInt(0)) {
        setQuotesNo(null);
        return null;
      }

      const outcomeTokenAmount = formatUnits(
        outcomeTokenAmountBI,
        collateralToken?.decimals || 18,
      );
      const outcomeTokenPrice = (
        Number(collateralAmount) / Number(outcomeTokenAmount)
      ).toString();
      const roi = (
        (Number(outcomeTokenAmount) / Number(collateralAmount) - 1) *
        100
      ).toString();
      const outcomeTokensPriceCurrent =
        strategy == 'Buy'
          ? outcomeTokensBuyPriceCurrent
          : outcomeTokensSellPriceCurrent;
      const priceImpact = Math.abs(
        (Number(outcomeTokenPrice) /
          Number(outcomeTokensPriceCurrent?.[1] ?? 1) -
          1) *
          100,
      ).toString();

      const _quotes: TradeQuotes = {
        outcomeTokenPrice,
        outcomeTokenAmount,
        roi,
        priceImpact,
      };

      setQuotesNo(_quotes);
      return quotesNo;
    },
  });

  const {
    buyOutcomeTokens,
    client,
    approveContract,
    sellOutcomeTokens,
    checkAllowanceForAll,
    approveAllowanceForAll,
    redeemPositions,
  } = useWeb3Service();

  /**
   * BUY
   */
  const { mutateAsync: buy, isPending: isLoadingBuy } = useMutation({
    mutationFn: async (outcomeTokenId: number) => {
      if (!account || !market || isInvalidCollateralAmount) {
        return;
      }

      const minOutcomeTokensToBuy = await publicClient.readContract({
        address: market.id as Address,
        abi: fixedProductMarketMakerABI,
        functionName: 'calcBuyAmount',
        args: [collateralAmountBI, outcomeTokenId],
      });

      const receipt = await buyOutcomeTokens(
        market.id as Address,
        collateralAmountBI,
        outcomeTokenId,
        minOutcomeTokensToBuy as bigint,
        market.collateralToken.address as Address,
      );

      if (!receipt) {
        triggerErrorToast({ message: 'Transaction submission failed' });
        return;
      }

      triggerSuccessToast({
        txHash: receipt,
        message: 'Transaction was submitted',
      });

      const txReceipt = await waitForTransactionReceipt(publicClient, {
        hash: receipt as Hex,
      });

      if (txReceipt.status === 'success') {
        triggerSuccessToast({
          txHash: receipt,
          message: 'Transaction was successfully processed',
        });
      }

      await refetchChain();

      sleep(10).then(() => {
        refetchSubgraph();
        queryClient.refetchQueries({
          queryKey: ['markets', market.id],
        });
      });

      return receipt;
    },
  });

  const { mutateAsync: approveContractBuy, isPending: isLoadingApproveBuy } =
    useMutation({
      mutationFn: async () => {
        if (!market) {
          return;
        }
        triggerToast({ message: 'Processing approve transaction...' });
        try {
          const txHash = await approveContract(
            market.id as Address,
            market.collateralToken.address as Address,
            collateralAmountBI,
          );

          await sleep(3);

          triggerSuccessToast({
            txHash: txHash!,
            message: 'Transaction was submitted',
          });

          await waitForTransactionReceipt(publicClient, {
            hash: txHash as Hex,
          });

          return txHash;
        } catch (e) {
          triggerErrorToast({
            message:
              'Something went wrong during approve transaction broadcast.',
          });
        }
      },
    });

  const { mutateAsync: approveContractSell, isPending: isLoadingApproveSell } =
    useMutation({
      mutationFn: async () => {
        if (!market) {
          return;
        }

        triggerToast({ message: 'Processing approve transaction...' });

        try {
          const txHash = await approveAllowanceForAll(
            market.id as Address,
            conditionalTokensAddress!,
          );

          if (!txHash) {
            triggerErrorToast({ message: 'Transaction submission failed' });
            return;
          }

          triggerSuccessToast({
            txHash: txHash!,
            message: 'Transaction was submitted',
          });
          await sleep(3);

          return txHash;
        } catch (e) {
          triggerErrorToast({
            message:
              'Something went wrong during approve transaction broadcast.',
          });
        }
      },
    });

  /**
   * SELL
   */
  const { mutateAsync: sell, isPending: isLoadingSell } = useMutation({
    mutationFn: async (outcomeTokenId: number) => {
      if (!account || !market || isInvalidCollateralAmount) {
        return;
      }

      triggerToast({ message: 'Processing transaction' });

      if (client === 'eoa') {
        const approvedForAll = await checkAllowanceForAll(
          market.id as Address,
          conditionalTokensAddress!,
        );

        if (!approvedForAll) {
          const receipt = await approveSell();
        }
      }

      const minOutcomeTokensToSell = await publicClient.readContract({
        address: market.id as Address,
        abi: fixedProductMarketMakerABI,
        functionName: 'calcSellAmount',
        args: [collateralAmountBI, outcomeTokenId],
      });

      const receipt = await sellOutcomeTokens(
        conditionalTokensAddress!,
        market.id as Address,
        collateralAmountBI,
        outcomeTokenId,
        minOutcomeTokensToSell as bigint,
      );

      if (!receipt) {
        triggerErrorToast({
          message: 'Unsuccessful transaction',
        });

        return;
      }

      const txReceipt = await waitForTransactionReceipt(publicClient, {
        hash: receipt as Hex,
      });

      setCollateralAmount('');

      await refetchChain();

      triggerSuccessToast({
        txHash: receipt,
        message: `Successfully redeemed ${NumberUtil.toFixed(
          collateralAmount,
          6,
        )} ${collateralToken?.symbol}`,
      });

      await sleep(1);

      // triggerToast({
      //   message: 'Updating portfolio...',
      // });

      // TODO: redesign subgraph refetch logic
      sleep(10).then(() => refetchSubgraph());

      return receipt;
    },
  });

  /**
   * REDEEM / CLAIM
   */
  const { mutateAsync: redeem, isPending: isLoadingRedeem } = useMutation({
    mutationFn: async ({
      outcomeIndex,
      marketAddress,
      collateralAddress,
      conditionId,
    }: RedeemParams) => {
      const {data: conditionalTokenAddress} = await getConditionalTokensAddress();
      
      if(!conditionalTokenAddress) {
        console.log('Conditional token address not found');
        return;
      }
      
      const receipt = await redeemPositions(
        conditionalTokenAddress,
        collateralAddress,
        zeroHash,
        conditionId,
        [1 << outcomeIndex]
      )
      
      if (!receipt) {
        triggerErrorToast({
          message: 'Unsuccessful transaction',
        });

        return
      }

      await refetchChain()

      triggerSuccessToast({
        txHash: receipt,
        message: 'Transaction was successfully processed',
      });

      await sleep(1)

      triggerSuccessToast({
        message: 'Updating portfolio...',
      });

      // TODO: redesign subgraph refetch logic
      sleep(10).then(() => refetchSubgraph())

      return receipt
    },
  })

  const trade = useCallback(
    (outcomeTokenId: number) => {
      return strategy == 'Buy' ? buy(outcomeTokenId) : sell(outcomeTokenId);
    },
    [strategy],
  );

  const approveBuy = useCallback(() => approveContractBuy(), []);

  const approveSell = useCallback(() => approveContractSell(), []);

  /**
   * STATUS
   */
  const status = useMemo<TradingServiceStatus>(() => {
    if (
      isLoadingBuy ||
      isLoadingSell ||
      isLoadingRedeem ||
      isLoadingApproveBuy ||
      isLoadingApproveSell
    ) {
      return 'Loading';
    }
    if (isInvalidCollateralAmount) {
      return 'InvalidAmount';
    }
    return 'Ready';
  }, [
    isInvalidCollateralAmount,
    isLoadingBuy,
    isLoadingSell,
    isLoadingRedeem,
    isLoadingApproveBuy,
    isLoadingApproveSell,
  ]);

  const tradeStatus = useMemo<TradingServiceStatus>(() => {
    if (isLoadingBuy || isLoadingSell) {
      return 'Loading';
    }
    return 'Ready';
  }, []);

  const contextProviderValue: ITradingServiceContext = {
    market,
    setMarket,
    strategy,
    setStrategy,
    collateralAmount,
    setCollateralAmount,
    balanceOfCollateralToSellYes,
    balanceOfCollateralToSellNo,
    quotesYes,
    quotesNo,
    buy,
    sell,
    trade,
    redeem,
    status,
    tradeStatus,
    approveModalOpened,
    setApproveModalOpened,
    approveBuy,
    approveSell,
  };

  return (
    <TradingServiceContext.Provider value={contextProviderValue}>
      {children}
    </TradingServiceContext.Provider>
  );
};

export const useTradingService = () => useContext(TradingServiceContext);

export type TradingServiceStatus =
  | 'Disconnected'
  | 'InvalidAmount'
  | 'Ready'
  | 'Submitted'
  | 'Loading'
  | 'Idle';

export type TradeQuotes = {
  outcomeTokenAmount: string; // amount of outcome token to be traded based on collateral amount input or ctBalance
  outcomeTokenPrice: string; // average cost per outcome token
  roi: string; // return on investment aka profitability percentage
  priceImpact: string; // price fluctuation percentage
};
