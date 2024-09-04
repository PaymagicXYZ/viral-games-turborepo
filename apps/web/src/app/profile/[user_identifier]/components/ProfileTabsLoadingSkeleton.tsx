import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfileTabsLoadingSkeleton() {
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
