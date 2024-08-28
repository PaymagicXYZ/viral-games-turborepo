'use client';

import { Label } from '@/components/ui/label';
import { copyToClipboard } from '@/lib/utils';
import { formatAddress } from '@/lib/utils/formatters';
import Image from 'next/image';
import { Address } from 'viem';

type ProfileAddressProps = {
  userAddress: Address;
};

export default function ProfileAddress({ userAddress }: ProfileAddressProps) {
  return (
    <section
      className='flex cursor-pointer items-center gap-2 border border-black px-2 py-3.5 shadow-sm'
      onClick={() => copyToClipboard(userAddress)}
    >
      <Label className='cursor-pointer'>{formatAddress(userAddress)}</Label>
      <Image src='/copy_icon.png' alt='copy_icon' width={27} height={27} />
    </section>
  );
}
