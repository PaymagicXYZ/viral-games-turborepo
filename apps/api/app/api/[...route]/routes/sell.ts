import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { supabase, initUser } from '../utils';
import { MarketProviderFactory } from '@/app/services/market/MarketProviderFactory';
const sell = new OpenAPIHono();

const SellSchema = z
  .object({
    socialProvider: z.string(),
    provider: z.string(),
    userId: z.string(),
    marketId: z.string(),
    eventId: z.string(),
  })
  .openapi('Sell');

const SellResponseSchema = z
  .object({
    message: z.string(),
    updatedPoints: z.number(),
  })
  .openapi('SellResponse');

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('Error');

const route = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SellSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SellResponseSchema,
        },
      },
      description: 'Buy action processed successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Bad request',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'User not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Server error',
    },
  },
});

sell.openapi(route, async (c) => {
  const body = c.req.valid('json');
  const { provider, userId, marketId, socialProvider, eventId } = body;

  const userData = await initUser(socialProvider, userId.toLowerCase());
  const normalizedMarketId = marketId.toLowerCase();

  if (!userData) {
    return c.json({ error: 'User not found' }, 404);
  }

  const marketProvider = MarketProviderFactory.getProvider(provider);
  const markets = await marketProvider.getMarket(eventId);
  const marketData = markets?.data?.find(
    (m) => m.id.toLowerCase() === normalizedMarketId,
  );

  if (!marketData) {
    return c.json({ error: 'Invalid market input' }, 400);
  }

  const winningOutcomeIndex = marketData?.winningOutcomeIndex;

  if (winningOutcomeIndex === undefined || winningOutcomeIndex === null) {
    return c.json({ error: 'Market not resolved' }, 400);
  }

  const { data: positions, error: positionsError } = await supabase
    .from('market_positions')
    .select('*')
    .eq('userId', userData.uuid)
    .eq('eventId', eventId)
    .eq('position', winningOutcomeIndex.toString())
    .eq('resolved', false);

  if (positionsError) {
    return c.json({ error: positionsError.message }, 500);
  }

  if (!positions?.length) {
    return c.json({ error: 'No positions found' }, 400);
  }

  const amountToClaim = positions.reduce((acc, position) => {
    return acc + position.shares;
  }, 0);

  const { error: claimError } = await supabase
    .from('market_positions')
    .upsert(positions.map((position) => ({ ...position, resolved: true })));

  if (claimError) {
    return c.json({ error: claimError.message }, 500);
  }

  const newPoints = userData.points + amountToClaim;

  const { error } = await supabase
    .from('temp_player')
    .update({
      points: newPoints,
      updated_at: new Date().toISOString(),
    })
    .eq('uuid', userData.uuid);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(
    {
      message: 'Sell operation successful',
      updatedPoints: newPoints,
    },
    200,
  );
});

export { sell };
