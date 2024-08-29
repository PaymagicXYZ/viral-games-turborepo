import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LottieLoading from '@/components/ui/lottie-loading';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

export default function Loading() {
  return (
    <main className='mt-10 flex flex-col-reverse gap-10 lg:min-h-[1041px] lg:flex-row'>
      <MarketDetailsLoadingSkeleton />
      <MarketExchangeLoadingSkeleton />
    </main>
  );
}

function MarketDetailsLoadingSkeleton() {
  const renderMarketTags = () => (
    <div className='flex flex-wrap gap-4'>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className='bg-gray-200 px-2 py-1 w-[136px] h-[32px] flex items-center'
        >
          <Skeleton className='bg-gray-500 w-full h-[16px]' />
        </div>
      ))}
    </div>
  );

  const renderImage = () => (
    <div className='relative h-auto w-full lg:h-[200px] lg:w-[300px]'>
      <Skeleton className='w-full h-full rounded-none' />
    </div>
  );

  const renderTitle = () => <Skeleton className='w-full h-[48px]' />;

  const renderCreator = () => (
    <div className='flex items-center gap-4'>
      <Skeleton className='size-[40px]' />
      <Skeleton className='w-[142px] h-[14.24px]' />
      <Skeleton className='size-[20px]' />
    </div>
  );

  const renderMarketMetadata = () => (
    <>
      <div className='flex flex-col justify-center gap-2 bg-gray-200 px-2 py-1'>
        <Label className='text-xs text-gray-500'>Expires At</Label>
        <Skeleton className='w-full lg:w-[132px] h-[16px] bg-gray-500' />
      </div>
      <div className='flex flex-col justify-center gap-2 bg-gray-200 px-2 py-1'>
        <Label className='text-xs text-gray-500'>Volume</Label>
        <Skeleton className='w-full lg:w-[132px] h-[16px] bg-gray-500' />
      </div>
      <div className='flex flex-col justify-center gap-2 bg-gray-200 px-2 py-1'>
        <Label className='text-xs text-gray-500'>Liquidity</Label>
        <Skeleton className='w-full lg:w-[132px] h-[16px] bg-gray-500' />
      </div>
    </>
  );

  const renderChart = () => <Skeleton className='h-64 w-full bg-gray-200' />;

  const renderMarketDescription = () => (
    <div className='flex flex-col gap-2'>
      <Label className='text-gray-500'>Description</Label>
      <Skeleton className='w-full h-[130px] bg-gray-200' />
    </div>
  );

  const renderMarketPositions = () => (
    <div className='flex flex-col gap-2'>
      <Label className='text-base text-gray-500'>Portfolio</Label>
      <Skeleton className='flex w-full flex-col gap-6 bg-gray-200 px-2 py-4 h-[150px]' />
    </div>
  );

  return (
    <section className='flex w-full flex-col gap-10 border-2 border-black p-5 shadow-sm lg:min-h-[1041px] lg:max-w-[75%]'>
      {renderMarketTags()}
      <div className='flex flex-col items-center gap-4 lg:flex-row'>
        {renderImage()}
        <div className='flex h-full w-full flex-col justify-between py-2'>
          {renderTitle()}
          {renderCreator()}
        </div>
      </div>
      <div className='flex flex-col flex-wrap gap-4 lg:flex-row'>
        {renderMarketMetadata()}
      </div>
      {renderChart()}

      {renderMarketDescription()}
      {renderMarketPositions()}
    </section>
  );
}

function MarketExchangeLoadingSkeleton() {
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
          Yes (<Skeleton className='w-[40px] h-[14px] bg-gray-500' />)
        </Button>
        <Button disabled className='w-5/12 px-2 py-6 shadow-sm'>
          No (<Skeleton className='w-[40px] h-[14px] bg-gray-500' />)
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
