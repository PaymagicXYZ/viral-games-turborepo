import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { supabase, initUser, fetchMarket, calculateShares } from '../utils';
import {
  jsonSchema,
  activitiesInsertSchema,
  tempPlayerUpdateSchema,
} from '@/types/schemas';
import { MarketProviderFactory } from '@/app/services/market/MarketProviderFactory';

const buy = new OpenAPIHono();

const BuySchema = z
  .object({
    socialProvider: z.string(),
    provider: z.string(),
    userId: z.string(),
    marketId: z.string(),
    amount: z.number(),
    position: z.enum(['Yes', 'No']),
  })
  .openapi('Buy');

const BuyResponseSchema = z
  .object({
    message: z.string(),
    remainingBalance: z.number(),
    updatedPortfolio: z.object({
      shares: z.number(),
    }),
    updatedPoints: z.number(),
  })
  .openapi('BuyResponse');

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
          schema: BuySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: BuyResponseSchema,
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

buy.openapi(route, async (c) => {
  const body = c.req.valid('json');
  const { provider, userId, marketId, amount, position, socialProvider } = body;

  const userData = await initUser(socialProvider, userId);
  console.log("userData", userData);
  if (!userData) {
    return c.json({ error: 'User not found' }, 404);
  }

  if (userData.balance + userData.points < amount) {
    return c.json({ error: 'Insufficient balance' }, 400);
  }

  const marketProvider = MarketProviderFactory.getProvider(provider);
  const markets = await marketProvider.getMarket(marketId);
  const marketData = markets?.data?.[0];
  // const marketData = await fetchMarket(address);
  if (!marketData) {
    return c.json({ error: 'Invalid market input' }, 400);
  }

  let portfolio: Portfolio = userData.portfolio
    ? (jsonSchema.parse(userData.portfolio) as Portfolio)
    : {};

  if (!portfolio[marketId]) {
    portfolio[marketId] = {};
  }

  if (!portfolio[marketId][position]) {
    portfolio[marketId][position] = { shares: 0 };
  }

  const balanceUsed = Math.min(amount, userData.balance);
  const pointsUsed = amount - balanceUsed;

  const newBalance = userData.balance - balanceUsed;
  const newPoints = userData.points - pointsUsed;
  const shares = await calculateShares(
    marketData,
    amount,
    position,
    // marketData.chain,
  );

  portfolio[marketId][position]!.shares += shares;

  const { error: updateUserError } = await supabase
    .from('temp_player')
    .update(
      tempPlayerUpdateSchema.parse({
        balance: newBalance,
        points: newPoints,
        portfolio: JSON.stringify(portfolio),
        updated_at: new Date().toISOString(),
      }),
    )
    .eq('provider', socialProvider)
    .eq('userId', userId);

  if (updateUserError) {
    return c.json({ error: 'Failed to update user', updateUserError }, 500);
  }

  const { error: updateActivitiesError } = await supabase
    .from('activities')
    .insert(
      activitiesInsertSchema.parse({
        user_address: `${socialProvider}:${userId}`,
        market_address: marketId,
        outcome_index: position === 'Yes' ? 0 : 1,
        strategy: 'buy',
        tx_hash: `${socialProvider}-${userId}-buy-${Date.now()}`,
        tx_value: amount.toString(),
        asset_ticker: 'USDV',
        market_uri: marketData.ogImageURI,
        market_title: marketData.title,
        chain: marketData.chainId === 8453 ? "base" : "polygon", // TODO: Update this to use the chain name
        chain_id: marketData.chainId,
        provider: markets.metadata?.provider,
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
      message: 'Buy operation successful',
      remainingBalance: newBalance,
      updatedPortfolio: portfolio[marketId][position]!,
      updatedPoints: newPoints,
    },
    200,
  );
});

export { buy };
