import Image from 'next/image';
import Link from 'next/link';

export default function AppLogo() {
  return (
    <div className='flex items-center gap-2'>
      <Image src='/app-logo.png' alt='app-logo' width={42} height={38} />
      <Link href='/' className='text-[22.86px] text-black'>
        Viral.games
      </Link>
    </div>
  );
}
