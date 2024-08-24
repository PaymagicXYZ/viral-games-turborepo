'use client';

// import { AppRoutes } from '@/constants';
// import { useWatchAddress } from '@/hooks/useWatchAddress';
import Link from 'next/link';
// import { useAccount } from 'wagmi';

export default function ProfileLink() {
  // const { address } = useAccount();

  // useWatchAddress();

  // let href = `${AppRoutes.Profile}`;

  // if (address) {
  //   href += `?address=${address}`;
  // }

  // const url = !address ? AppRoutes.Profile : `${AppRoutes.Profile}/${address}`;

  return (
    <Link href='/profile' className='text-sm'>
      Profile
    </Link>
  );
}
