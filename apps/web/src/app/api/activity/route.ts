import { env } from '@/lib/config/env';
import { supabaseClient } from '@/lib/config/supabaseClient';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ActivitySchema = z.object({
  user_address: z.string(),
  ens: z.string().nullable().optional(),
  pfp: z.string().nullable().optional(),
  market_address: z.string(),
  market_title: z.string(),
  market_uri: z.string().nullable().optional(),
  outcome_index: z.union([z.literal(0), z.literal(1)]),
  strategy: z.enum(['buy', 'sell']),
  asset_ticker: z.string(),
  tx_hash: z.string(),
  tx_value: z.string(),
  chain: z.enum(['base', 'polygon']),
  chain_id: z.number(),
  provider: z.string(),
  outcome_index_formatted: z.string(),
});

export type Activity = z.infer<typeof ActivitySchema>;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${env.WEB_APP_API_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }

    const json = await request.json();

    const validationResult = ActivitySchema.safeParse(json);

    if (!validationResult.success) {
      return new Response('Invalid request data', { status: 400 });
    }

    const activity: Activity = validationResult.data;

    const { data, error } = await supabaseClient
      .from('activities')
      .insert({
        ...activity,
        user_address: activity.user_address.toLowerCase(),
        market_address: activity.market_address.toLowerCase(),
      })
      .select();

    if (error) throw error;

    return Response.json({ data }, { status: 201 });
  } catch (err) {
    console.error('Error inserting activity:', err);
    return Response.json(
      { error: 'Failed to insert activity' },
      { status: 500 },
    );
  }
}
