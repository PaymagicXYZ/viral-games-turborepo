'use client';

import PrivyConnectButton from '@/components/layout/PrivyConnectButton';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAccount } from 'wagmi';

type ProfileTemplateProps = {
  children: ReactNode;
};

export default function ProfileTemplate({ children }: ProfileTemplateProps) {
  const params = useParams();
  const account = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!params.address && !account.address) {
      return;
    }

    // in case address is not presented we use user account address
    if (!params.address && account.address) {
      router.push(`/profile/${account.address}`);
    }
  }, [params?.address, account?.address]);

  return (
    <div>
      {!params?.address && !account?.address ? (
        <div className='mx-auto mt-20 flex h-[817px] w-full items-center justify-center overflow-auto border  shadow-lg md:w-[1010px]'>
          <PrivyConnectButton />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
