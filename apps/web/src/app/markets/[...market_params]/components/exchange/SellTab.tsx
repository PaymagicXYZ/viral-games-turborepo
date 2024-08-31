import { Label } from '@/components/ui/label';

import useSuccessToast from '@/lib/hooks/toasts/useSuccessToast';
import { Market } from '@/lib/types/markets';
import { transformSellValue } from '@/lib/utils/limitless';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import BigNumber from 'bignumber.js';
import { useCallback, useMemo, useState } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import {
  ActionButton,
  AmountInput,
  BalanceAmount,
  OrderDetails,
  OutcomeTokens,
} from './MarketExchange';
import { useHistory } from '@/components/providers/HistoryProvider';
import useGetTempPlayerQuery from '@/lib/hooks/react-query/queries/useGetTempPlayerQuery';
import { useTradingService } from '@/components/providers/TradingProvider';
import { insertActivity } from '@/lib/actions/supabase/activities';
import { useFreeBetMutation } from '@/lib/hooks/react-query/mutations/useFreeBetMutation';
import useGetFreeSharesQuery from '@/lib/hooks/react-query/queries/useGetFreeSharesQuery';

export function SellTab({
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
  const { positions: allMarketsPositions } = useHistory();
  const outcomeChoice =
    outcomeIndex === undefined ? undefined : outcomeIndex === 0 ? 'yes' : 'no';
  const { data: tempPlayer } = useGetTempPlayerQuery();
  const {
    mutateAsync: freeBet,
    error: freeExchangeError,
    isPending: isSubmittingFreeBet,
  } = useFreeBetMutation(marketProvider as 'limitless' | 'polymarket');
  const { triggerSuccessToast } = useSuccessToast();

  const {
    collateralAmount,
    setCollateralAmount,
    quotesYes: quoteYes,
    quotesNo: quoteNo,
    trade,
    balanceOfCollateralToSellYes,
    balanceOfCollateralToSellNo,
  } = useTradingService();

  const [isProcessing, setIsProcessing] = useState(false);

  const { data: freeShares } = useGetFreeSharesQuery({
    marketAddress: market.id,
  });

  const { balanceOfFreeCollateralToSellYes, balanceOfFreeCollateralToSellNo } =
    useMemo(() => {
      if (!freeShares) {
        return {
          balanceOfFreeCollateralToSellYes: '0',
          balanceOfFreeCollateralToSellNo: '0',
        };
      }

      return {
        balanceOfFreeCollateralToSellYes:
          freeShares.positions
            .find((p: { outcome_index: number }) => p.outcome_index === 0)
            ?.shares.toString() ?? '0',
        balanceOfFreeCollateralToSellNo:
          freeShares.positions
            .find((p: { outcome_index: number }) => p.outcome_index === 1)
            ?.shares.toString() ?? '0',
      };
    }, [freeShares]);

  const balance = useMemo(() => {
    if (isFreeBet) {
      return NumberUtil.toFixed(tempPlayer?.balance.toString(), 2);
    }

    if (outcomeChoice) {
      let _balance =
        outcomeChoice === 'yes'
          ? balanceOfCollateralToSellYes
          : balanceOfCollateralToSellNo;
      _balance = transformSellValue(_balance);
      return _balance;
    }
  }, [
    outcomeChoice,
    balanceOfCollateralToSellYes,
    balanceOfCollateralToSellNo,
    isFreeBet,
    tempPlayer,
  ]);

  const isExceedsBalance = useMemo(() => {
    if (isFreeBet) {
      return new BigNumber(collateralAmount).isGreaterThan(
        new BigNumber(
          outcomeChoice === 'yes'
            ? (freeShares?.positions.find(
                (p: { outcome_index: number }) => p.outcome_index === 0,
              )?.shares ?? 0)
            : (freeShares?.positions.find(
                (p: { outcome_index: number }) => p.outcome_index === 1,
              )?.shares ?? 0),
        ),
      );
    }

    if (outcomeChoice) {
      return new BigNumber(collateralAmount).isGreaterThan(
        new BigNumber(
          outcomeChoice === 'yes'
            ? balanceOfCollateralToSellYes
            : balanceOfCollateralToSellNo,
        ),
      );
    }
    return false;
  }, [
    collateralAmount,
    outcomeChoice,
    balanceOfCollateralToSellYes,
    balanceOfCollateralToSellNo,
    isFreeBet,
    freeShares,
  ]);

  const handleAmountChange = useCallback(
    (newValue: string) => {
      const regex = /^\d*\.?\d*$/;
      if (regex.test(newValue)) {
        setCollateralAmount(newValue);
      }
    },
    [setCollateralAmount],
  );

  const isButtonDisabled = useMemo(() => {
    if (isFreeBet) return false;
    if (Number(collateralAmount) === 0) return true;
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
      console.error('Error selling', freeExchangeError);
      return;
    }

    triggerSuccessToast({ message: `Successfully sold` });
  };

  const handleRegularBet = async () => {
    const receipt = await trade(outcomeIndex!);

    if (receipt) {
      const activity = {
        market_address: market.id,
        market_title: market.title,
        market_uri: market.ogImageURI,
        strategy: 'sell' as 'buy' | 'sell',
        outcome_index: outcomeIndex as number as 0 | 1,
        user_address: `eoa:${account.address}` as Address,
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

  const quote = outcomeChoice === 'yes' ? quoteYes : quoteNo;

  return (
    <section className='flex flex-col gap-8'>
      <div className='flex flex-col gap-4'>
        <Label className='text-gray-500'>Outcome</Label>
        <OutcomeTokens
          outcomeTokens={market.outcomePrices}
          outcomeIndex={outcomeIndex}
          setOutcomeIndex={setOutcomeIndex}
        />
        <AvailableShares
          balanceOfCollateralToSellNo={
            isFreeBet
              ? balanceOfFreeCollateralToSellNo
              : balanceOfCollateralToSellNo
          }
          balanceOfCollateralToSellYes={
            isFreeBet
              ? balanceOfFreeCollateralToSellYes
              : balanceOfCollateralToSellYes
          }
        />
      </div>

      <div className='flex flex-col gap-2'>
        <BalanceAmount />

        <AmountInput
          handleAmountChange={handleAmountChange}
          isInvalidAmount={isExceedsBalance}
          errorMessage='Exceeds available balance'
          initialValue={collateralAmount}
        />
        <div className='mt-2 w-full'>
          <ActionButton
            label='Sell'
            disabled={isButtonDisabled}
            onClick={buttonClickEvent}
            withLoading={isButtonDisabled && Number(collateralAmount) !== 0}
          />
        </div>
      </div>
      <OrderDetails
        collateralAmount={collateralAmount}
        quotes={quote}
        tokenSymbol={market.collateralToken.symbol}
        withTotal
      />
    </section>
  );
}

function AvailableShares({
  balanceOfCollateralToSellYes,
  balanceOfCollateralToSellNo,
}: {
  balanceOfCollateralToSellYes: string;
  balanceOfCollateralToSellNo: string;
}) {
  return (
    <div className='flex justify-between'>
      <div>
        <Label className='mr-1 text-xs'>Shares</Label>
        <Label className='text-xs'>
          {balanceOfCollateralToSellYes !== '0'
            ? transformSellValue(balanceOfCollateralToSellYes)
            : '0'}
        </Label>
      </div>
      <div>
        <Label className='mr-1 text-xs'>Shares</Label>
        <Label className='text-xs'>
          {balanceOfCollateralToSellNo !== '0'
            ? transformSellValue(balanceOfCollateralToSellNo)
            : '0'}
        </Label>
      </div>
    </div>
  );
}
