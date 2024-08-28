import { fetchActivities } from '@/lib/actions/supabase/activities';
import { supabaseBrowserClient } from '@/lib/config/supabaseBrowserClient';
import { Tables } from '@/lib/types/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function useFetchActivitiesQuery() {
  const { data, isLoading } = useQuery({
    queryKey: ['fetch_activities'],
    queryFn: () => fetchActivities(),
  });

  return { activities: data, isLoading };
}

export function useActivitiesSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabaseBrowserClient
      .channel('activities_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
        },
        (payload) => {
          const newActivity = payload.new;

          queryClient.setQueryData(
            ['fetch_activities'],
            (oldData: Tables<'activities'>[]) => {
              console.log(oldData);
              if (!oldData) return [newActivity];

              return [newActivity, ...oldData];
            },
          );
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);
}
