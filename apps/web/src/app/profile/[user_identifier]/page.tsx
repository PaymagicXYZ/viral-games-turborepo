import { Metadata } from 'next';
import { Address } from 'viem';
import Profile from './components/Profile';
import ProfileTabs from './components/ProfileTabs';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Profile',
};

type PageProps = {
  params: {
    user_identifier: Address;
  };
};

export default function Page({ params: { user_identifier } }: PageProps) {
  return (
    <main className='mx-auto mt-20 w-full overflow-auto border-2 border-black  px-12 pt-9 shadow-lg md:w-[1010px]'>
      <Suspense>
        <Profile userIdentifier={user_identifier} />
      </Suspense>
      <Suspense>
        <ProfileTabs userIdentifier={user_identifier} />
      </Suspense>
    </main>
  );
}
