'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '../ui/button';
import { formatAddress } from '@/lib/utils/formatters';
import { useIsClient } from '@/lib/hooks/useIsClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '../ui/label';
import Image from 'next/image';
import { copyToClipboard } from '@/lib/utils';
import useGetTempPlayerQuery from '@/lib/hooks/react-query/queries/useGetTempPlayerQuery';
import { useAsyncEffect } from '@/lib/hooks/useAsyncEffect';
import { web3AuthInstance } from '@/lib/config/web3Auth';

export default function Web3AuthConnectButton() {
  const { isClient } = useIsClient();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const account = useAccount();

  const { data } = useGetTempPlayerQuery();

  useAsyncEffect(async () => {
    if (!account.address) {
      return;
    }

    const userInfo = await web3AuthInstance?.getUserInfo();
    console.log(userInfo);
  }, [account.address]);

  const handleConnect = async () => {
    await connectAsync({ connector: connectors[0] });
  };

  const handleDisconnect = async () => {
    await disconnectAsync();
  };

  if (account.address && isClient) {
    return (
      // <Button
      //   className='w-[210px] text-xs text-black'
      //   onClick={handleDisconnect}
      // >
      //   {formatAddress(account.address)}
      // </Button>
      <DropdownMenu>
        <DropdownMenuTrigger className='w-[210px] text-xs text-black border-2 border-black shadow-sm h-[40px]'>
          {formatAddress(account.address)}
        </DropdownMenuTrigger>
        <DropdownMenuContent className='rounded-none w-[210px] mt-4 border-2 border-black shadow-sm space-y-3'>
          <DropdownMenuItem className='flex items-center justify-between'>
            <Label className='text-xs'>{formatAddress(account.address)}</Label>
            <Image
              className='cursor-pointer'
              src='/copy_icon.png'
              alt='copy_icon'
              width={22}
              height={22}
              onClick={() => copyToClipboard(account.address)}
            />
          </DropdownMenuItem>
          <DropdownMenuItem className='text-xs'>
            {data?.balance} USDV
          </DropdownMenuItem>

          <DropdownMenuItem className='text-xs' onClick={handleDisconnect}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button className='w-[210px] text-[12px]' onClick={handleConnect}>
      Connect Wallet
    </Button>
  );
}
