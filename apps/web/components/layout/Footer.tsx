'use client';

import AppLogo from './AppLogo';
import Links from './Links';

export default function Footer() {
  return (
    <footer className='mt-10 flex flex-col items-start justify-between lg:mt-16 lg:flex-row'>
      <section className='flex flex-col items-start gap-3'>
        <AppLogo />
        {/* <div className='flex flex-row items-center gap-2'>
          <Link
            target='_blank'
            href='https://warpcast.com/~/channel/trendsmarket'
          >
            <Image
              src='/v2/warpcast_icon.png'
              width={24}
              height={24}
              alt='warpcast icon'
            />
          </Link>
          <Link target='_blank' href='https://twitter.com/trendsmarket_'>
            <Image
              src='/v2/twitter_icon.png'
              width={24}
              height={24}
              alt='twitter_icon'
            />
          </Link>
        </div> */}
      </section>
      <section className='mb-9 mt-9 flex flex-col gap-4 text-sm lg:mb-0 lg:mt-0'>
        {/* <h4 className='text-base text-white'>Navigation</h4> */}
        <Links />
      </section>
      <section className='flex flex-col gap-4 text-sm'>
        {/* <p>©Trendmarkets 2024</p>
        <Link href='/'>Privacy Policy</Link>
        <Link href='/'>Terms of Service</Link> */}
      </section>
    </footer>
  );
}
