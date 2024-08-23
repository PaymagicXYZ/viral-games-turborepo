import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { fetchMarket } from "../utils";

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
  .openapi("Market");

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("Error");

const ParamsSchema = z.object({
  address: z.string().openapi({
    param: {
      name: "address",
      in: "path",
    },
    example: "0x7acf39c4c2762a739deb00db548c766c0080e5fa",
  }),
});

const route = createRoute({
  method: "get",
  path: "/{address}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MarketSchema,
        },
      },
      description: "Retrieve the market data",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Market not found",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Error processing market data",
    },
  },
});

market.openapi(route, async (c) => {
  const { address } = c.req.valid("param");
  const marketData = await fetchMarket(address);

  if (!marketData || Object.keys(marketData).length === 0) {
    return c.json({ error: "Market not found" }, 404);
  }

  try {
    const validatedMarketData = MarketSchema.parse(marketData);
    return c.json(validatedMarketData, 200);
  } catch (error) {
    console.error("Error validating market data:", error);
    return c.json({ error: "Invalid market data structure" }, 500);
  }
});

export { market };
