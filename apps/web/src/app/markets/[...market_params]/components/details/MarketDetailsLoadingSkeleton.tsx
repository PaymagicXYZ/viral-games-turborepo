import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export function MarketDetailsLoadingSkeleton() {
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
    <section className='flex w-full flex-col gap-10 border-2 border-black p-5 shadow-sm lg:min-h-[1041px]'>
      {renderMarketTags()}
      <div className='flex flex-col items-center gap-4 lg:flex-row'>
        {renderImage()}
        <div className='flex lg:h-[200px] h-full w-full flex-col justify-between py-2'>
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
