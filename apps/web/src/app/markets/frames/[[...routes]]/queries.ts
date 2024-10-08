import { fixedProductMarketMakerABI } from '@/abis/fixedProductMakerABI';
import { defaultChain } from '@/lib/constants';
import { Market, Token, TradeQuotes } from '@/lib/types/limitless';

import {
  type Address,
  createPublicClient,
  formatUnits,
  getContract,
  parseUnits,
} from 'viem';
import { http } from 'wagmi';

export function getViemClient() {
  const client = createPublicClient({
    transport: http(),
    chain: defaultChain,
  });

  return client;
}

export const getQuote = async (
  market: Market,
  collateralAmount: string,
  collateralToken: Token,
  outcomeTokenId: number,
  outcomeTokensBuyPercent: number[],
) => {
  const fixedProductMarketMakerContract = getContract({
    address: market.address as Address,
    abi: fixedProductMarketMakerABI,
    client: getViemClient(),
  });
  if (!fixedProductMarketMakerContract || !(Number(collateralAmount) > 0)) {
    return null;
  }

  const collateralAmountBI = parseUnits(
    collateralAmount ?? '0',
    collateralToken?.decimals || 18,
  );

  const outcomeTokenAmountBI =
    (await fixedProductMarketMakerContract.read.calcBuyAmount([
      collateralAmountBI,
      outcomeTokenId,
    ])) as bigint;

  // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
  if (outcomeTokenAmountBI == BigInt(0)) {
    return null;
  }

  const outcomeTokenAmount = formatUnits(
    outcomeTokenAmountBI,
    collateralToken.decimals || 18,
  );
  const outcomeTokenPrice = (
    Number(collateralAmount) / Number(outcomeTokenAmount)
  ).toString();

  const roi = (
    (Number(outcomeTokenAmount) / Number(collateralAmount) - 1) *
    100
  ).toString();
  const priceImpact = Math.abs(
    Number(outcomeTokensBuyPercent[outcomeTokenId] - 1) /
      (Number(outcomeTokenPrice) * 100),
  ).toString();

  const quotes: TradeQuotes = {
    outcomeTokenPrice,
    outcomeTokenAmount,
    roi,
    priceImpact,
  };

  return quotes;
};
