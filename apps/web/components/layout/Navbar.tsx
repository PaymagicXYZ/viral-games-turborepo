'use client';
import { Menu, X } from 'lucide-react';

import { useState } from 'react';
import { useOutsideClick } from '@/lib/hooks/useOutsideClick';
import AppLogo from './AppLogo';
import Links from './Links';
import PrivyConnectButton from './PrivyConnectButton';
import MarketsSearchBox from './MarketSearchBox';
import Web3AuthConnectButton from './Web3AuthConnectButton';

export default function Navbar() {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
}

function DesktopNavbar() {
  return (
    <nav className='relative hidden h-[50px] flex-row items-center justify-between xl:flex'>
      <AppLogo />
      <MarketsSearchBox />
      <div className='hidden  gap-10 text-sm lg:flex'>
        <Links />
      </div>
      <div className='hidden gap-2 lg:flex'>
        <PrivyConnectButton />
        {/* <Web3AuthConnectButton /> */}
      </div>
    </nav>
  );
}

function MobileNavbar() {
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);

  const ref = useOutsideClick(() => setIsBurgerMenuOpen(false));
  const navbarClasses = `fixed xl:hidden top-0 left-0 right-0 z-20 transform transition-transform ease-out duration-500 bg-white ${
    isBurgerMenuOpen ? 'translate-y-0' : '-translate-y-full'
  } bg-[#0A0A0A]`;

  return (
    <nav className='xl:hidden'>
      <div className='flex flex-row items-center justify-between'>
        <AppLogo />

        <Menu color='black' onClick={() => setIsBurgerMenuOpen(true)} />
      </div>
      <div className='mt-4 flex w-full justify-center'>
        <MarketsSearchBox />
      </div>
      <div ref={ref} className={navbarClasses} aria-hidden={!isBurgerMenuOpen}>
        <div className='flex items-center justify-between px-4 pt-9'>
          <AppLogo />
          <X color='white' onClick={() => setIsBurgerMenuOpen(false)} />
        </div>
        <div className='mb-6 mt-8 flex flex-col items-center justify-center gap-10'>
          <Links />
          <PrivyConnectButton />
          {/* <Web3AuthConnectButton /> */}
        </div>
      </div>
    </nav>
  );
}
