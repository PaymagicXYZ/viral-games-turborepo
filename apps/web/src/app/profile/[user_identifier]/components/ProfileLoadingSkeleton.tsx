import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoadingSkeleton() {
  return (
    <section className='flex flex-col items-center justify-center gap-8'>
      <div className='flex flex-col items-center gap-2'>
        <Skeleton className='size-11 rounded-full' />
      </div>
      <div className='flex gap-14'>
        <div className='flex flex-col items-center gap-3'>
          <Label>ETH IN WALLET</Label>
          <Skeleton className='w-full h-8' />
        </div>
      </div>
      <section className='flex cursor-pointer items-center gap-2 border border-black px-2 py-3.5 shadow-sm w-[238px] h-[57px]'>
        <Skeleton className='w-full h-5' />
      </section>
    </section>
  );
}
