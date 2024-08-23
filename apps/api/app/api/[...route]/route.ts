import { OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { handle } from "hono/vercel";
import { user } from "./routes/user";
import { market } from "./routes/market";
import { action } from "./routes/action";
import { buy } from "./routes/buy";
import { resetBalance } from "./routes/resetBalance";

export const runtime = "edge";

const app = new OpenAPIHono();
const token = process.env.TOKEN!;

app.use(logger());

app.use("/api/user/*", bearerAuth({ token }), cors());
app.use("/api/actions", bearerAuth({ token }), cors());
app.use("/api/buy", bearerAuth({ token }), cors());

app.route("/api/user", user);
app.route("/api/market", market);
app.route("/api/actions", action);
app.route("/api/reset-balance", resetBalance);
app.route("/api/buy", buy);

app.doc("/api/doc", {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
  },
});

export const GET = handle(app);
export const POST = handle(app);
