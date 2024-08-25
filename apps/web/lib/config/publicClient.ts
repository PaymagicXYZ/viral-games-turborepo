import { defaultChain } from '@/lib/constants';
import { createPublicClient, http } from 'viem';

export const publicClient = createPublicClient({
  chain: defaultChain,
  transport: http()
});
