import { Address } from 'viem';

export const formatAddress = (address: Address | string, slice = 4) => {
  return address.slice(0, slice + 2) + '...' + address.slice(-slice);
};
