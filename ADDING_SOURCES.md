# How to Add a New Data Source to NewsNow

This document outlines the steps required to integrate a new data source into the NewsNow project.

## Prerequisites

*   Basic understanding of TypeScript and asynchronous programming (`async`/`await`).
*   Familiarity with fetching data from web pages or APIs.
*   Knowledge of HTML parsing (using libraries like `cheerio`) if scraping websites directly.
*   Understanding of RSS/Atom feeds if integrating an existing feed.

## Steps

### 1. Create the Source File

*   Navigate to the `server/sources/` directory.
*   Create a new TypeScript file for your source. Use a descriptive, lowercase name matching the source's identifier (e.g., `my-cool-news.ts`).
*   Use the `defineSource` utility to wrap your data fetching logic.

    ```typescript
    // server/sources/my-cool-news.ts
    import type { NewsItem } from "@shared/types"
    import { defineSource } from "../utils/source"
    import { myFetch } from "../utils/fetch"
    // Import other necessary libraries like cheerio if scraping
    // import * as cheerio from "cheerio";

    export default defineSource(async () => {
      // Your data fetching and processing logic goes here
      const news: NewsItem[] = []

      // Example: Fetching and processing logic (replace with actual implementation)
      // const response = await myFetch("https://my-cool-news.com/api/latest");
      // const data = await response.json(); // Or parse HTML, etc.
      // news = data.articles.map(article => ({ ... }));

      console.log("Fetching data for My Cool News...") // Optional logging

      // Ensure you return an array of NewsItem objects
      return news
    })
    ```

### 2. Implement the Fetching Logic

There are three main ways to fetch and process data:

*   **a) Custom Scraping/API Fetching:**
    *   Use the `myFetch` utility (a wrapper around `ofetch`) to get HTML or JSON data.
    *   If fetching HTML, use `cheerio` to parse the content and extract relevant information (titles, URLs, IDs, dates).
    *   If fetching JSON, parse the response directly.
    *   Map the extracted data to the `NewsItem` structure:
        ```typescript
        interface NewsItem {
          title: string // The headline or title of the item
          url: string // The direct URL to the news item/article
          id: string // A unique identifier for the item (often the URL or a specific ID from the source)
          pubDate?: number // Optional: Publication timestamp (in milliseconds since epoch)
          extra?: {
            info?: string // Optional: Extra short info (e.g., score, comments count)
            [key: string]: any // Allow other potential fields
          }
        }
        ```
    *   Return the array of `NewsItem` objects. (See `server/sources/hackernews.ts` for an example).

*   **b) Standard RSS/Atom Feed:**
    *   If the source provides a standard RSS or Atom feed, use the `defineRSSSource` helper.
    *   Provide the feed URL as the first argument.
    *   It automatically fetches, parses, and maps the feed items to `NewsItem`.

    ```typescript
    // server/sources/my-rss-source.ts
    import { defineRSSSource } from "../utils/source"

    // Fetches and parses the RSS feed
    export default defineRSSSource("https://my-rss-source.com/feed.xml")
    ```

*   **c) RSSHub Feed:**
    *   If the source is available via an [RSSHub](https://docs.rsshub.app/) instance, use the `defineRSSHubSource` helper.
    *   Provide the RSSHub *route path* (e.g., `/github/trending/daily`) as the first argument. The base URL is configured internally.
    *   It fetches the JSON feed from RSSHub and maps items to `NewsItem`.

    ```typescript
    // server/sources/my-rsshub-source.ts
    import { defineRSSHubSource } from "../utils/source"

    // Fetches from configured RSSHub instance + /my/route
    export default defineRSSHubSource("/my/route")
    ```

### 3. Register the Source

*   Open the `shared/sources.json` file.
*   Add a new entry for your source. The key of the entry **must** match the filename (without the `.ts` extension) you created in Step 1.

    ```json
    {
      // ... other sources
      "my-cool-news": {
        "name": "My Cool News", // Display name in the UI
        "column": "tech",      // Category: tech, finance, world, china, etc.
        "home": "https://my-cool-news.com", // Homepage URL
        "color": "blue",       // Tailwind CSS color name for theming (e.g., red, blue, green, slate)
        "interval": 600000,    // Refresh interval in milliseconds (e.g., 600000 = 10 minutes)
        "title": "Latest",     // Optional: Specific title if this source has variants
        "type": "realtime"     // Optional: "hottest" or "realtime" (influences UI)
        // "disable": "cf"     // Optional: Uncomment to disable source in Cloudflare deployment
      },
      // ... other sources
    }
    ```

### 4. Add an Icon

*   Find or create a suitable icon for the source (preferably PNG).
*   Place the icon file in the `public/icons/` directory.
*   The icon filename **must** match the source key (e.g., `my-cool-news.png`). Recommended size is around 64x64 pixels.

### 5. Run Pre-source Script

*   After adding the source file and updating `sources.json`, you need to update the internal source mappings.
*   Run the following command in your terminal:
    ```bash
    pnpm run presource
    # or
    npm run presource
    ```
    This script reads the `server/sources/` directory and `shared/sources.json` to generate necessary mappings.

### 6. Test Locally

*   Start the development server:
    ```bash
    pnpm run dev
    # or
    npm run dev
    ```
*   Open the application in your browser.
*   Check if your new source appears in the correct column.
*   Verify that the data is fetched and displayed correctly.
*   You can also test the refresh logic directly by running:
    ```bash
    npx tsx scripts/local-refresh.ts my-cool-news
    ```
    (Replace `my-cool-news` with your source key).

## Best Practices

*   **Error Handling:** In custom scraping logic, wrap fetching/parsing in `try...catch` blocks to prevent errors from crashing the entire source update process. Log errors appropriately.
*   **Respect Robots.txt:** If scraping websites, ensure you respect their `robots.txt` rules and terms of service. Avoid overly aggressive fetching.
*   **Efficiency:** Make your scraping logic as efficient as possible. Select specific elements rather than parsing the entire DOM unnecessarily.
*   **Unique IDs:** Ensure the `id` field in your `NewsItem` is truly unique for each item within that source. The URL is often a good candidate.
*   **Rate Limiting:** Be mindful of potential rate limits on APIs or websites. The `interval` in `sources.json` helps control refresh frequency.

## Conclusion

By following these steps, you can successfully integrate new data sources into the NewsNow application, expanding its coverage of news and information. Remember to test thoroughly and adhere to best practices when interacting with external websites and APIs.
