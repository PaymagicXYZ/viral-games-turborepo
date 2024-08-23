import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { supabase, initUser } from "../utils";
import { tempPlayerRowSchema, jsonSchema } from "@/types/schemas";

const user = new OpenAPIHono();

const UserSchema = tempPlayerRowSchema.openapi("User");

const PortfolioPositionSchema = z
  .object({
    market_address: z.string(),
    outcome_index: z.number(),
    shares: z.number(),
  })
  .openapi("PortfolioPosition");

const PortfolioSchema = z
  .object({
    userId: z.string(),
    positions: z.array(PortfolioPositionSchema),
  })
  .openapi("Portfolio");

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("Error");

const UserParamsSchema = z.object({
  provider: z.string().openapi({
    param: {
      name: "provider",
      in: "path",
    },
    example: "twitter",
  }),
  userId: z.string().openapi({
    param: {
      name: "userId",
      in: "path",
    },
    example: "elonmusk",
  }),
});

const userRoute = createRoute({
  method: "get",
  path: "/{provider}/{userId}",
  request: {
    params: UserParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Retrieve the user data",
    },
  },
});

user.openapi(userRoute, async (c) => {
  const { provider, userId } = c.req.valid("param");
  console.log(provider, userId);
  const userData = await initUser(provider, userId);

  return c.json(userData, 200);
});

const portfolioRoute = createRoute({
  method: "get",
  path: "/{provider}/{userId}/portfolio",
  request: {
    params: UserParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PortfolioSchema,
        },
      },
      description: "Retrieve the user's portfolio",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Error processing portfolio data",
    },
  },
});

user.openapi(portfolioRoute, async (c) => {
  const { provider, userId } = c.req.valid("param");

  const { data, error } = await supabase
    .from("temp_player")
    .select("portfolio, userId")
    .eq("provider", provider)
    .eq("userId", userId)
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  if (!data || !data.portfolio) {
    return c.json(
      {
        userId: userId,
        positions: [],
      },
      200
    );
  }

  try {
    const portfolioData = jsonSchema.parse(data.portfolio) as Record<
      string,
      { Yes?: { shares: number }; No?: { shares: number } }
    >;

    const transformedPositions = Object.entries(portfolioData).flatMap(
      ([marketAddress, positions]) => {
        const result = [];
        if (positions.Yes && positions.Yes.shares > 0) {
          result.push({
            market_address: marketAddress,
            outcome_index: 0,
            shares: positions.Yes.shares,
          });
        }
        if (positions.No && positions.No.shares > 0) {
          result.push({
            market_address: marketAddress,
            outcome_index: 1,
            shares: positions.No.shares,
          });
        }
        return result;
      }
    );

    return c.json(
      {
        userId: data.userId,
        positions: transformedPositions,
      },
      200
    );
  } catch (e) {
    console.error("Error parsing or transforming portfolio data:", e);
    return c.json({ error: "Error processing portfolio data" }, 500);
  }
});

const MarketParamsSchema = z.object({
  provider: z.string().openapi({
    param: {
      name: "provider",
      in: "path",
    },
    example: "twitter",
  }),
  userId: z.string().openapi({
    param: {
      name: "userId",
      in: "path",
    },
    example: "123456789",
  }),
  marketAddress: z.string().openapi({
    param: {
      name: "marketAddress",
      in: "path",
    },
    example: "0x1234567890123456789012345678901234567890",
  }),
});

const marketPortfolioRoute = createRoute({
  method: "get",
  path: "/{provider}/{userId}/{marketAddress}",
  request: {
    params: MarketParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PortfolioSchema,
        },
      },
      description: "Retrieve the user's portfolio for a specific market",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Error processing portfolio data",
    },
  },
});

user.openapi(marketPortfolioRoute, async (c) => {
  const { provider, userId, marketAddress } = c.req.valid("param");

  const { data, error } = await supabase
    .from("temp_player")
    .select("portfolio, userId")
    .eq("provider", provider)
    .eq("userId", userId)
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  let portfolioData = {} as Record<
    string,
    { Yes?: { shares: number }; No?: { shares: number } }
  >;
  if (data && data.portfolio) {
    try {
      portfolioData = jsonSchema.parse(data.portfolio) as Record<
        string,
        { Yes?: { shares: number }; No?: { shares: number } }
      >;
    } catch (e) {
      console.error("Error parsing portfolio data:", e);
      return c.json({ error: "Error parsing portfolio data" }, 500);
    }
  }

  const marketData = portfolioData[marketAddress] || {};

  const positions = [
    {
      outcome_index: 0,
      shares: marketData.Yes?.shares || 0,
      market_address: marketAddress,
    },
    {
      outcome_index: 1,
      shares: marketData.No?.shares || 0,
      market_address: marketAddress,
    },
  ].filter((position) => position.shares > 0);

  return c.json(
    {
      userId: data?.userId || userId,
      positions,
    },
    200
  );
});

export { user };
