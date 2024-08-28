import { Metadata } from 'next';
import { Address } from 'viem';
import Profile from './components/Profile';
import ProfileTabs from './components/ProfileTabs';

export const metadata: Metadata = {
  title: 'Profile',
};

type PageProps = {
  params: {
    address: Address;
  };
};

export default function Page({ params: { address } }: PageProps) {
  return (
    <main className='mx-auto mt-20 w-full overflow-auto border-2 border-black  px-12 pt-9 shadow-lg md:w-[1010px]'>
      <Profile userAddress={address} />
      <ProfileTabs userAddress={address} />
    </main>
  );
}
