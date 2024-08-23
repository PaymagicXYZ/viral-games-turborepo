import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { supabase } from "../utils";
import { tempPlayerUpdateSchema } from "@/types/schemas";

const resetBalance = new OpenAPIHono();

const ResetBalanceResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("ResetBalanceResponse");

const UnauthorizedResponseSchema = z
  .object({
    success: z.boolean(),
  })
  .openapi("UnauthorizedResponse");

const ErrorResponseSchema = z
  .object({
    error: z.string(),
    details: z.unknown(),
  })
  .openapi("ErrorResponse");

const route = createRoute({
  method: "get",
  path: "/",
  security: [
    {
      bearerAuth: [],
    },
  ],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResetBalanceResponseSchema,
        },
      },
      description: "Balance reset successful",
    },
    401: {
      content: {
        "application/json": {
          schema: UnauthorizedResponseSchema,
        },
      },
      description: "Unauthorized",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Server error",
    },
  },
});

resetBalance.openapi(route, async (c) => {
  const authHeader = c.req.header("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return c.json({ success: false }, 401);
  }

  try {
    const { error } = await supabase
      .from("temp_player")
      .update(
        tempPlayerUpdateSchema.parse({
          balance: 100,
          updated_at: new Date().toISOString(),
        })
      )
      .eq("claimed", false);

    if (error) throw error;

    return c.json({ message: "Balance reset successful" }, 200);
  } catch (error) {
    return c.json({ error: "Failed to reset balance", details: error }, 500);
  }
});

export { resetBalance };
