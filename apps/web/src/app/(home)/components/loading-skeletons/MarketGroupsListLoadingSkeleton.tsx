import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketGroupsListLoadingSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 pb-4 pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className='flex h-[282px] w-full flex-col border-2 border-black p-4 shadow-sm'
        >
          <div className='mb-4'>
            <div className='relative flex w-full justify-between'>
              <Skeleton className='h-[62px] w-[61px] rounded-sm' />
              <Skeleton className='h-[27px] w-[27px]' />
            </div>
          </div>
          <Skeleton className='h-[64.08px] w-full' />
          <div className='mt-4 flex flex-1 justify-end  items-end gap-2'>
            <Button disabled className='h-[29px] w-full'>
              Yes
            </Button>
            <Button disabled className='h-[29px] w-full'>
              No
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
