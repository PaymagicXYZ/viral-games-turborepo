'use server';

import type {
  BuyErrorResponse,
  BuySuccessResponse,
} from '@/lib/types/limitless';
import { env } from '../config/env';
import { PaginatedMarketResponse } from '../types/markets';
import { LIMIT_PER_PAGE } from '../constants';
import { Tables } from '@repo/shared-types';

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
      Authorization: `Bearer ${env.VIRAL_GAMES_BE_API_SECRET}`,
    },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
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
  provider: 'limitless' | 'polymarket' | 'custom';
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
      Authorization: `Bearer ${env.VIRAL_GAMES_BE_API_SECRET}`,
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
  }/user/eoa/${user_address.toLowerCase()}/${market_address}`;
  const options: RequestInit = {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${env.VIRAL_GAMES_BE_API_SECRET}`,
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
      Authorization: `Bearer ${env.VIRAL_GAMES_BE_API_SECRET}`,
    },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error('Failed to fetch portfolio');
  }

  const data = await response.json();

  return data;
}

export async function fetchMarkets() {
  let baseUrl = `${env.NEXT_PUBLIC_VIRAL_GAMES_BE_API}/markets?limit=${LIMIT_PER_PAGE}`;

  // if (pageParam) {
  //   baseUrl += `&cursor=${pageParam}`;
  // }

  const response = await fetch(baseUrl, { next: { revalidate: 60 } });

  if (!response.ok) {
    throw new Error(`Failed to fetch markets: ${response.status}`);
  }

  const data: PaginatedMarketResponse = await response.json();
  return data;
}
