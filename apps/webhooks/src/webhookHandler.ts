import { Hono, MiddlewareHandler, Context, Env } from "hono";
import { serveStatic } from "hono/serve-static";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Data } from "hono/dist/types/context";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { createClient } from "@supabase/supabase-js";
import { postTweet } from "./postTweet";
import runCronJob from "./replyCronCheck";
import { handleActivity, Activities } from "./points";

import {
  Client,
  executeRuntimeScript,
  setupAnonBrowserWithContext,
} from "@anon/sdk-typescript";
import type { Environment } from "@anon/sdk-typescript";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();
app.use(cors({ origin: "*" }));
app.use(compress());
// app.use(csrf());
app.use(etag());
app.use(logger());

console.log("Starting server initialization...");

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("Supabase client initialized");

// Anon client setup
const ANON_APP_USER_ID = process.env.ANON_APP_USER_ID!;
const ANON_API_KEY = process.env.ANON_API_KEY!;
const ANON_ENV = process.env.ANON_ENV as Environment;
const anonClient = new Client({
  environment: ANON_ENV,
  apiKey: ANON_API_KEY,
});
console.log("Anon client initialized");

const account = {
  app: "twitter",
  userId: ANON_APP_USER_ID,
};

type InsertPayload<T> = {
  type: "INSERT";
  table: string;
  schema: string;
  record: T;
  old_record: null;
};

interface SocialMarket {
  id: number;
  created_at: string;
  provider: "limitless" | "polymarket" | "custom";
  identifier: string;
  postId: string | null;
  last_checked_at: string | null;
}

// Middleware to verify webhook secret
const verifyWebhookSecret: MiddlewareHandler = async (c, next) => {
  const webhookSecret = c.req.header("x-webhook-secret");
  if (webhookSecret !== process.env.WEBHOOK_SECRET) {
    console.log("Unauthorized webhook attempt");
    return c.text("Unauthorized", 401);
  }
  await next();
};

// Webhook handler
app.post("/webhook", verifyWebhookSecret, async (c) => {
  console.log("Webhook received, processing...");
  const payload: InsertPayload<SocialMarket> = await c.req.json();
  console.log("Received webhook payload:", payload);

  if (payload.type !== "INSERT" || payload.table !== "social_markets") {
    console.log("Ignoring non-INSERT or non-social_markets payload");
    return c.text("Ignoring non-INSERT or non-social_markets payload", 200);
  }

  const { provider, identifier } = payload.record;
  console.log("Processing market:", provider, identifier);

  // Fetch market data
  console.log("Fetching market data from backend...");

  const VIRAL_GAMES_API = "https://api.viral.games/api/markets";
  const VIRAL_GAMES_TOKEN = process.env.VIRAL_GAMES_TOKEN!;
  console.log(`${VIRAL_GAMES_API}/${provider}/${identifier}`);
  const marketData = await fetch(
    `${VIRAL_GAMES_API}/${provider}/${identifier}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VIRAL_GAMES_TOKEN}`,
      },
    }
  )
    .then((r) => r.json())
    .catch((e) => {
      console.error("Error fetching market data:", e);
      return null;
    });
  if (!marketData) {
    return c.text("Error fetching market data", 400);
  }
  console.log("Market data fetched successfully:", marketData);

  // Set up browser context
  console.log("Setting up Anon browser context...");
  const { browserContext } = await setupAnonBrowserWithContext(
    anonClient,
    account,
    { type: "managed", input: { proxy: {} } }
  );
  console.log("Browser context set up successfully");

  // Post tweet
  try {
    console.log("Preparing to post tweet...");
    const result = await executeRuntimeScript({
      client: anonClient,
      account,
      target: { browserContext },
      initialUrl: "https://www.x.com",
      cleanupOptions: { closePage: true, closeBrowserContext: true },
      run: postTweet(
        marketData.metadata.title,
        `
Vote 'Yes' 👍 or 'No' in a reply! 👎
Earn rewards either way on Viral.games!`
      ),
    });
    console.log("Tweet posted successfully:", result);

    // Update social_markets table with new postId
    console.log("Updating social_markets table...");
    const { error: updateError } = await supabase
      .from("social_markets")
      .update({
        postId: result.postId,
        last_checked_at: new Date().toISOString(),
      })
      .eq("id", payload.record.id);

    if (updateError) {
      console.error("Error updating social_markets:", updateError);
      return c.text("Error updating social_markets", 500);
    }
    console.log("social_markets table updated successfully");

    return c.json(result);
  } catch (error) {
    console.error("Error posting tweet:", error);
    return c.text("Error posting tweet", 500);
  }
});

app.post("/activities", verifyWebhookSecret, async (c) => {
  console.log("Webhook received, processing...");
  const payload: InsertPayload<Activities> = await c.req.json();
  console.log("Received webhook payload:", payload);

  if (payload.type !== "INSERT" || payload.table !== "activities") {
    console.log("Ignoring non-INSERT or non-activities payload");
    return c.text("Ignoring non-INSERT or non-activities payload", 200);
  }

  handleActivity(payload);
  return c.text("OK");
});
// Health check endpoint
app.get("/health", (c) => c.text("OK"));

app.get("/cron", (c) => {
  console.log("Cron job started");
  try {
    runCronJob();
  } catch (error) {
    console.error("Error starting cron job:", error);
  }
  return c.text("Starting Cron Job");
});

// 404 handler
app.notFound((c) => {
  console.log("Route not found");
  return c.text("Not Found", 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.text("Internal Server Error", 500);
});

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.NODE_ENV === "production"
    ? "https://viral-games-x-post-production.up.railway.app/oauth2callback"
    : "http://localhost:3000/oauth2callback";

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

app.get("/", (c) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.force-ssl"],
  });
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Authenticate with Google</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
          margin-bottom: 1rem;
        }
        .auth-button {
          display: inline-block;
          background-color: #4285F4;
          color: white;
          padding: 0.5rem 1rem;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        .auth-button:hover {
          background-color: #3367D6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Viral.games YouTube markets</h1>
        <a href="${authUrl}" class="auth-button">Authenticate with Google</a>
      </div>
    </body>
    </html>
  `);
});

app.get("/oauth2callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.text("Error: No code provided", 400);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return c.redirect("/comment-form");
  } catch (error) {
    console.error("Error getting tokens:", error);
    return c.text("Error during authentication", 500);
  }
});

app.get("/comment-form", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Post YouTube Comment</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
        }
        .container {
          width: 100%;
          max-width: 500px;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
          margin-bottom: 1rem;
          text-align: center;
        }
        form {
          display: flex;
          flex-direction: column;
        }
        input, textarea {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        button {
          background-color: #4285F4;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #3367D6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Post YouTube Comment</h1>
        <form action="/post-comment" method="post">
          <input type="text" name="videoId" placeholder="YouTube Video ID" required>
          <input type="text" name="marketIdentifier" placeholder="Market Identifier" required>
          <textarea name="comment" placeholder="Your comment" required></textarea>
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post("/post-comment", async (c) => {
  const { videoId, comment, marketIdentifier } = await c.req.parseBody();

  try {
    const response = await youtube.commentThreads.insert({
      part: ["snippet"],
      requestBody: {
        snippet: {
          videoId: videoId as string,
          topLevelComment: {
            snippet: {
              textOriginal: comment as string,
            },
          },
        },
      },
    });

    console.log("Comment posted successfully");
    console.log(response);

    const commentId = response.data.id;

    const { error } = await supabase.from("social_markets_youtube").insert([
      {
        identifier: marketIdentifier,
        video_id: videoId,
        comment_id: commentId,
      },
    ]);

    if (error) {
      throw error;
    }

    const { error: eventError } = await supabase.from("events").insert({
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      slug: marketIdentifier,
      title: `Youtube - ${marketIdentifier}`,
      description: `${comment}`,
      startDate: new Date().toISOString(),
      provider: "custom",
      socialLink: `https://youtube.com/watch?v=${videoId}`,
      imageUrl: `https://youtube.com/watch?v=${videoId}`,
      creator: "youtube",
    });

    if (eventError) {
      throw eventError;
    }
    const { error: marketError } = await supabase.from("markets").insert({
      title: `Youtube - ${marketIdentifier}`,
      description: `${comment}`,
      eventSlug: marketIdentifier,
      imageUrl: `https://youtube.com/watch?v=${videoId}`,
    });

    if (marketError) {
      throw marketError;
    }

    return c.redirect(`/view-replies?commentId=${commentId}`);
  } catch (error) {
    console.error("Error posting comment:", error);
    return c.text("Error posting comment", 500);
  }
});

app.get("/view-replies", async (c) => {
  const commentId = c.req.query("commentId");

  try {
    const response = await youtube.comments.list({
      part: ["snippet"],
      parentId: commentId,
      maxResults: 100,
    });

    const replies = response.data.items;
    console.log(replies);
    let replyList = "";
    if (replies && replies.length > 0) {
      replyList = replies
        .map(
          (reply: any) => `
        <li>
          <strong>${reply.snippet.authorDisplayName}:</strong>
          <p>${reply.snippet.textDisplay}</p>
        </li>
      `
        )
        .join("");
    } else {
      replyList = "<li>No replies yet.</li>";
    }

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>View Replies</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
            background-color: #f0f0f0;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 2rem;
          }
          h1 {
            color: #4285F4;
            margin-bottom: 1rem;
          }
          p {
            margin-bottom: 1rem;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            margin-bottom: 1rem;
            padding: 1rem;
          }
          li strong {
            color: #4285F4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Replies</h1>
          <p>Comment ID: ${commentId}</p>
          <ul>
            ${replyList}
          </ul>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching replies:", error);
    return c.text("Error fetching replies", 500);
  }
});

app.use(
  "/static/*",
  serveStatic({
    root: "./",
    getContent: function (
      path: string,
      c: Context<Env, any, {}>
    ): Promise<Data | Response | null> {
      throw new Error("Function not implemented.");
    },
  })
);

export default app;
