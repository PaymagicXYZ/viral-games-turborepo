import LottieLoading from '@/components/ui/lottie-loading';

export default function Loading() {
  return (
    <div className='flex h-full min-h-[1041px] w-full items-start justify-center'>
      <div className='h-[250px] w-full'>
        <LottieLoading />
      </div>
    </div>
  );
}
