import { createClient } from "@supabase/supabase-js";
import {
  Client,
  executeRuntimeScript,
  setupAnonBrowserWithContext,
} from "@anon/sdk-typescript";
import type { Environment } from "@anon/sdk-typescript";
import fetch from "node-fetch";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

console.log("Starting cron job initialization...");

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

const VIRAL_GAMES_API = "https://api.viral.games/api/buy";
const VIRAL_GAMES_TOKEN = process.env.VIRAL_GAMES_TOKEN!;

async function processReplies(
  postId: string,
  provider: string,
  identifier: string,
  lastCheckedAt: string
) {
  console.log(
    `Processing replies for postId: ${postId}, market: ${provider}: ${identifier}`
  );

  const { browserContext } = await setupAnonBrowserWithContext(
    anonClient,
    account,
    { type: "managed", input: { proxy: {} } }
  );
  console.log("Browser context set up successfully");

  try {
    const initialUrl = `https://x.com/DeFiWhale/status/${postId}`;
    const replies = await executeRuntimeScript({
      client: anonClient,
      account,
      target: { browserContext },
      initialUrl,
      cleanupOptions: { closePage: true, closeBrowserContext: true },
      run: async (page) => {
        console.log("Navigating to tweet page" + page.url());
        await page.waitForSelector('[data-testid="tweet"]', { timeout: 30000 });
        console.log("Tweet page loaded");

        const replies = await page.$$eval(
          '[aria-label="Timeline: Conversation"] article[data-testid="tweet"]',
          (tweets, lastCheckedAt) => {
            return tweets
              .map((tweet) => {
                const userNameDiv = tweet.querySelector(
                  '[data-testid="User-Name"]'
                );
                const userId = userNameDiv
                  ? userNameDiv
                      .querySelector("a")
                      ?.getAttribute("href")
                      ?.replace("/", "")
                  : null;
                const avatarDiv = tweet.querySelector(
                  '[data-testid="Tweet-User-Avatar"]'
                );
                const avatar = avatarDiv
                  ? avatarDiv.querySelector("img")?.getAttribute("src")
                  : null;
                const twitterId = avatar ? avatar.split("/")[4] : userId;
                const timeElement = tweet.querySelector("time");
                const tweetTime = timeElement
                  ? new Date(
                      timeElement.getAttribute("datetime") ?? ""
                    ).getTime()
                  : 0;
                const lastCheckedTime = new Date(lastCheckedAt).getTime();

                if (tweetTime > lastCheckedTime) {
                  return {
                    userId,
                    text: tweet.querySelector('[data-testid="tweetText"]')
                      ?.textContent,
                    avatar,
                    twitterId,
                    time: tweetTime,
                  };
                }
                return null;
              })
              .filter((reply) => reply !== null);
          },
          lastCheckedAt
        );

        console.log(`Found ${replies.length} new replies since last check`);
        return replies.slice(1);
      },
    });

    for (const reply of replies) {
      console.log(`Processing reply from ${reply.userId}`);
      const position = reply.text?.toLowerCase().includes("yes")
        ? "Yes"
        : reply.text?.toLowerCase().includes("no")
        ? "No"
        : null;

      if (position) {
        console.log(`Valid vote found: ${position} from ${reply.userId}`);
        const body = {
          socialProvider: "twitter",
          provider,
          userId: reply.userId,
          marketId: identifier,
          eventId: identifier,
          amount: 10,
          position,
          pfp: reply.avatar,
        };

        console.log(`Sending request to Viral Games API for ${reply.userId}`);
        const response = await fetch(VIRAL_GAMES_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${VIRAL_GAMES_TOKEN}`,
          },
          body: JSON.stringify(body),
        });
        console.log(response);

        if (response.ok) {
          console.log(`Successfully processed vote for ${reply.userId}`);
        } else {
          console.error(
            `Error processing vote for ${reply.userId}:`,
            await response.text()
          );
        }
      } else {
        console.log(`No valid vote found in reply from ${reply.userId}`);
      }
    }

    return new Date().toISOString();
  } catch (error) {
    console.error("Error processing replies:", error);
    throw error;
  }
}

async function processYoutubeReplies(
  commentId: string,
  identifier: string,
  lastCheckedAt: string
) {
  console.log(
    `Processing replies for commentId: ${commentId}, market: ${identifier}`
  );
  const youtube = google.youtube({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY,
  });

  async function getYouTubeComments(commentId: string) {
    try {
      const response = await youtube.comments.list({
        part: ["snippet"],
        parentId: commentId,
        maxResults: 100,
      });

      return response.data.items;
    } catch (error) {
      console.error("Error fetching YouTube comments:", error);
      throw error;
    }
  }

  let replies = await getYouTubeComments(commentId);
  if (replies && replies.length > 0) {
    replies = replies
      .filter(
        (reply) =>
          reply.snippet &&
          reply.snippet.textDisplay &&
          reply.snippet.publishedAt
      )
      .filter((reply) => {
        if (reply.snippet && reply.snippet.publishedAt) {
          return (
            new Date(reply.snippet.publishedAt).getTime() >
            new Date(lastCheckedAt).getTime()
          );
        }
        return false;
      });
    console.log(`Found ${replies.length} new replies since last check`);

    for (const reply of replies) {
      if (reply.snippet && reply.snippet.textDisplay) {
        const position = reply.snippet.textDisplay.toLowerCase().includes("yes")
          ? "Yes"
          : reply.snippet.textDisplay.toLowerCase().includes("no")
          ? "No"
          : null;
        if (position) {
          console.log(
            `Valid vote found: ${position} from ${reply.snippet.authorDisplayName}`
          );

          const body = {
            socialProvider: "youtube",
            provider: "custom",
            userId: reply.snippet.authorDisplayName,
            marketId: identifier,
            eventId: identifier,
            amount: 10,
            position,
            pfp: reply.snippet.authorProfileImageUrl,
            username: reply.snippet.authorDisplayName,
          };

          const response = await fetch(VIRAL_GAMES_API, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${VIRAL_GAMES_TOKEN}`,
            },
            body: JSON.stringify(body),
          });
          console.log(response);
          if (response.ok) {
            console.log(
              `Successfully processed vote for ${reply.snippet.authorDisplayName}`
            );
          } else {
            console.error(
              `Error processing vote for ${reply.snippet.authorDisplayName}:`,
              await response.text()
            );
          }
        }
      }
    }

    return new Date().toISOString();
  }
}
async function runCronJob() {
  console.log("Starting cron job execution");

  const { data: markets, error } = await supabase
    .from("social_markets")
    .select("provider, identifier, postId, last_checked_at");

  const { data: youtubeMarkets, error: youtubeError } = await supabase
    .from("social_markets_youtube")
    .select("identifier, comment_id, last_checked_at");

  if (error || youtubeError) {
    console.error("Error fetching markets:", error, youtubeError);
    return;
  }

  console.log(`Found ${markets.length} twitter markets to process`);

  for (const { provider, identifier, postId, last_checked_at } of markets) {
    const market = `${provider}:${identifier}`;
    if (postId) {
      console.log(
        `Processing market: ${provider} ${identifier}, postId: ${postId}, last checked at: ${last_checked_at}`
      );
      try {
        const newLastCheckedAt = await processReplies(
          postId,
          provider,
          identifier,
          last_checked_at || new Date(0).toISOString()
        );

        const { error: updateError } = await supabase
          .from("social_markets")
          .update({ last_checked_at: newLastCheckedAt })
          .eq("provider", provider)
          .eq("identifier", identifier);

        if (updateError) {
          console.error(
            `Error updating last_checked_at for market ${market}:`,
            updateError
          );
        } else {
          console.log(
            `Updated last_checked_at for market ${market} to ${newLastCheckedAt}`
          );
        }
      } catch (error) {
        console.error(`Error processing replies for market ${market}:`, error);
      }
    } else {
      console.log(`Skipping market ${market} due to missing postId`);
    }
  }

  console.log("Finished processing twitter markets");

  console.log(`Found ${youtubeMarkets.length} youtube markets to process`);
  for (const { identifier, comment_id, last_checked_at } of youtubeMarkets) {
    const market = `youtube:${identifier}`;
    if (comment_id) {
      console.log(
        `Processing market: ${market}, comment_id: ${comment_id}, last checked at: ${last_checked_at}`
      );
      try {
        const newLastCheckedAt = await processYoutubeReplies(
          comment_id,
          identifier,
          last_checked_at || new Date(0).toISOString()
        );

        const { error: updateError } = await supabase
          .from("social_markets_youtube")
          .update({ last_checked_at: newLastCheckedAt })
          .eq("identifier", identifier);

        if (updateError) {
          console.error(
            `Error updating last_checked_at for market ${market}:`,
            updateError
          );
        } else {
          console.log(
            `Updated last_checked_at for market ${market} to ${newLastCheckedAt}`
          );
        }
      } catch (error) {
        console.error(`Error processing replies for market ${market}:`, error);
      }
    }
  }

  console.log("Cron job execution completed");
}
export default runCronJob;
