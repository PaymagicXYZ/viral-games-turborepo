import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketGroupsTagsLoadingSkeleton() {
  return (
    <div className='w-full space-x-4'>
      {Array.from({ length: 5 }, (_, index) => (
        <Button className='w-[180px]' key={index} disabled>
          <Skeleton className='w-full h-full' />
        </Button>
      ))}
    </div>
  );
}
