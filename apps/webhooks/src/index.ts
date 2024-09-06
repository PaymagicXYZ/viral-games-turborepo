import { serve } from "@hono/node-server";
import app from "./webhookHandler";

const HOST = process.env.NODE_ENV !== "production" ? "127.0.0.1" : "0.0.0.0";

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
    hostname: HOST,
  },
  ({ address, port }) => {
    console.log(
      `🚀 (${process.env.NODE_ENV}) listening at http://${address}:${port}`
    );
  }
);
