import { Market } from '@/types/market';
import { SupportedChain, getClient } from './viem';

export const abi = [
  {
    constant: true,
    inputs: [
      { name: 'investmentAmount', type: 'uint256' },
      { name: 'outcomeIndex', type: 'uint256' },
    ],
    name: 'calcBuyAmount',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const calculateShares = async (
  marketData: Market,
  amount: number,
  position: 'Yes' | 'No',
): Promise<number> => {
  const yesMultiplier = +marketData.outcomePrices[0] / 100;
  const noMultiplier = +marketData.outcomePrices[1] / 100;
  return amount + amount * (position === 'Yes' ? yesMultiplier : noMultiplier);
};
