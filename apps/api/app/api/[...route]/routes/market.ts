import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import {
  FetchMarketSchema,
  FetchMarketsSchema,
  MarketsWithMetadataSchema,
  PaginatedMarketResponseSchema,
} from '@/app/schemas';
import { MarketProviderFactory } from '@/app/services/market/MarketProviderFactory';
import { AggregateMarketService } from '@/app/services/market/AggregateMarketService';

const aggregateMarketService = new AggregateMarketService();
const market = new OpenAPIHono();

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('Error');

const allRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: FetchMarketsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PaginatedMarketResponseSchema,
        },
      },
      description: 'Retrieve the market data',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Market not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Error processing market data',
    },
  },
});

const route = createRoute({
  method: 'get',
  path: '/{provider}/{identifier}',
  request: {
    params: FetchMarketSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MarketsWithMetadataSchema,
        },
      },
      description: 'Retrieve the market data',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Market not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Error processing market data',
    },
  },
});

market.openapi(route, async (c) => {
  const { identifier, provider } = c.req.valid('param');

  if (!provider || !identifier) {
    return c.json({ error: 'Missing provider or marketId parameter' }, 404);
  }

  try {
    const marketProvider = MarketProviderFactory.getProvider(provider);
    const market = await marketProvider.getMarket(identifier);
    const validatedMarketData = MarketsWithMetadataSchema.parse(market);

    return c.json(validatedMarketData, 200);
  } catch (error) {
    console.error('Error validating market data:', error);
    return c.json({ error: 'Invalid market data structure' }, 500);
  }
});

market.openapi(allRoute, async (c) => {
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const cursor = c.req.query('cursor');

  try {
    const response = await aggregateMarketService.getAggregatedMarkets(
      limit,
      cursor,
    );
    const validatedMarketData = PaginatedMarketResponseSchema.parse(response);
    console.log("validatedMarketData", validatedMarketData)
    return c.json(validatedMarketData, 200);
  } catch (error) {
    console.error('Error validating market data:', error);
    return c.json({ error: 'Invalid market data structure' }, 500);
  }
});

export { market };
