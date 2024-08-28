import { Label } from '@/components/ui/label';

import { Address } from 'viem';
import ProfileAddress from './ProfileAddress';
import ProfileAvatar from './ProfileAvatar';
import WalletBalance from './WalletBalance';

type ProfileProps = {
  userAddress: Address;
};

export default async function Profile({ userAddress }: ProfileProps) {
  return (
    <section className='flex flex-col items-center justify-center gap-8'>
      <ProfileAvatar size='medium' withPfpUpload withUsername />
      <div className='flex gap-14'>
        <div className='flex flex-col items-center gap-3'>
          <Label>ETH IN WALLET</Label>
          <WalletBalance userAddress={userAddress} />
        </div>
      </div>
      <ProfileAddress userAddress={userAddress} />
    </section>
  );
}
