'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Optional } from '@/lib/types';
import { formatAddress } from '@/lib/utils/formatters';
import clsx from 'clsx';
import { Pencil } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import { Address, isAddress } from 'viem';
import { useAccount } from 'wagmi';

type ProfileAvatarProps = {
  size?: 'small' | 'medium' | 'large';
  withPfpUpload?: boolean;
  withUsername?: boolean;
  externalPfp?: Optional<string>;
  withExternalPfp?: boolean;
};

const imageSizeConfig: { [key: string]: string } = {
  small: 'w-[44px] h-[44px]',
  medium: 'w-[95px] h-[95px]',
};

export default function ProfileAvatar({
  size = 'small',
  withPfpUpload,
  withUsername,
  externalPfp,
  withExternalPfp,
}: ProfileAvatarProps) {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const queryAddress = searchParams.get('address') as Address;
  // const { profile } = useProfileQuery({ address: queryAddress });

  // const { mutate: mutatePfp } = useUploadPfpMutation();
  // const { mutate: mutateProfile } = useProfileMutation();

  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [username, setUsername] = useState('');

  const canUpdateProfile = queryAddress === address;
  const imageSize = imageSizeConfig[size];

  const handlePfpUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];

    const formData = new FormData();
    formData.append('image', file);

    // mutatePfp(formData);
  };

  const handleUpdateUsername = () => {
    // mutateProfile({ username });
    setShowUsernameInput(false);
  };

  let pfpSource = '/v2/avatar_icon.svg';

  if (withExternalPfp && externalPfp) {
    pfpSource = externalPfp;
  }

  // if (!withExternalPfp && profile?.pfp) {
  //   pfpSource = profile.pfp;
  // }

  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='relative'>
        <Label htmlFor='pfp_input'>
          <Image
            src={pfpSource}
            alt='image'
            width={44}
            height={44}
            className={clsx(imageSize, 'rounded-full')}
          />
        </Label>
        {withPfpUpload && (
          <Input
            type='file'
            id='pfp_input'
            accept='image/*'
            onChange={handlePfpUpload}
            className='absolute hidden'
            disabled={!canUpdateProfile}
          />
        )}
      </div>
      {/* {withUsername && profile?.username && (
        <div className='flex items-center gap-2'>
          {showUsernameInput ? (
            <div className='flex gap-2'>
              <Input
                placeholder='Username'
                onChange={(event) => setUsername(event.target.value.trim())}
                onKeyDown={(event) =>
                  event.key === 'Enter' && handleUpdateUsername()
                }
              />
              <Button onClick={handleUpdateUsername}>Submit</Button>
            </div>
          ) : (
            <Label className='text-base'>
              {isAddress(profile.username)
                ? formatAddress(profile.username)
                : profile.username}
            </Label>
          )} */}
      <div className='flex items-center gap-2'>
        {!showUsernameInput && (
          <Pencil
            className={clsx('cursor-pointer', { hidden: !canUpdateProfile })}
            onClick={() => setShowUsernameInput((prev) => !prev)}
          ></Pencil>
        )}
      </div>
    </div>
  );
}
