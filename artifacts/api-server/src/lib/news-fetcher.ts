import { logger } from "./logger";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
  category: string;
}

interface FeedEntry {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
}

// In-memory cache
let cachedNews: NewsItem[] = [];
let lastFetchedAt: Date | null = null;

const ELECTION_KEYWORDS = [
  "election", "vote", "voting", "ballot", "BJP", "Congress", "AAP", "NDA", "INDIA alliance",
  "Lok Sabha", "Rajya Sabha", "assembly election", "constituency", "candidate", "campaign",
  "election commission", "ECI", "polling", "manifest", "MP", "MLA", "party",
];

function isElectionRelated(title: string, desc: string): boolean {
  const text = (title + " " + desc).toLowerCase();
  return ELECTION_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

const RSS_FEEDS = [
  { url: "https://feeds.feedburner.com/ndtvnews-india-news", source: "NDTV", category: "Politics" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/1221656.cms", source: "Times of India", category: "Politics" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", source: "The Hindu", category: "National" },
  { url: "https://indianexpress.com/section/political-pulse/feed/", source: "Indian Express", category: "Politics" },
  { url: "https://www.hindustantimes.com/feeds/rss/politics/rssfeed.xml", source: "Hindustan Times", category: "Politics" },
];

async function parseRSS(url: string): Promise<FeedEntry[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 ElectionPortalBot/1.0" },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const items: FeedEntry[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const getTag = (tag: string) => {
        const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`, "s"))
          || item.match(new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, "s"));
        return m ? m[1].trim() : "";
      };
      items.push({
        title: getTag("title"),
        link: getTag("link") || getTag("guid"),
        pubDate: getTag("pubDate"),
        contentSnippet: getTag("description").replace(/<[^>]+>/g, "").substring(0, 300),
      });
    }
    return items;
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function refreshElectionNews(): Promise<void> {
  logger.info("Fetching election news from RSS feeds...");
  const allItems: NewsItem[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const items = await parseRSS(feed.url);
      for (const item of items) {
        const title = item.title || "";
        const desc = item.contentSnippet || "";
        if (!title) continue;
        if (!isElectionRelated(title, desc)) continue;

        allItems.push({
          title,
          link: item.link || "",
          pubDate: item.pubDate || new Date().toISOString(),
          source: feed.source,
          description: desc,
          category: feed.category,
        });
      }
      logger.info({ source: feed.source, count: items.length }, "Feed fetched");
    } catch (err: any) {
      logger.warn({ source: feed.source, error: err.message }, "Feed fetch failed");
    }
  }

  // Sort by date, deduplicate by title, keep latest 50
  const seen = new Set<string>();
  const sorted = allItems
    .filter(item => {
      const key = item.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 50);

  if (sorted.length > 0) {
    cachedNews = sorted;
    lastFetchedAt = new Date();
    logger.info({ count: sorted.length }, "Election news cache updated");
  } else {
    logger.warn("No election news found — keeping previous cache");
  }
}

export function getCachedNews(): { news: NewsItem[]; lastFetchedAt: string | null; total: number } {
  return {
    news: cachedNews,
    lastFetchedAt: lastFetchedAt?.toISOString() || null,
    total: cachedNews.length,
  };
}
