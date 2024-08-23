import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { supabase, initUser, fetchMarket, calculateShares } from "../utils";
import {
  jsonSchema,
  activitiesInsertSchema,
  tempPlayerUpdateSchema,
} from "@/types/schemas";

const buy = new OpenAPIHono();

const BuySchema = z
  .object({
    provider: z.string(),
    userId: z.string(),
    address: z.string(),
    amount: z.number(),
    position: z.enum(["Yes", "No"]),
  })
  .openapi("Buy");

const BuyResponseSchema = z
  .object({
    message: z.string(),
    remainingBalance: z.number(),
    updatedPortfolio: z.object({
      shares: z.number(),
    }),
    updatedPoints: z.number(),
  })
  .openapi("BuyResponse");

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("Error");

type Portfolio = {
  [address: string]: {
    Yes?: { shares: number };
    No?: { shares: number };
  };
};

const route = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: BuySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: BuyResponseSchema,
        },
      },
      description: "Buy action processed successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Bad request",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "User not found",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Server error",
    },
  },
});

buy.openapi(route, async (c) => {
  const body = c.req.valid("json");
  const { provider, userId, address, amount, position } = body;

  const userData = await initUser(provider, userId);
  if (!userData) {
    return c.json({ error: "User not found" }, 404);
  }

  if (userData.balance + userData.points < amount) {
    return c.json({ error: "Insufficient balance" }, 400);
  }

  const marketData = await fetchMarket(address);
  if (!marketData) {
    return c.json({ error: "Invalid market input" }, 400);
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

  const balanceUsed = Math.min(amount, userData.balance);
  const pointsUsed = amount - balanceUsed;

  const newBalance = userData.balance - balanceUsed;
  const newPoints = userData.points - pointsUsed;
  const shares = await calculateShares(
    address,
    amount,
    position,
    marketData.collateralAddress,
    marketData.chain
  );

  portfolio[address][position]!.shares += shares;

  const { error: updateUserError } = await supabase
    .from("temp_player")
    .update(
      tempPlayerUpdateSchema.parse({
        balance: newBalance,
        points: newPoints,
        portfolio: JSON.stringify(portfolio),
        updated_at: new Date().toISOString(),
      })
    )
    .eq("provider", provider)
    .eq("userId", userId);

  if (updateUserError) {
    return c.json({ error: "Failed to update user", updateUserError }, 500);
  }

  const { error: updateActivitiesError } = await supabase
    .from("activities")
    .insert(
      activitiesInsertSchema.parse({
        user_address: `${provider}:${userId}`,
        market_address: address,
        outcome_index: position === "Yes" ? 0 : 1,
        strategy: "buy",
        tx_hash: `${provider}-${userId}-buy-${Date.now()}`,
        tx_value: amount.toString(),
        asset_ticker: "USDV",
        market_uri: marketData.ogImageURI,
        market_title: marketData.title,
        chain: marketData.chain,
        chain_id: marketData.chain_id,
        provider: marketData.provider,
      })
    );

  if (updateActivitiesError) {
    return c.json(
      { error: "Failed to update activities", updateActivitiesError },
      500
    );
  }

  return c.json(
    {
      message: "Buy operation successful",
      remainingBalance: newBalance,
      updatedPortfolio: portfolio[address][position]!,
      updatedPoints: newPoints,
    },
    200
  );
});

export { buy };
