import type { Page } from "playwright-core";
import { NetworkHelper } from "@anon/actions";
import dotenv from "dotenv";
dotenv.config();

export const postTweet =
  (title: string, text: string) => async (page: Page) => {
    const networkHelper = new NetworkHelper(
      Number(process.env.NETWORK_TIMEOUT_MS) || 5000
    );
    await networkHelper.waitForPageLoad(page);
    await networkHelper.waitForNetworkIdle(page);

    // Navigate to the tweet composition page
    await page.goto("https://x.com/compose/post");
    console.log("Navigated to tweet composition page");

    // Wait for the tweet textarea to be visible
    const tweetTextarea = await page.waitForSelector(
      'div[data-testid="tweetTextarea_0"]'
    );
    if (!tweetTextarea) throw new Error("Tweet textarea not found");

    // Compose the tweet content
    const fullText = `${title}\n\n${text}`;
    await tweetTextarea.fill(fullText);

    // Click the tweet button
    await page.click('button[data-testid="tweetButton"]');
    console.log("Clicked tweet button");

    // Wait for any element containing the text "View" to appear
    const viewElement = await page.waitForSelector('text="View"', {
      state: "visible",
      timeout: 10000,
    });
    if (!viewElement) throw new Error("View element not found");

    console.log("Found View element");

    // Set up a listener for navigation events
    const navigationPromise = page.waitForNavigation();

    // Click the element containing "View"
    await viewElement.click();
    console.log("Clicked View element");

    // Wait for navigation to complete
    await navigationPromise;
    console.log("Navigation completed");

    // Get the current URL immediately after navigation
    const tweetUrl = page.url();
    console.log(`Current URL after navigation: ${tweetUrl}`);

    // Extract the tweet ID from the URL
    const tweetId = tweetUrl.split("/").pop();
    if (!tweetId) throw new Error("Failed to extract tweet ID");

    console.log(`Tweet posted successfully. ID: ${tweetId}, URL: ${tweetUrl}`);

    return {
      postId: tweetId,
      tweetUrl: tweetUrl,
    };
  };
