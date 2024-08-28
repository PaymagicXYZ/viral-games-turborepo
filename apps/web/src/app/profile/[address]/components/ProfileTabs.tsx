import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Address } from 'viem';
import ProfileActivity from './ProfileActivity';
import ProfilePortfolio from './ProfilePortfolio';

type ProfileTabsProps = {
  userAddress: Address;
};

export default function ProfileTabs({ userAddress }: ProfileTabsProps) {
  return (
    <Tabs defaultValue='portfolio' className='mb-7 mt-12 bg-inherit'>
      <TabsList className='mb-7 flex w-full justify-start gap-11 rounded-none border-b-2 bg-inherit'>
        <TabsTrigger value='portfolio'>Portfolio</TabsTrigger>
        <TabsTrigger value='activity'>Activity</TabsTrigger>
        {/* <TabsTrigger value='referrals'>Referrals</TabsTrigger> */}
      </TabsList>
      <TabsContent value='portfolio'>
        <ProfilePortfolio />
      </TabsContent>
      <TabsContent value='activity'>
        <ProfileActivity userAddress={userAddress} />
      </TabsContent>
      {/* <TabsContent value='referrals'>
        <ProfileReferrals userAddress={userAddress} />
      </TabsContent> */}
    </Tabs>
  );
}
