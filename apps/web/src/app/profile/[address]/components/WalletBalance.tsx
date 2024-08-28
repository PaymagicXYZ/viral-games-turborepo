'use client';

import { Label } from '@/components/ui/label';
import { formatEther } from '@/lib/utils/formatters';
import { Address } from 'viem';
import { useAccount, useBalance } from 'wagmi';

type WalletBalanceProps = {
  userAddress?: Address;
};

export default function WalletBalance({ userAddress }: WalletBalanceProps) {
  const { address } = useAccount();

  const balance = useBalance({ address: userAddress ?? address });

  return (
    <Label className='text-lg'>
      {formatEther(balance.data?.value ?? BigInt(0))}
    </Label>
  );
}
