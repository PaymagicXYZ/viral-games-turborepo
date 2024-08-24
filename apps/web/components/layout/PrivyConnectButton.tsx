'use client';

import { formatAddress } from '@/lib/utils/formatters';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '../ui/button';

export default function PrivyConnectButton() {
  const { connectWallet, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  if (!ready) {
    return (
      <Button className='w-[210px] text-xs text-black' disabled>
        Connecting...
      </Button>
    );
  }

  if (wallets.length) {
    const { address } = wallets[0];
    return (
      <Button className='w-[210px] text-xs text-black' key={address}>
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    ready &&
    !authenticated && (
      <Button className='w-[210px] text-[12px]' onClick={connectWallet}>
        Connect Wallet
      </Button>
    )
  );
}
