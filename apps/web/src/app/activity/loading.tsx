import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className='mx-auto w-full space-y-10 border-0 shadow-none lg:p-6 xl:mt-10 xl:w-[1010px] xl:border-2 xl:border-black xl:shadow-lg'>
      <Label className='hidden text-lg lg:block'>Activity</Label>
      <ActivityListLoadingSkeleton />
    </main>
  );
}

export function ActivityListLoadingSkeleton() {
  return (
    <div className='h-[800px] space-y-10 overflow-scroll'>
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className='flex flex-col gap-2'>
          <div className='flex items-center gap-4'>
            <div className='flex-shrink-0'>
              <Skeleton className='size-[44px] rounded-full' />
            </div>
            <div className='flex-grow'>
              <Skeleton className='w-full h-[48px]' />
            </div>
          </div>
          <div className='ml-[60px]'>
            <Skeleton className='w-[156px] h-[14px]' />
          </div>
        </div>
      ))}
    </div>
  );
}
