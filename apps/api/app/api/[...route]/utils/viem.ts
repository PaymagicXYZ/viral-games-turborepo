import { fixedProductMarketMakerABI } from '@/app/abis/FixedProductMarketMaker';
import {
  Address,
  createPublicClient,
  formatUnits,
  getContract,
  http,
  parseUnits,
} from 'viem';
import { mainnet, polygon, base } from 'viem/chains';

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const chains = ['mainnet', 'polygon', 'base'];

export type SupportedChain = typeof chains[number];

export const getClient = (chainName: SupportedChain) => {
  switch (chainName) {
    case 'mainnet':
      return createPublicClient({
        chain: mainnet,
        transport: http(),
      });
    case 'polygon':
      return createPublicClient({
        chain: polygon,
        transport: http(),
      });
    case 'base':
      return createPublicClient({
        chain: base,
        transport: http(),
      });
    default:
      return client;
  }
};

export const getMarketOutcomeBuyPrice = async (
  decimals: number,
  marketAddress: string,
  chain: SupportedChain,
) => {
  const fixedProductMarketMakerContract = getContract({
    address: marketAddress as Address,
    abi: fixedProductMarketMakerABI,
    client: getClient(chain),
  });
  const collateralDecimals = decimals;
  const collateralAmount = collateralDecimals <= 6 ? `0.0001` : `0.0000001`;
  const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals);
  const outcomeTokenAmountYesBI =
    (await fixedProductMarketMakerContract.read.calcBuyAmount([
      collateralAmountBI,
      0,
    ])) as bigint;
  const outcomeTokenAmountNoBI =
    (await fixedProductMarketMakerContract.read.calcBuyAmount([
      collateralAmountBI,
      1,
    ])) as bigint;
  const outcomeTokenAmountYes = formatUnits(
    outcomeTokenAmountYesBI,
    collateralDecimals,
  );
  const outcomeTokenAmountNo = formatUnits(
    outcomeTokenAmountNoBI,
    collateralDecimals,
  );
  const outcomeTokenPriceYes =
    Number(collateralAmount) / Number(outcomeTokenAmountYes);
  const outcomeTokenPriceNo =
    Number(collateralAmount) / Number(outcomeTokenAmountNo);

  return [outcomeTokenPriceYes, outcomeTokenPriceNo];
};
