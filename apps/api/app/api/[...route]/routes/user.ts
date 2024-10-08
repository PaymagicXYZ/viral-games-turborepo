import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { supabase, initUser, getUser } from '../utils';
import { tempPlayerRowSchema } from '@/types/schemas';

const user = new OpenAPIHono();

const UserSchema = tempPlayerRowSchema.openapi('User');

const PositionSchema = z.object({
  marketId: z.string(),
  outcomeIndex: z.number(),
  shares: z.number(),
  title: z.string(),
});

const SinglePortfolioSchema = z.object({
  positions: z.array(PositionSchema),
});

const PortfolioPositionSchema = z
  .record(z.string(), z.array(PositionSchema))
  .openapi('PortfolioPosition');

const PortfolioSchema = z
  .object({
    positions: PortfolioPositionSchema.nullable(),
  })
  .openapi('Portfolio');

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('Error');

const UserParamsSchema = z.object({
  provider: z.string().openapi({
    param: {
      name: 'provider',
      in: 'path',
    },
    example: 'twitter',
  }),
  userId: z.string().openapi({
    param: {
      name: 'userId',
      in: 'path',
    },
    example: 'elonmusk',
  }),
});

const userRoute = createRoute({
  method: 'get',
  path: '/{provider}/{userId}',
  request: {
    params: UserParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'Retrieve the user data',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'User not found',
    },
  },
});

user.openapi(userRoute, async (c) => {
  const { provider, userId } = c.req.valid('param');
  const userData = await initUser(provider, userId);

  if (!userData) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(userData, 200);
});

const portfolioRoute = createRoute({
  method: 'get',
  path: '/{provider}/{userId}/portfolio',
  request: {
    params: UserParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PortfolioSchema,
        },
      },
      description: "Retrieve the user's portfolio",
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
      description: 'Error processing portfolio data',
    },
  },
});

user.openapi(portfolioRoute, async (c) => {
  const { provider, userId } = c.req.valid('param');

  const normalizedUserId = provider === 'eoa' ? userId.toLowerCase() : userId;
  const userData = await getUser({
    provider,
    userId: normalizedUserId,
  });
  console.log('userData', userData);
  if (!userData) {
    return c.json({ error: 'User not found' }, 404);
  }

  const { data, error } = await supabase
    .from('market_positions')
    .select('*')
    .eq('userId', userData.uuid);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  if (!data?.length) {
    return c.json(
      {
        positions: null,
      },
      200,
    );
  }

  try {
    const transformedPositions = data.reduce(
      (acc, position) => {
        if (position.eventId in acc) {
          acc[position.eventId].push(
            PositionSchema.parse({
              marketId: position.marketId,
              outcomeIndex: +position.position,
              shares: position.shares,
              title: position.title,
            }),
          );
        } else {
          acc[position.eventId] = [
            PositionSchema.parse({
              marketId: position.marketId,
              outcomeIndex: +position.position,
              shares: position.shares,
              title: position.title,
            }),
          ];
        }

        return acc;
      },
      {} as Record<string, Array<typeof PositionSchema._type>>,
    );
    // const transformedPositions = data.map((position) =>
    //   PortfolioPositionSchema.parse({
    //     [position.eventId!]: {
    //       marketId: position.marketId,
    //       outcomeIndex: +position.position,
    //       shares: position.shares,
    //     },
    //   }),
    // );

    return c.json(
      PortfolioSchema.parse({
        positions: transformedPositions,
      }),
      200,
    );
  } catch (e) {
    console.error('Error parsing or transforming portfolio data:', e);
    return c.json({ error: 'Error processing portfolio data' }, 500);
  }
});

const MarketParamsSchema = z.object({
  provider: z.string().openapi({
    param: {
      name: 'provider',
      in: 'path',
    },
    example: 'twitter',
  }),
  userId: z.string().openapi({
    param: {
      name: 'userId',
      in: 'path',
    },
    example: '123456789',
  }),
  eventId: z.string().openapi({
    param: {
      name: 'eventId',
      in: 'path',
    },
    example: '0x1234567890123456789012345678901234567890',
  }),
});

const marketPortfolioRoute = createRoute({
  method: 'get',
  path: '/{provider}/{userId}/{eventId}',
  request: {
    params: MarketParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SinglePortfolioSchema,
        },
      },
      description: "Retrieve the user's portfolio for a specific market",
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
      description: 'Error processing portfolio data',
    },
  },
});

user.openapi(marketPortfolioRoute, async (c) => {
  const { provider, userId, eventId } = c.req.valid('param');
  const normalizedUserId = provider === 'eoa' ? userId.toLowerCase() : userId;

  const userData = await getUser({
    provider,
    userId: normalizedUserId,
  });
  console.log('userData', userData);
  if (!userData) {
    return c.json({ error: 'User not found' }, 404);
  }

  const { data, error } = await supabase
    .from('market_positions')
    .select('*')
    .eq('userId', userData.uuid)
    .eq('eventId', eventId);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  if (!data?.length) {
    return c.json(
      {
        positions: [],
      },
      200,
    );
  }

  const positions = data.map((position) =>
    PositionSchema.parse({
      marketId: position.marketId,
      outcomeIndex: +position.position,
      shares: position.shares,
      title: position.title,
    }),
  );

  return c.json(
    {
      positions,
    },
    200,
  );
});

export { user };
