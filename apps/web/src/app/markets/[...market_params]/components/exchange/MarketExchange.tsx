'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { publicClient } from '@/lib/config/publicClient';
import { useWeb3Service } from '@/lib/services/Web3Service';
import { Loader } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { Address, parseUnits } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { BuyTab } from './BuyTab';
import { SellTab } from './SellTab';
import { Market } from '@/lib/types/markets';
import { capitalizeFirstLetter, sleep } from '@/lib/utils';
import { useTradingService } from '@/components/providers/TradingProvider';
import { Optional } from '@/lib/types';
import { SingleMarket, TradeQuotes } from '@/lib/types/limitless';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import { useToken } from '@/lib/hooks/limitless/useToken';
import { useParams } from 'next/navigation';
import useGetMarketGroupQuery from '@/lib/hooks/react-query/queries/useGetMarketGroupQuery';
import { MarketExchangeLoadingSkeleton } from './MarketExchangeLoadingSkeleton';
import ClaimTab from './ClaimTab';
import clsx from 'clsx';

export default function MarketExchange() {
  const params = useParams<{ market_params: Array<string> }>();
  const [provider] = params.market_params;

  const { data: marketGroup, isLoading } = useGetMarketGroupQuery();

  const [isFreeBet, setIsFreeBet] = useQueryState('is_free_bet', {
    parse: (value) => value === 'true',
    serialize: (value) => value.toString(),
    defaultValue: provider === 'polymarket'
  });
  const [outcomeIndex, setOutcomeIndex] = useQueryState('outcome_index', {
    parse: (value) => (value ? Number(value) : 0),
    serialize: String,
    defaultValue: 0
  });

  const [marketIndex] = useQueryState('market_index', {
    parse: (value) => (value ? Number(value) : 0),
    serialize: String,
    defaultValue: 0
  });

  const [strategyQuery, setStrategyQuery] = useQueryState('strategy', {
    parse: (value): 'Buy' | 'Sell' =>
      capitalizeFirstLetter(value || 'buy') as 'Buy' | 'Sell',
    serialize: (value) => value.toLowerCase(),
    defaultValue: 'Buy'
  });
  const [currentMarket, setCurrentMarket] = useState<Market | undefined>(
    marketGroup?.data[marketIndex]
  );

  const {
    strategy,
    setStrategy,
    setMarket,
    market: previousMarket,
    setCollateralAmount
  } = useTradingService();

  useEffect(() => {
    if (
      provider === 'limitless' &&
      currentMarket &&
      currentMarket !== previousMarket
    ) {
      setMarket(currentMarket);
    }
  }, [currentMarket, previousMarket, provider]);

  useEffect(() => {
    if (!marketGroup) {
      return;
    }

    setCurrentMarket(marketGroup.data[marketIndex]);
  }, [marketIndex, marketGroup]);

  useEffect(() => {
    if (strategyQuery) {
      setStrategy(strategyQuery as 'Buy' | 'Sell');
    }
  }, [strategyQuery, setStrategy]);

  const handleFreeBetToggle = () => {
    setIsFreeBet((prev) => !prev);
  };

  const updateStrategy = (newStrategy: string) => {
    if (newStrategy === 'buy' || newStrategy === 'sell') {
      const capitalizedStrategy = capitalizeFirstLetter(newStrategy) as
        | 'Buy'
        | 'Sell';
      setStrategy(capitalizedStrategy);
      setStrategyQuery(capitalizedStrategy);
      setCollateralAmount('');
    }
  };

  if (isLoading) {
    return <MarketExchangeLoadingSkeleton />;
  }

  const defaultSwitchValue = provider === 'polymarket' ? true : isFreeBet;
  // const expired = currentMarket?.expired;
  const expired = true;

  return (
    <section className='w-full lg:max-w-[532px]'>
      <Tabs
        onValueChange={updateStrategy}
        value={expired ? 'claim' : strategy.toLowerCase()}
        defaultValue={strategy.toLowerCase() ?? 'buy'}
        className='w-full space-y-8 border-2 border-black p-6 shadow-sm'
      >
        {/* <TabsList className='grid w-full grid-cols-2 bg-inherit'>
          <TabsTrigger
            className='flex justify-center border-black p-0 pb-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600'
            value='buy'
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            className='flex justify-center border-black p-0 pb-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600'
            value='sell'
          >
            Sell
          </TabsTrigger>
        </TabsList> */}
        <div
          className={clsx('flex items-center space-x-2', {
            hidden: expired
          })}
        >
          <Switch
            id='free-bet-toggle'
            checked={defaultSwitchValue}
            onCheckedChange={handleFreeBetToggle}
            disabled={provider === 'polymarket' || provider === 'custom'}
          />
          <Label htmlFor='free-bet-toggle'>Free Bet</Label>
        </div>
        <TabsContent value='buy'>
          {currentMarket && (
            <BuyTab
              market={currentMarket}
              strategy={'Buy'}
              isFreeBet={isFreeBet}
              outcomeIndex={outcomeIndex}
              setOutcomeIndex={setOutcomeIndex}
              marketProvider={provider}
            />
          )}
        </TabsContent>
        <TabsContent value='sell'>
          {currentMarket && (
            <SellTab
              market={currentMarket}
              strategy={'Sell'}
              isFreeBet={isFreeBet}
              outcomeIndex={outcomeIndex}
              setOutcomeIndex={setOutcomeIndex}
              marketProvider={provider}
            />
          )}
        </TabsContent>
        <TabsContent value='claim'>
          {currentMarket && <ClaimTab market={currentMarket} />}
        </TabsContent>
      </Tabs>
    </section>
  );
}

export function OutcomeTokens({
  outcomeTokens,
  outcomeIndex,
  setOutcomeIndex
}: {
  setOutcomeIndex: (index: number) => void;
  outcomeIndex: number | undefined;
  outcomeTokens: Array<string>;
}) {
  return (
    <div className='flex justify-between'>
      {outcomeTokens?.map((outcome, index) => (
        <Button
          key={index}
          onClick={() => setOutcomeIndex(index)}
          className={`w-5/12 px-2 py-6 shadow-sm ${
            outcomeIndex === index ? 'bg-gray-400 hover:bg-gray-400' : ''
          }`}
        >
          <Label className='mr-1 cursor-pointer'>
            {index === 0 ? 'Yes' : 'No'}({outcome}%)
          </Label>
        </Button>
      ))}
    </div>
  );
}

export function BalanceAmount({
  balance,
  tokenSymbol,
  isFreeBet
}: {
  balance?: string;
  tokenSymbol?: string;
  isFreeBet?: boolean;
}) {
  return (
    <div className='flex h-[37px] items-center justify-between'>
      <Label className='text-gray-500'>Amount</Label>
      {balance && (
        <div className='flex items-center gap-2 bg-gray-200 px-2 py-2'>
          <Label className='text-gray-500'>Balance: {balance}</Label>
          <Label className='text-gray-500'>
            {isFreeBet ? 'USDV' : tokenSymbol}
          </Label>
        </div>
      )}
    </div>
  );
}

export function AmountInput({
  handleAmountChange,
  isInvalidAmount,
  errorMessage,
  initialValue = ''
}: {
  handleAmountChange: (value: string) => void;
  isInvalidAmount: boolean;
  errorMessage: string;
  initialValue?: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAmountChange(e.target.value);
  };

  return (
    <div className='relative'>
      {isInvalidAmount && (
        <Label className='absolute -top-4 text-xs text-red-500'>
          {errorMessage}
        </Label>
      )}
      <Input
        className={`w-full rounded-none bg-gray-200 ${
          isInvalidAmount ? 'border-2 border-red-500' : ''
        }`}
        value={initialValue}
        onChange={handleChange}
      />
    </div>
  );
}

export function ActionButton({
  label,
  disabled,
  onClick,
  withLoading
}: {
  label: string;
  disabled: boolean;
  onClick: any;
  withLoading?: boolean;
}) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      className='relative flex w-full justify-center gap-2 border-2 border-black bg-green-600 py-6 text-black shadow-sm hover:bg-green-700'
    >
      <div className='flex items-center justify-center gap-2'>
        {withLoading && disabled && <Loader className='animate-spin' />}
        <Label>{label}</Label>
      </div>
    </Button>
  );
}

export function OrderDetails({
  quotes,
  collateralAmount,
  tokenSymbol,
  withTotal,
  withPriceImpact,
  withROI,
  withReturn
}: {
  quotes: Optional<TradeQuotes>;
  collateralAmount?: string;
  tokenSymbol: string;
  withTotal?: boolean;
  withPriceImpact?: boolean;
  withReturn?: boolean;
  withROI?: boolean;
}) {
  return (
    <div className='flex flex-col gap-8'>
      <div className='flex justify-between'>
        <Label className='text-gray-500'>Your Avg price</Label>
        <Label>
          {NumberUtil.formatThousands(quotes?.outcomeTokenPrice, 6)}{' '}
          {tokenSymbol}
        </Label>
      </div>
      {withPriceImpact && (
        <div className='flex justify-between'>
          <Label className='text-gray-500'>Price Impact</Label>
          <Label>{NumberUtil.toFixed(quotes?.priceImpact, 2)} %</Label>
        </div>
      )}
      {withROI && (
        <div className='flex justify-between'>
          <Label className='text-gray-500'>Est. ROI</Label>
          <Label>{NumberUtil.toFixed(quotes?.roi, 2)} %</Label>
        </div>
      )}
      {withReturn && (
        <div className='flex justify-between'>
          <Label className='text-gray-500'>Return</Label>
          <Label>
            {NumberUtil.formatThousands(quotes?.outcomeTokenAmount, 6)}{' '}
            {tokenSymbol}
          </Label>
        </div>
      )}
      {withTotal && (
        <div className='flex justify-between'>
          <Label className='text-gray-500'>Total</Label>
          <Label>
            {collateralAmount} {tokenSymbol}
          </Label>
        </div>
      )}
    </div>
  );
}

export function useExchange({
  strategy,
  market,
  debouncedCollateralAmount,
  outcomeIndex,
  trade,
  isExceedsBalance,
  approveBuy
}: {
  strategy: 'Buy' | 'Sell';
  market: SingleMarket;
  debouncedCollateralAmount: string;
  outcomeIndex: number | undefined;
  trade: (outcomeIndex: number) => Promise<string | undefined>;
  isExceedsBalance: boolean;
  approveBuy: () => Promise<void | string>;
}) {
  const [isApproved, setIsApproved] = useState(false);
  const { checkAllowance } = useWeb3Service();
  const { data: collateralToken } = useToken(market.collateralToken.address);

  const handleApprove = async () => {
    try {
      const amountBI = parseUnits(
        debouncedCollateralAmount,
        collateralToken?.decimals || 18
      );

      const txHash = await approveBuy();

      const txReceipt = await waitForTransactionReceipt(publicClient, {
        hash: txHash as Address
      });

      if (txReceipt && txReceipt.status) {
        console.log('Allowance transaction successful', txReceipt.status);
      } else {
        console.log('Allowance transaction unsuccessful');
      }

      await sleep(3);
      // await handleBuy();
      setIsApproved(true);
    } catch (e) {
      setIsApproved(false);
      console.error('Failed to approve: ', e);
    }
  };

  const handleBuy = async () => {
    if (outcomeIndex === undefined) {
      return;
    }

    return await trade(outcomeIndex);
  };

  return { isApproved, handleApprove, handleBuy, checkAllowance };
}
