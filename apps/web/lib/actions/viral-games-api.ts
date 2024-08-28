'use server';

import type {
  BuyErrorResponse,
  BuySuccessResponse,
} from '@/lib/types/limitless';
import type { Tables } from '../types/supabase';
import { env } from '../config/env';

export async function getTempPlayer({
  user_address,
  provider = 'eoa',
}: {
  user_address: string;
  provider?: 'eoa' | 'farcaster';
}) {
  const url = `${
    env.NEXT_PUBLIC_VIRAL_GAMES_BE_API
  }/user/${provider}/${user_address.toLowerCase()}`;
  const options: RequestInit = {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${env.NEXT_PUBLIC_VIRAL_GAMES_BE_API_SECRET}`,
    },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    console.log('response', response);
    throw new Error('Failed to register temp player');
  }

  const data = await response.json();

  return data as Tables<'temp_player'>;
}

export async function buyShares({
  socialProvider,
  provider,
  userId,
  marketId,
  eventId,
  amount,
  position,
}: {
  socialProvider: 'eoa' | 'farcaster';
  provider: 'limitless' | 'polymarket';
  userId: string;
  marketId: string;
  eventId: string;
  amount: number;
  position: 'Yes' | 'No';
}) {
  const url = `${env.NEXT_PUBLIC_VIRAL_GAMES_BE_API}/buy`;

  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.NEXT_PUBLIC_VIRAL_GAMES_BE_API_SECRET}`,
    },
    body: JSON.stringify({
      socialProvider,
      provider,
      userId: socialProvider === 'eoa' ? userId.toLowerCase() : userId,
      marketId,
      eventId,
      amount,
      position,
    }),
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error('Failed to buy shares');
  }

  const data = (await response.json()) as BuySuccessResponse | BuyErrorResponse;

  if ('error' in data) {
    return data;
  }

  return { ...data, error: null };
}

export async function getShares({
  user_address,
  market_address,
}: {
  user_address: string;
  market_address: string;
}) {
  const url = `${
    env.NEXT_PUBLIC_VIRAL_GAMES_BE_API
  }/user/eoa/${user_address.toLowerCase()}/${market_address.toLowerCase()}`;
  const options: RequestInit = {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${env.NEXT_PUBLIC_VIRAL_GAMES_BE_API_SECRET}`,
    },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error('Failed to fetch shares');
  }

  const data = await response.json();

  return data;
}

export async function getPortfolio({ user_address }: { user_address: string }) {
  const url = `${
    env.NEXT_PUBLIC_VIRAL_GAMES_BE_API
  }/user/eoa/${user_address.toLowerCase()}/portfolio`;

  const options: RequestInit = {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${env.NEXT_PUBLIC_VIRAL_GAMES_BE_API_SECRET}`,
    },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error('Failed to fetch portfolio');
  }

  const data = await response.json();

  return data;
}
