import { logger } from "./logger";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
  category: string;
}

export interface CandidateUpdate {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
  updateType: "joins" | "leaves" | "expelled" | "general";
  party?: string;
}

interface FeedEntry {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
}

// In-memory caches
let cachedNews: NewsItem[] = [];
let cachedCandidateUpdates: CandidateUpdate[] = [];
let lastFetchedAt: Date | null = null;

const ELECTION_KEYWORDS = [
  "election", "vote", "voting", "ballot", "BJP", "Congress", "AAP", "NDA", "INDIA alliance",
  "Lok Sabha", "Rajya Sabha", "assembly election", "constituency", "candidate", "campaign",
  "election commission", "ECI", "polling", "MP", "MLA", "party", "bypolls", "by-election",
  "chief minister", "CM", "governor", "political", "TMC", "DMK", "AIADMK", "Shiv Sena",
  "JD(U)", "JDU", "RJD", "CPI", "NCP", "BJD", "TDP", "YSR", "TRS", "BRS", "SP ", "BSP",
  "Modi", "Rahul", "Kejriwal", "Stalin", "Mamata", "Nitish", "Tejashwi", "Fadnavis",
  "seat", "ward", "panchayat", "Rajya Sabha", "parliament", "democratic", "manifesto",
];

const CANDIDATE_KEYWORDS = [
  "joins BJP", "joins Congress", "joins AAP", "joins TMC", "joins SP", "joins RJD",
  "joins party", "leaves BJP", "leaves Congress", "leaves party",
  "defects", "rebel", "expelled from", "quits party", "resigns from party",
  "joins NDA", "joins INDIA alliance", "new candidate", "announces candidacy",
  "files nomination", "withdraws candidacy", "joins Shiv Sena", "joins NCP",
  "inducted into", "crosses floor", "joins ruling", "anti-defection",
  "party change", "switch party", "joins TDP", "joins YSRCP", "joins BRS", "joins JDU",
  "joins DMK", "joins AIADMK", "party hopping",
];

function isElectionRelated(title: string, desc: string): boolean {
  const text = (title + " " + desc).toLowerCase();
  return ELECTION_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

function isCandidateUpdate(title: string, desc: string): { isUpdate: boolean; type: CandidateUpdate["updateType"]; party?: string } {
  const text = (title + " " + desc).toLowerCase();
  if (!CANDIDATE_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))) {
    return { isUpdate: false, type: "general" };
  }

  let type: CandidateUpdate["updateType"] = "general";
  const joinMatch = text.match(/joins?\s+(bjp|congress|aap|tmc|sp|rjd|ncp|shiv sena|tdp|ysrcp|brs|jdu|dmk|aiadmk|nda|india alliance)/i);
  const leavesMatch = text.match(/(leaves?|quits?|resigns?\s+from|expelled\s+from)\s+(?:the\s+)?(bjp|congress|aap|tmc|sp|rjd|ncp|party)/i);

  if (joinMatch) { type = "joins"; return { isUpdate: true, type, party: joinMatch[1].toUpperCase() }; }
  if (leavesMatch || text.includes("defect") || text.includes("rebel")) { type = "leaves"; return { isUpdate: true, type }; }
  if (text.includes("expelled")) { type = "expelled"; return { isUpdate: true, type }; }

  return { isUpdate: true, type: "general" };
}

const RSS_FEEDS = [
  { url: "https://feeds.feedburner.com/ndtvnews-india-news", source: "NDTV", category: "Politics" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/1221656.cms", source: "Times of India", category: "Politics" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", source: "The Hindu", category: "National" },
  { url: "https://indianexpress.com/section/political-pulse/feed/", source: "Indian Express", category: "Politics" },
  { url: "https://www.hindustantimes.com/feeds/rss/politics/rssfeed.xml", source: "Hindustan Times", category: "Politics" },
  { url: "https://www.indiatoday.in/rss/1206513", source: "India Today", category: "Politics" },
  { url: "https://zeenews.india.com/rss/india-national-news.xml", source: "Zee News", category: "National" },
  { url: "https://feeds.feedburner.com/ndtvnews-elections", source: "NDTV Elections", category: "Elections" },
  { url: "https://www.news18.com/rss/politics.xml", source: "News18", category: "Politics" },
  { url: "https://www.livehindustan.com/rss/feed/national-news.xml", source: "Live Hindustan", category: "National" },
];

async function parseRSS(url: string): Promise<FeedEntry[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ElectionPortalBot/2.0; India Election News Aggregator)",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
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
      const link = getTag("link") || getTag("guid") || "";
      const cleanLink = link.startsWith("http") ? link : "";
      items.push({
        title: getTag("title"),
        link: cleanLink,
        pubDate: getTag("pubDate"),
        contentSnippet: getTag("description").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").substring(0, 350),
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
  const candidateItems: CandidateUpdate[] = [];
  let successCount = 0;

  for (const feed of RSS_FEEDS) {
    try {
      const items = await parseRSS(feed.url);
      let feedCount = 0;

      for (const item of items) {
        const title = item.title || "";
        const desc = item.contentSnippet || "";
        if (!title || !item.link) continue;
        if (!isElectionRelated(title, desc)) continue;

        feedCount++;
        allItems.push({
          title,
          link: item.link,
          pubDate: item.pubDate || new Date().toISOString(),
          source: feed.source,
          description: desc,
          category: feed.category,
        });

        const candidateCheck = isCandidateUpdate(title, desc);
        if (candidateCheck.isUpdate) {
          candidateItems.push({
            title,
            link: item.link,
            pubDate: item.pubDate || new Date().toISOString(),
            source: feed.source,
            description: desc,
            updateType: candidateCheck.type,
            party: candidateCheck.party,
          });
        }
      }

      logger.info({ source: feed.source, total: items.length, electionRelated: feedCount }, "Feed processed");
      successCount++;
    } catch (err: any) {
      logger.warn({ source: feed.source, error: err.message }, "Feed fetch failed");
    }
  }

  logger.info({ successfulFeeds: successCount, totalFeedsTried: RSS_FEEDS.length }, "All feeds processed");

  // Deduplicate & sort
  const dedupe = <T extends { title: string; pubDate: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items
      .filter(item => {
        const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const da = new Date(a.pubDate).getTime() || 0;
        const db_ = new Date(b.pubDate).getTime() || 0;
        return db_ - da;
      });
  };

  const sortedNews = dedupe(allItems).slice(0, 100);
  const sortedCandidates = dedupe(candidateItems).slice(0, 20);

  if (sortedNews.length > 0) {
    cachedNews = sortedNews;
    cachedCandidateUpdates = sortedCandidates;
    lastFetchedAt = new Date();
    logger.info({ newsCount: sortedNews.length, candidateUpdates: sortedCandidates.length }, "Election news cache updated");
  } else {
    logger.warn("No election news found — keeping previous cache");
  }
}

export function getCachedNews(): { news: NewsItem[]; lastFetchedAt: string | null; total: number } {
  return { news: cachedNews, lastFetchedAt: lastFetchedAt?.toISOString() || null, total: cachedNews.length };
}

export function getCachedCandidateUpdates(): { updates: CandidateUpdate[]; lastFetchedAt: string | null; total: number } {
  return { updates: cachedCandidateUpdates, lastFetchedAt: lastFetchedAt?.toISOString() || null, total: cachedCandidateUpdates.length };
}
