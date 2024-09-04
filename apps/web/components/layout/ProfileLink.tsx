'use client';

import { useIsClient } from '@/lib/hooks/useIsClient';
// import { AppRoutes } from '@/constants';
// import { useWatchAddress } from '@/hooks/useWatchAddress';
import Link from 'next/link';
import { useAccount } from 'wagmi';
// import { useAccount } from 'wagmi';

export default function ProfileLink() {
  const { isClient } = useIsClient();

  const walletAddress = useAccount().address;

  return (
    isClient && (
      <Link href={`/profile/${walletAddress}`} className='text-sm'>
        Profile
      </Link>
    )
  );
}
