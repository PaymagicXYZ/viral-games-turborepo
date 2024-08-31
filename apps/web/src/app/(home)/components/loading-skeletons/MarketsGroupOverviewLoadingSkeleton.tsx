import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketsGroupOverviewLoadingSkeleton() {
  return (
    <section className='hidden h-[208px] overflow-x-auto md:block'>
      <div className='flex gap-7'>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className='flex h-[400px] w-[270px] flex-shrink-0 flex-col-reverse items-center gap-4 border-2 border-black p-5 shadow-sm md:h-[188px] md:flex-row lg:w-[505px]'
          >
            <div className='flex h-full w-full flex-col justify-between gap-4'>
              <div className='flex flex-wrap'>
                <Skeleton className='h-12 w-full' />
              </div>
              <Skeleton className='h-[27px] w-[27px]' />
              <Button disabled className='w-full md:w-[132px] min-h-[40px]'>
                Bet Now
              </Button>
            </div>
            <div className='flex-none'>
              <Skeleton className='relative h-48 w-56 md:size-36' />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
