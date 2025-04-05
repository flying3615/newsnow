import type { NewsItem } from "@shared/types"
import type { RSSItem, SourceGetter } from "../types"
import { rss2json } from "../utils/rss2json"
import { logger } from "../utils/logger"

const YAHOO_FINANCE_RSS_URL = "https://finance.yahoo.com/rss/topstories" // Keep only one declaration

const getter: SourceGetter = async () => { // Ensure getter definition is correct
  try {
    const rssInfo = await rss2json(YAHOO_FINANCE_RSS_URL)

    // Check if rssInfo and rssInfo.items exist before proceeding
    if (!rssInfo || !rssInfo.items) {
      logger.warn("Yahoo Finance RSS feed did not return valid items.")
      return []
    }

    const rssItems = rssInfo.items

    const newsItems: NewsItem[] = rssItems.map((item: RSSItem) => ({ // Explicitly type 'item'
      // Use link as a unique ID, assuming it's stable
      id: item.link,
      title: item.title,
      url: item.link,
      // rss2json usually provides 'created' as a string date
      // Convert to timestamp
      pubDate: item.created ? new Date(item.created).getTime() : undefined,
    }))

    return newsItems
  } catch (error) {
    logger.error(`Failed to fetch Yahoo Finance RSS: ${error}`)
    return [] // Return empty array on error
  }
}

export default getter
