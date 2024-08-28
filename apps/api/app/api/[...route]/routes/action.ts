import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { supabase, initUser, fetchMarket } from '../utils';
import {
  jsonSchema,
  activitiesInsertSchema,
  tempPlayerUpdateSchema,
} from '@/types/schemas';

const action = new OpenAPIHono();

const ActionSchema = z
  .object({
    action: z.enum(['buy', 'sell']),
    provider: z.string(),
    userId: z.string(),
    address: z.string(),
    shares: z.number(),
    price: z.number(),
    position: z.enum(['Yes', 'No']),
  })
  .openapi('Action');

const ActionResponseSchema = z
  .object({
    message: z.string(),
    remainingBalance: z.number(),
    updatedPortfolio: z.object({
      shares: z.number(),
    }),
    updatedPoints: z.number(),
  })
  .openapi('ActionResponse');

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('Error');

type Portfolio = {
  [address: string]: {
    Yes?: { shares: number };
    No?: { shares: number };
  };
};

const route = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ActionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ActionResponseSchema,
        },
      },
      description: 'Action processed successfully',
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

action.openapi(route, async (c) => {
  const body = c.req.valid('json');
  const { action, provider, userId, address, shares, price, position } = body;

  const userData = await initUser(provider, userId);
  if (!userData) {
    return c.json({ error: 'User not found' }, 404);
  }

  const totalValue = shares * price;
  if (action === 'buy' && userData.balance + userData.points < totalValue) {
    return c.json({ error: 'Insufficient balance' }, 400);
  }

  let portfolio: Portfolio = userData.portfolio
    ? (jsonSchema.parse(userData.portfolio) as Portfolio)
    : {};

  if (!portfolio[address]) {
    portfolio[address] = {};
  }

  if (!portfolio[address][position]) {
    portfolio[address][position] = { shares: 0 };
  }

  const positionData = portfolio[address][position]!;

  if (action === 'buy') {
    positionData.shares += shares;
  } else if (action === 'sell') {
    if (positionData.shares < shares) {
      return c.json({ error: 'Insufficient position to sell' }, 400);
    }
    positionData.shares -= shares;
  }

  const newBalance =
    action === 'buy' ? userData.balance - totalValue : userData.balance;

  const newPoints =
    action === 'buy'
      ? newBalance > 0
        ? userData.points
        : userData.points + newBalance
      : userData.points + totalValue;

  const marketData = await fetchMarket(address);
  if (!marketData) {
    return c.json({ error: 'Invalid market input' }, 400);
  }

  const { error: updateUserError } = await supabase
    .from('temp_player')
    .update(
      tempPlayerUpdateSchema.parse({
        balance: newBalance > 0 ? newBalance : 0,
        points: newPoints,
        portfolio: JSON.stringify(portfolio),
        updated_at: new Date().toISOString(),
      }),
    )
    .eq('provider', provider)
    .eq('userId', userId);

  if (updateUserError) {
    return c.json({ error: 'Failed to update user', updateUserError }, 500);
  }

  const { error: updateActivitiesError } = await supabase
    .from('activities')
    .insert(
      activitiesInsertSchema.parse({
        user_address: `${provider}:${userId}`,
        market_address: address,
        outcome_index: position === 'Yes' ? 0 : 1,
        strategy: action,
        tx_hash: `${provider}-${userId}-${action}-${Date.now()}`,
        tx_value: totalValue.toString(),
        asset_ticker: 'USDV',
        market_uri: marketData.ogImageURI,
        market_title: marketData.title,
        chain: marketData.chain,
        chain_id: marketData.chain_id,
        provider: marketData.provider,
      }),
    );

  if (updateActivitiesError) {
    return c.json(
      { error: 'Failed to update activities', updateActivitiesError },
      500,
    );
  }

  return c.json(
    {
      message: `${action.charAt(0).toUpperCase() + action.slice(1)} operation successful`,
      remainingBalance: newBalance > 0 ? newBalance : 0,
      updatedPortfolio: portfolio[address][position]!,
      updatedPoints: newPoints,
    },
    200,
  );
});

export { action };
