// import { AppRoutes } from '@/constants';

import Link from 'next/link';
import ProfileLink from './ProfileLink';

export default function Links() {
  return (
    <>
      <Link href='/activity'>Activity</Link>

      <ProfileLink />

      {/*  <Link onClick={() => onSelect()} href={AppRoutes.Leaderboard}>
        Leaderboard
      </Link> */}
    </>
  );
}
