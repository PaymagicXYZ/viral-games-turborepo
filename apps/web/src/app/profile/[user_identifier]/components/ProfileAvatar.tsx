import { Optional } from '@/lib/types';
import { generateRandomGradient } from '@/lib/utils';
import Image from 'next/image';

type ProfileAvatarProps = {
  pfp?: Optional<string>;
};

export default async function ProfileAvatar({ pfp }: ProfileAvatarProps) {
  return (
    <div className='flex flex-col items-center gap-2'>
      {pfp ? (
        <div className='relative w-[44px] h-[44px]'>
          <Image
            src={pfp}
            alt='user_pfp'
            fill
            className='object-cover rounded-full flex'
          />
        </div>
      ) : (
        <div className='relative'>
          <div
            className='h-[44px] w-[44px] rounded-full'
            style={{ background: generateRandomGradient() }}
          />
        </div>
      )}
    </div>
  );
}
