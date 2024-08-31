import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

export function MarketExchangeLoadingSkeleton() {
  const renderSwitch = () => (
    <div className='flex items-center space-x-2'>
      <Switch disabled={true} />
      <Label>Free Bet</Label>
    </div>
  );

  const renderOutcome = () => (
    <div className='flex flex-col gap-4'>
      <Label className='text-gray-500'>Outcome</Label>
      <div className='flex justify-between'>
        <Button disabled className='w-5/12 px-2 py-6 shadow-sm'>
          <Label className='mr-1'>Yes(0.00)%</Label>
        </Button>
        <Button disabled className='w-5/12 px-2 py-6 shadow-sm'>
          <Label className='mr-1'>No(0.00)%</Label>
        </Button>
      </div>
    </div>
  );

  const renderBalance = () => (
    <div className='flex h-[37px] items-center justify-between'>
      <Label className='text-gray-500'>Amount</Label>

      <div className='flex items-center gap-2 bg-gray-200 px-2 py-2'>
        <Label className='text-gray-500'>Balance:</Label>
        <Skeleton className='bg-gray-500 w-[180px] h-[29px]' />
      </div>
    </div>
  );

  const renderAmountInput = () => (
    <Input className='w-full rounded-none bg-gray-200' disabled />
  );

  const renderActionButton = () => (
    <Button
      disabled
      className='relative flex w-full justify-center gap-2 border-2 border-black bg-green-600 py-6 text-black shadow-sm hover:bg-green-700'
    >
      Buy
    </Button>
  );

  const renderOrderDetails = () => (
    <div className='flex flex-col gap-8'>
      <div className='flex justify-between'>
        <Label className='text-gray-500'>Your Avg price</Label>
        <Skeleton className='w-[85px] h-[14.24px] bg-gray-500' />
      </div>
      <div className='flex justify-between'>
        <Label className='text-gray-500'>Price Impact</Label>
        <Skeleton className='w-[85px] h-[14.24px] bg-gray-500' />
      </div>
      <div className='flex justify-between'>
        <Label className='text-gray-500'>Est. ROI</Label>
        <Skeleton className='w-[85px] h-[14.24px] bg-gray-500' />
      </div>
      <div className='flex justify-between'>
        <Label className='text-gray-500'>Return</Label>
        <Skeleton className='w-[85px] h-[14.24px] bg-gray-500' />
      </div>
    </div>
  );

  return (
    <section className='w-full lg:max-w-[532px]'>
      <div className='w-full space-y-8 border-2 border-black p-6 shadow-sm'>
        {renderSwitch()}
        <section className='flex flex-col gap-8'>
          {renderOutcome()}
          {renderBalance()}
          <div className='flex flex-col gap-4'>
            {renderAmountInput()} {renderActionButton()}
          </div>
          {renderOrderDetails()}
        </section>
      </div>
    </section>
  );
}
