import { ERC20ABI } from '@/abis/erc20ABI';
import { base } from 'viem/chains';

export const contractABI: { [key: number]: any } = {
  // [baseSepolia.id]: mockERC20ABI,
  [base.id]: ERC20ABI,
};

export const transformSellValue = (value: string) => {
  const [wholeNumber, fractionalNumber] = value.split('.');

  // const fractionalNumberLength = fractionalNumber?.length || 0
  // const percentage = fractionalNumberLength <= 6 ? 0.99 : fractionalNumberLength === 0 ? 1 : 0.91
  const percentage = 1;

  let zeroWholeFraction: string = ['0', fractionalNumber].join('.');
  zeroWholeFraction = String(+zeroWholeFraction * percentage);
  zeroWholeFraction = Number(zeroWholeFraction).toFixed(6);
  const [, _fractionalNumber] = zeroWholeFraction.split('.');
  return [wholeNumber, _fractionalNumber].join('.');
};
