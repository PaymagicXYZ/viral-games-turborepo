import { Label } from '@/components/ui/label';
import { useFreeBetMutation } from '@/lib/hooks/react-query/mutations/useFreeBetMutation';
import useGetTempPlayerQuery from '@/lib/hooks/react-query/queries/useGetTempPlayerQuery';
import useSuccessToast from '@/lib/hooks/toasts/useSuccessToast';
import { useWeb3Service } from '@/lib/services/Web3Service';
import { Market } from '@/lib/types/markets';
import { sleep } from '@/lib/utils';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import BigNumber from 'bignumber.js';
import { useCallback, useMemo, useState } from 'react';
import { Address, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import {
  ActionButton,
  AmountInput,
  BalanceAmount,
  OrderDetails,
  OutcomeTokens,
} from './MarketExchange';
import { insertActivity } from '@/lib/actions/supabase/activities';
import { useTradingService } from '@/components/providers/TradingProvider';
import { useBalanceService } from '@/components/providers/BalanceProvider';

export function BuyTab({
  strategy,
  market,
  isFreeBet,
  outcomeIndex,
  setOutcomeIndex,
  marketProvider,
}: {
  strategy: 'Buy' | 'Sell';
  market: Market;
  isFreeBet: boolean;
  outcomeIndex: number;
  setOutcomeIndex: (index: number) => void;
  marketProvider: string;
}) {
  const account = useAccount();
  const {
    collateralAmount,
    setCollateralAmount,
    quotesYes: quoteYes,
    quotesNo: quoteNo,
    trade,
    approveBuy,
  } = useTradingService();
  const { checkAllowance } = useWeb3Service();
  const { balanceOfSmartWallet: balanceOfWallet } = useBalanceService();
  const { data: tempPlayer } = useGetTempPlayerQuery();
  const {
    mutateAsync: freeBet,
    error: freeExchangeError,
    isPending: isSubmittingFreeBet,
  } = useFreeBetMutation(marketProvider as 'limitless' | 'polymarket');
  const { triggerSuccessToast } = useSuccessToast();

  const [isProcessing, setIsProcessing] = useState(false);

  const balance = useMemo(() => {
    if (isFreeBet) {
      return NumberUtil.toFixed(tempPlayer?.balance.toString(), 2) || '';
    }

    if (strategy === 'Buy') {
      if (balanceOfWallet) {
        return (
          balanceOfWallet.find(
            (balanceItem) =>
              balanceItem.contractAddress === market?.collateralToken.address,
          )?.formatted || ''
        );
      }
      return '';
    }
    return '';
  }, [balanceOfWallet, strategy, market, isFreeBet, tempPlayer]);

  const isExceedsBalance = useMemo(() => {
    return new BigNumber(collateralAmount).isGreaterThan(balance);
  }, [collateralAmount, balance]);

  const handleAmountChange = useCallback((newValue: string) => {
    const regex = /^\d*\.?\d*$/;
    if (regex.test(newValue)) {
      setCollateralAmount(newValue);
    }
  }, []);

  let quote;
  if (collateralAmount && outcomeIndex !== undefined) {
    quote = outcomeIndex === 0 ? quoteYes : quoteNo;
  }

  const isButtonDisabled = useMemo(() => {
    if (isFreeBet) return false;
    if (Number(collateralAmount) === 0) return true; // Disable button when no amount is entered
    if (isProcessing) return true;
    if (isExceedsBalance) return true;
    if (outcomeIndex === undefined) return true;

    return false;
  }, [
    isFreeBet,
    collateralAmount,
    isProcessing,
    isExceedsBalance,
    outcomeIndex,
  ]);

  const buttonClickEvent = async () => {
    setIsProcessing(true);
    try {
      if (isFreeBet) {
        await handleFreeBet();
      } else {
        await handleRegularBet();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFreeBet = async () => {
    await freeBet({
      userId: account.address! as string,
      position: outcomeIndex === 0 ? 'Yes' : 'No',
      address: market.id,
      amount: Number(collateralAmount),
    });

    if (freeExchangeError) {
      console.error('Error buying', freeExchangeError);
      return;
    }

    triggerSuccessToast({ message: `Successfully bought` });
  };

  const handleRegularBet = async () => {
    const allowance = await checkAllowance(
      market.id as Address,
      market.collateralToken.address as Address,
    );
    const amountBI = parseUnits(
      collateralAmount,
      market.collateralToken.decimals || 18,
    );

    if (amountBI > allowance) {
      await approveBuy();

      await sleep(2);
    }

    const receipt = await trade(outcomeIndex!);

    if (receipt) {
      const activity = {
        market_address: market.id,
        market_title: market.title,
        market_uri: market.ogImageURI,
        strategy: 'buy' as 'buy' | 'sell',
        outcome_index: outcomeIndex as number as 0 | 1,
        user_address: account.address as Address,
        ens: null,
        pfp: null,
        asset_ticker: market.collateralToken.symbol,
        tx_hash: receipt,
        tx_value: collateralAmount,
        chain: 'base' as 'base' | 'polygon',
        chain_id: 8453,
        provider: marketProvider,
        outcome_index_formatted: outcomeIndex === 0 ? 'Yes' : 'No',
      };

      await insertActivity({ activity });
    }
  };

  return (
    <section className='flex flex-col gap-8'>
      <div className='flex flex-col gap-4'>
        <Label className='text-gray-500'>Outcome</Label>
        <OutcomeTokens
          outcomeTokens={market.outcomePrices}
          outcomeIndex={outcomeIndex}
          setOutcomeIndex={setOutcomeIndex}
        />
      </div>

      <BalanceAmount
        balance={balance}
        tokenSymbol={market.collateralToken.symbol}
        isFreeBet={isFreeBet}
      />
      <div className='flex flex-col gap-4'>
        <AmountInput
          handleAmountChange={handleAmountChange}
          isInvalidAmount={isExceedsBalance}
          errorMessage='Exceeds available balance'
          initialValue={collateralAmount}
        />
        <ActionButton
          label='Buy'
          disabled={isButtonDisabled}
          onClick={buttonClickEvent}
          withLoading={isButtonDisabled && Number(collateralAmount) !== 0}
        />
      </div>
      <OrderDetails
        quotes={quote}
        tokenSymbol={market.collateralToken.symbol}
        withPriceImpact
        withROI
        withReturn
      />
    </section>
  );
}
