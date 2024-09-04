import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Address, isAddress } from 'viem';
import ProfileActivity from './ProfileActivity';
import ProfilePortfolio from './ProfilePortfolio';
import { Optional } from '@/lib/types';
import { NeynarUserProfileType } from '@/lib/types/neynar';
import { getFacasterUserByUsername } from '@/lib/actions/neynar';
import { Suspense } from 'react';

type ProfileTabsProps = {
  userIdentifier: Address;
};

export default async function ProfileTabs({
  userIdentifier,
}: ProfileTabsProps) {
  const isUserAddress = isAddress(userIdentifier);

  let user: Optional<NeynarUserProfileType>;

  // we assume is Farcaster account but we will need social provider for sure
  // there is pattern currently `{socialProvider}:{user_id}`
  if (!isUserAddress) {
    user = await getFacasterUserByUsername({ username: userIdentifier });
  }

  const userAddress = isUserAddress
    ? userIdentifier
    : user?.verified_addresses.eth_addresses?.[0];

  return (
    <Tabs defaultValue='portfolio' className='mb-7 mt-12 bg-inherit'>
      <TabsList className='mb-7 flex w-full justify-start gap-11 rounded-none border-b-2 bg-inherit'>
        <TabsTrigger value='portfolio'>Portfolio</TabsTrigger>
        <TabsTrigger value='activity'>Activity</TabsTrigger>
      </TabsList>
      <TabsContent value='portfolio'>
        <ProfilePortfolio
          socialProvider={isUserAddress ? 'eoa' : 'farcaster'}
          userAddress={userAddress}
          userFid={user?.fid}
        />
      </TabsContent>
      <TabsContent value='activity'>
        <Suspense>
          <ProfileActivity
            socialProvider={isUserAddress ? 'eoa' : 'farcaster'}
            userAddress={userAddress}
            userFid={user?.fid}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
