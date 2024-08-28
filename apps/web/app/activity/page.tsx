import { Label } from '@/components/ui/label';
import { Metadata } from 'next';
import ActivityList from './components/ActivityList';

export const metadata: Metadata = {
  title: 'Activity',
};

export default function Page() {
  return (
    <main className='mx-auto w-full space-y-10 border-0 shadow-none lg:p-6 xl:mt-10 xl:w-[1010px] xl:border-2 xl:border-black xl:shadow-lg'>
      <Label className='hidden text-lg lg:block'>Activity</Label>
      <ActivityList />
    </main>
  );
}
