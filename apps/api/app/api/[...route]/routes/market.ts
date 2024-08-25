import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { fetchMarket } from '../utils';
import { FetchMarketSchema } from '@/app/schemas';
import { MarketProviderFactory } from '@/app/services/market/MarketProviderFactory';

const market = new OpenAPIHono();

const MarketSchema = z
  .object({
    address: z.string(),
    title: z.string(),
    ogImageURI: z.string().nullable(),
    chain: z.string(),
    chain_id: z.number(),
    collateralAddress: z.string(),
    provider: z.string(),
  })
  .openapi('Market');

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('Error');

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
          schema: MarketSchema,
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
  // const marketData = await fetchMarket(address);

  if (!provider || !identifier) {
    return c.json({ error: 'Missing provider or marketId parameter' }, 400);
  }

  try {
    const marketProvider = MarketProviderFactory.getProvider(provider);
    const market = await marketProvider.getMarket(identifier);
    console.log('market', market);
    return c.json(market);
  } catch (error) {
    console.error('Error validating market data:', error);
    return c.json({ error: 'Invalid market data structure' }, 500);
  }
});

export { market };
