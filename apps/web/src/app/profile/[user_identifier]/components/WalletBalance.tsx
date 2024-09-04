'use client';

import { Label } from '@/components/ui/label';
import { formatEther } from '@/lib/utils/formatters';
import { Address } from 'viem';
import { useBalance } from 'wagmi';

type WalletBalanceProps = {
  userAddress?: string;
};

export default function WalletBalance({ userAddress }: WalletBalanceProps) {
  const balance = useBalance({
    address: userAddress as Address,
    query: {
      enabled: Boolean(userAddress),
    },
  });

  return (
    <Label className='text-lg'>
      {formatEther(balance.data?.value ?? BigInt(0))}
    </Label>
  );
}
