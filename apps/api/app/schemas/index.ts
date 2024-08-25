import { z } from '@hono/zod-openapi';

export const UnauthorizedResponseSchema = z
  .object({
    success: z.boolean(),
  })
  .openapi('UnauthorizedResponse');

export const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('Error');

export const CopyPolymarketEventSchema = z.object({
  slug: z.string().openapi({
    param: {
      name: 'slug',
      in: 'query',
    },
    example: 'will-kamala-go-on-snl',
  }),
});

export const FetchMarketsSchema = z.object({
  limit: z.string().openapi({
    param: {
      name: 'limit',
      in: 'query',
    },
    example: '10',
  }),
  offset: z.string().openapi({
    param: {
      name: 'offset',
      in: 'query',
    },
    example: '0',
  }),
});

export const FetchMarketSchema = z.object({
  provider: z.string().openapi({
    param: {
      name: 'provider',
      in: 'path',
    },
    example: 'polymarket',
  }),
  identifier: z.string().openapi({
    param: {
      name: 'identifier',
      in: 'path',
    },
    example: 'will-kamala-go-on-snl',
  }),
});

const MarketMetadataSchema = z.object({
  address: z.string().nullable(),
  created_at: z.string().nullable(),
  image_uri: z.string().nullable(),
  provider: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  title: z.string().nullable(),
});

const CreatorSchema = z.object({
  name: z.string(),
  imageURI: z.string().optional(),
  link: z.string().optional(),
  address: z.string().optional(),
});

const CollateralTokenSchema = z.object({
  address: z.string(),
  decimals: z.number(),
  symbol: z.string(),
});

const MarketSchema = z.object({
  id: z.string(),
  conditionId: z.string(),
  description: z.string(),
  collateralToken: CollateralTokenSchema,
  title: z.string(),
  ogImageURI: z.string().nullable(),
  expirationDate: z.string(),
  expirationTimestamp: z.number(),
  winningOutcomeIndex: z.number().nullable(),
  expired: z.boolean(),
  tags: z.array(z.string()),
  volumeFormatted: z.string(),
  liquidity: z.string(),
  liquidityFormatted: z.string(),
  outcomePrices: z.array(z.string()),
  group: z
    .object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
    })
    .optional(),
  creator: CreatorSchema,
});

export const SupabaseMarketSchema = z.object({
  createdAt: z.string(),
  description: z.string(),
  eventSlug: z.string().nullable(),
  id: z.number(),
  imageUrl: z.string().nullable(),
  title: z.string(),
});

export const MarketsWithMetadataSchema = z
  .object({
    data: z.array(MarketSchema),
    metadata: MarketMetadataSchema.nullable(),
  })
  .openapi('MarketWithMetadata');

const MarketGroupCardResponseSchema = z.object({
  slug: z.string(),
  title: z.string(),
  createdAt: z.string(),
  deadline: z.string(),
  category: z.string(),
  collateralToken: CollateralTokenSchema,
  markets: z.array(SupabaseMarketSchema),
});

export const PaginatedMarketResponseSchema = z.object({
  markets: z.array(MarketGroupCardResponseSchema),
  offset: z.string().nullable(),
});
