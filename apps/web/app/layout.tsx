import type { Metadata } from 'next';
import { clsx } from 'clsx';
import './globals.css';
import localFont from 'next/font/local';
import { env } from '@/lib/config/env';
import Navbar from '@/components/layout/Navbar';

const pressStart2p = localFont({
  src: '../public/fonts/PressStart2P.ttf',
  display: 'swap',
  variable: '--font-press-start'
});

const APP_NAME = 'Viral.games';
const APP_URL = new URL(env.NEXT_PUBLIC_WEB_APP_BASE_URL);
const METADATA_DESCRIPTION = 'Viral.games - Bet on what goes viral!';

export const metadata: Metadata = {
  metadataBase: APP_URL,
  title: {
    template: `%s |${APP_NAME}`,
    default: APP_NAME
  },
  description: METADATA_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    APP_NAME,
    'Prediction Market',
    'Twitter',
    'Farcaster',
    'YouTube',
    'X'
  ],
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US'
    }
  },
  icons: {
    icon: ['/favicon.ico'],
    apple: ['/apple-touch-icon.png'],
    shortcut: ['/apple-touch-icon.png']
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: APP_NAME,
    description: METADATA_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    type: 'website',
    locale: 'en_US',
    images: ['']
  },
  twitter: {
    title: APP_NAME,
    description: METADATA_DESCRIPTION,
    site: APP_NAME
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={clsx(pressStart2p.variable, 'font-press-start text-black')}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
