import type { Tables } from '@/types/database.types';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { supabase } from '../utils';
import { GAMMA_API_URL } from '../utils/constants';
import {
  CopyPolymarketEventSchema,
  ErrorSchema,
  UnauthorizedResponseSchema,
} from '@/app/schemas';

const polymarket = new OpenAPIHono();

const CopyPolymarketEventResponseSchema = z
  .object({
    statusText: z.string(),
    status: z.number(),
    hint: z.optional(z.nullable(z.string())),
    error: z.nullable(z.string()),
    count: z.nullable(z.number()),
  })
  .openapi('CopyPolymarketEvent');

const route = createRoute({
  method: 'get',
  path: '/copy-event',
  security: [
    {
      bearerAuth: [],
    },
  ],
  request: {
    query: CopyPolymarketEventSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CopyPolymarketEventResponseSchema,
        },
      },
      description: 'Migrate over the market data',
    },
    401: {
      content: {
        'application/json': {
          schema: UnauthorizedResponseSchema,
        },
      },
      description: 'Unauthorized',
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

polymarket.openapi(route, async (c) => {
  const slug = c.req.query('slug');

  try {
    const res = await fetch(`${GAMMA_API_URL}/events?slug=${slug}`);
    const data = (await res.json())[0];

    const event: Omit<Tables<'events'>, 'id'> = {
      createdAt: data.creationDate,
      startDate: data.startDate,
      endDate: data.endDate,
      title: data.title,
      description: data.description,
      slug: data.slug,
      provider: 'polymarket',
      imageUrl: data.image,
      isActive: data.active,
    };

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const markets: Tables<'markets'> = data.markets.map((market: any) => {
      return {
        title: market.question,
        description: market.description,
        imageUrl: market.image,
        eventSlug: slug,
        createdAt: event.createdAt,
      };
    });

    const { error } = await supabase.from('events').upsert(event);

    if (error) {
      console.error('Error copying event', error);
      return c.json({ error: 'Something went wrong' }, 500);
    }

    const result = await supabase.from('markets').upsert(markets);
    const validatedMarketData = CopyPolymarketEventResponseSchema.parse(result);
    return c.json(validatedMarketData, 200);
  } catch (error) {
    return c.json({ error: 'Invalid market data structure' }, 500);
  }
});

export { polymarket };
