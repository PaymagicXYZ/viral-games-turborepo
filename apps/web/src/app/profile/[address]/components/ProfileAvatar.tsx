'use client';

import { generateRandomGradient } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

export default function ProfileAvatar() {
  const searchParams = useSearchParams();

  const randomGradient = generateRandomGradient();

  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='relative'>
        <div
          className='h-[44px] w-[44px] rounded-full'
          style={{ background: randomGradient }}
        />
      </div>
    </div>
  );
}
