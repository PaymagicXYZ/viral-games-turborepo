import { Label } from '@/components/ui/label';
import { isAddress } from 'viem';
import ProfileAddress from './ProfileAddress';
import ProfileAvatar from './ProfileAvatar';
import WalletBalance from './WalletBalance';
import { getFacasterUserByUsername } from '@/lib/actions/neynar';
import { NeynarUserProfileType } from '@/lib/types/neynar';
import { Optional } from '@/lib/types';

type ProfileProps = {
  userIdentifier: string;
};

export default async function Profile({ userIdentifier }: ProfileProps) {
  const isUserAddress = isAddress(userIdentifier);
  let user: Optional<NeynarUserProfileType>;

  // we assume is Farcaster account but we will need social provider for sure
  if (!isUserAddress) {
    user = await getFacasterUserByUsername({ username: userIdentifier });
  }

  const userAddress = !isUserAddress
    ? user?.verified_addresses.eth_addresses?.[0]
    : userIdentifier;

  return (
    <section className='flex flex-col items-center justify-center gap-8'>
      <ProfileAvatar pfp={user?.pfp_url} />

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
