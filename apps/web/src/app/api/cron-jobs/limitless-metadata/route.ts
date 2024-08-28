import { env } from '@/lib/config/env';
import { supabaseClient } from '@/lib/config/supabaseClient';
import type { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${env.WEB_APP_CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const response = await fetch(
      `https://api.limitless.exchange/markets/active?limit=50`,
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const responseData = await response.json();

    // after new API changes they are not returning `tags` anymore so we can't check if
    // their tags includes our supported tags......
    const marketsMetadata = responseData.map(
      (e: { address: string; title: string }) => ({
        address: e.address,
        title: e.title,
        provider: 'limitless',
      }),
    );

    const { data, error } = await supabaseClient
      .from('markets_metadata')
      .upsert(marketsMetadata, {
        onConflict: 'address',
        ignoreDuplicates: true,
      });

    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error('Upserting to Supabase failed');
    }

    return Response.json(
      {
        success: true,
        message: '[CRON] Limitless metadata Upsert successful',
      },
      { status: 200 },
    );
  } catch (error) {
    const _error = error as Error;
    console.error('[CRON] Limitless metadata error:', _error);

    let errorMessage = _error.message;
    try {
      const parsedError = JSON.parse(_error.message);
      errorMessage = `${parsedError.message}: ${parsedError.details.message}`;
    } catch {}

    return new Response(`[CRON] Limitless metadata error: ${errorMessage}`, {
      status: 500,
    });
  }
}
