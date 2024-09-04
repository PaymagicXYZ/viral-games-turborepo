import { getUserActivities } from '@/lib/actions/supabase/activities';
import { Optional } from '@/lib/types';
import { ActivityItem } from '@/src/app/activity/components/ActivityList';
import { Address } from 'viem';

type ProfileActivityProps = {
  socialProvider: string;
  userAddress: Optional<string>;
  userFid?: Optional<number>;
};

export default async function ProfileActivity({
  socialProvider,
  userFid,
  userAddress,
}: ProfileActivityProps) {
  const activityIdentifier = userFid ? userFid.toString() : userAddress;

  if (!activityIdentifier) {
    return;
  }

  const activities = await getUserActivities({
    socialProvider,
    userIdentifier: activityIdentifier,
  });

  return (
    <section className='h-[320px] space-y-6 overflow-auto pb-4'>
      {activities.map((item) => (
        <ActivityItem key={item.tx_hash} item={item} withActions />
      ))}
    </section>
  );
}
