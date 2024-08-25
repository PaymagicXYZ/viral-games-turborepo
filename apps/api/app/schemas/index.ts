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
