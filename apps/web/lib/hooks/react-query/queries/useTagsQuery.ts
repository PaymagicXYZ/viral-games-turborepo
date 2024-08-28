import { getTags } from '@/lib/actions/supabase/tags';
import { useQuery } from '@tanstack/react-query';

export default function useTagsQuery() {
  const { data } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
  });

  return { data };
}