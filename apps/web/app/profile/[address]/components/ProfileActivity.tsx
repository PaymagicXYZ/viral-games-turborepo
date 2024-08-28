import { ActivityItem } from '@/app/activity/components/ActivityList';
import { getUserActivities } from '@/lib/actions/supabase/activities';
import { Address } from 'viem';

type ProfileActivityProps = {
  userAddress: Address;
};

export default async function ProfileActivity({
  userAddress,
}: ProfileActivityProps) {
  const activities = await getUserActivities({
    address: `eoa:${userAddress}` as Address,
  });

  return (
    <section className='h-[320px] space-y-6 overflow-auto'>
      {activities.map((item) => (
        <ActivityItem key={item.tx_hash} item={item} withActions />
      ))}
    </section>
  );
}
