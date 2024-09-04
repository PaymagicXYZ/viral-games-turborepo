import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Loading() {
  return (
    <main className='mx-auto mt-20 w-full overflow-auto border-2 border-black  px-12 pt-9 shadow-lg md:w-[1010px]'>
      <ProfileLoading />
      <ProfileTabsLoading />
    </main>
  );
}

function ProfileLoading() {
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

function ProfileTabsLoading() {
  return (
    <Tabs defaultValue='portfolio' className='mb-7 mt-12 bg-inherit'>
      <TabsList className='mb-7 flex w-full justify-start gap-11 rounded-none border-b-2 bg-inherit'>
        <TabsTrigger disabled value='portfolio'>
          Portfolio
        </TabsTrigger>
        <TabsTrigger disabled value='activity'>
          Activity
        </TabsTrigger>
        {/* <TabsTrigger value='referrals'>Referrals</TabsTrigger> */}
      </TabsList>
      <TabsContent value='portfolio'>
        <div className='h-[320px] space-y-6 overflow-auto'>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className='w-full h-28' />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
