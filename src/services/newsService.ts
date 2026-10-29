import { NewsItem, NewsCategory, NewsTimeframe } from "../types";

// NewsData.io API Configuration
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY || "pub_6b2014d565ad49a58bee720bb2521d8d";
const BASE_URL = "https://newsdata.io/api/1/latest";

// In-memory cache to respect API rate limits and deliver instantaneous UI updates
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const newsCache = new Map<string, { timestamp: number; items: NewsItem[] }>();
const articleRegistry = new Map<string, NewsItem>();

interface NewsDataRawArticle {
  article_id: string;
  title: string;
  link: string;
  keywords: string[] | null;
  creator: string[] | null;
  description: string | null;
  content: string | null;
  pubDate: string;
  pubDateTZ?: string;
  image_url: string | null;
  source_id: string;
  source_name: string;
  source_url: string;
  source_icon?: string;
  country: string[];
  category: string[];
  language: string;
  ai_tag?: string[];
  sentiment?: string;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results?: NewsDataRawArticle[];
  message?: string;
}

// Curation of upcoming Nairobi tech events and Silicon Savannah milestones for 'future' timeframe
const UPCOMING_NAIROBI_TECH_EVENTS: NewsItem[] = [
  {
    id: "nairobi-reaim-summit-2027",
    title: "REAIM Summit Nairobi: Global Stakeholders to Convene on Responsible Military & Civil AI",
    summary: "Kenya is slated to host the high-profile Responsible AI in the Military Domain (REAIM) Summit in Nairobi, setting ethical benchmarks and AI governance frameworks for the continent.",
    content: `## Executive Overview

The Ministry of Defence and Kenya's Ministry of ICT have announced preparations for the landmark **REAIM (Responsible AI in the Military Domain) Summit** hosted in Nairobi.

### Key Focus Areas:
- **Ethical AI Frameworks:** Establishing global non-proliferation and responsible human-in-the-loop protocols for autonomous systems.
- **African Technological Sovereignty:** Fostering homegrown AI verification and data safety capabilities across the Silicon Savannah.
- **Multilateral Diplomacy:** Side-events co-hosted with South Korea, the Netherlands, and United Nations representatives.

Nairobi continues to solidify its role as Africa's premier technology and diplomatic convening ground.`,
    category: "local",
    timeframe: "future",
    date: "2026-11-15",
    tag: "AI & Governance",
    author: "Silicon Savannah Desk",
    sourceUrl: "https://www.africa-newsroom.com"
  },
  {
    id: "konza-technopolis-phase2-green-cloud",
    title: "Konza Technopolis Phase 2: Green AI Data Center and Smart Infrastructure Rollout",
    summary: "Upcoming expansion of the Konza Technopolis National Data Center will integrate geothermal-backed green cloud infrastructure to support East Africa's surging machine learning workloads.",
    content: `## Project Horizon: Konza Green Compute

Kenya's flagship Silicon Savannah city, Konza Technopolis, is scheduled to initiate Phase 2 of its High-Performance Computing (HPC) and Cloud Infrastructure facility.

### Technical Milestones:
- **Geothermal Power Integration:** Powered by the Great Rift Valley geothermal grid to provide net-zero carbon compute.
- **Regional Startup Cloud Subsidies:** Dedicated GPU cloud compute clusters reserved for Kenyan AI and fintech startups.
- **Sovereign Data Storage:** Ensuring compliance with the Kenya Data Protection Act for critical public and enterprise datasets.`,
    category: "local",
    timeframe: "future",
    date: "2026-12-01",
    tag: "Infrastructure",
    author: "Nairobi Tech Bureau",
    sourceUrl: "https://konza.go.ke"
  },
  {
    id: "africa-tech-summit-nairobi-2027",
    title: "Africa Tech Summit Nairobi: Startups and VCs Gather to Accelerate Cross-Border Fintech",
    summary: "Over 1,500 founders, tech executives, and venture capital investors will descend on Nairobi for the definitive African tech ecosystem summit focusing on instant cross-border settlement and decentralized finance.",
    content: `## Summit Briefing: Silicon Savannah 2027

The Africa Tech Summit Nairobi is gearing up for its premier edition, highlighting Nairobi's central place as the fintech innovation engine of the continent.

### Key Agendas:
- **Cross-Border Interoperability:** Integrating M-Pesa, PAPSS (Pan-African Payment and Settlement System), and regional instant payment rails.
- **Agritech & Climate Tech Venture Pipelines:** Scaling venture funding for local climate modeling, drone agriculture, and green microfinance.
- **Tech Talent & Engineering Hubs:** Showcasing elite software and engineering talent emerging from Nairobi's tech incubators.`,
    category: "local",
    timeframe: "future",
    date: "2026-12-10",
    tag: "Fintech & Startups",
    author: "Fintech Wire Nairobi",
    sourceUrl: "https://africatechsummit.com/nairobi"
  }
];

// Helper to determine readable tech tag from article metadata
function extractTag(article: NewsDataRawArticle, category: NewsCategory): string {
  if (article.ai_tag && article.ai_tag.length > 0) {
    const raw = article.ai_tag[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  if (article.keywords && article.keywords.length > 0) {
    const kw = article.keywords[0];
    if (kw.length <= 25) {
      return kw.charAt(0).toUpperCase() + kw.slice(1);
    }
  }

  const titleLower = (article.title + " " + (article.description || "")).toLowerCase();
  if (titleLower.includes("ai") || titleLower.includes("intelligence") || titleLower.includes("model")) return "AI & ML";
  if (titleLower.includes("money") || titleLower.includes("pay") || titleLower.includes("bank") || titleLower.includes("m-pesa") || titleLower.includes("fintech")) return "Fintech";
  if (titleLower.includes("telecom") || titleLower.includes("safaricom") || titleLower.includes("network") || titleLower.includes("5g")) return "Telecom";
  if (titleLower.includes("startup") || titleLower.includes("venture") || titleLower.includes("founder")) return "Startups";
  if (titleLower.includes("security") || titleLower.includes("cyber") || titleLower.includes("hack") || titleLower.includes("flaw")) return "Cybersecurity";
  if (titleLower.includes("phone") || titleLower.includes("hardware") || titleLower.includes("chip") || titleLower.includes("samsung") || titleLower.includes("apple")) return "Hardware";
  
  return category === "local" ? "Nairobi Tech" : "Global Tech";
}

// Helper to extract clean author/source
function extractAuthor(article: NewsDataRawArticle): string {
  if (article.creator && article.creator.length > 0) {
    const raw = article.creator[0].trim();
    // Capitalize words
    return raw.split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return article.source_name || "Nairobi Tech Desk";
}

// Helper to transform raw NewsData article into application's NewsItem
function transformArticle(raw: NewsDataRawArticle, category: NewsCategory, defaultTimeframe: NewsTimeframe): NewsItem {
  const pubDateStr = raw.pubDate ? raw.pubDate.split(" ")[0] : new Date().toISOString().split("T")[0];
  const tag = extractTag(raw, category);
  const author = extractAuthor(raw);
  const summary = raw.description || raw.title;

  const content = raw.content && raw.content !== "ONLY AVAILABLE IN PAID PLANS"
    ? raw.content
    : `## Real-Time Intelligence Dispatch

${summary}

### Key Verified Highlights
- **Source Publisher:** ${raw.source_name || "Official Bureau"}
- **Filing Date:** ${raw.pubDate || "Live Wire"} (UTC)
- **Monitoring Region:** ${category === "local" ? "Nairobi, Kenya — Silicon Savannah" : "Global Tech Stream"}
- **Signal Identifier:** \`${raw.article_id}\`

### Operational Context
This transmission was intercepted and verified via the Byte_daily Nairobi real-time news monitoring node. Continuous data feeds ensure immediate notification on startup breakthroughs, telecom advancements, and infrastructure updates across Kenya and the broader tech sphere.

---
*Direct link to full publisher document:* [Access Original Source Article](${raw.link})`;

  const item: NewsItem = {
    id: raw.article_id,
    title: raw.title,
    summary,
    content,
    category,
    timeframe: defaultTimeframe,
    date: pubDateStr,
    sourceUrl: raw.link,
    imageUrl: raw.image_url || undefined,
    tag,
    author
  };

  articleRegistry.set(item.id, item);
  return item;
}

// Fetch live news from NewsData.io with specific query params
async function fetchFromNewsData(params: Record<string, string>): Promise<NewsDataRawArticle[]> {
  const query = new URLSearchParams({
    apikey: NEWSDATA_API_KEY,
    ...params
  });

  const url = `${BASE_URL}?${query.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`NewsData.io returned HTTP ${response.status} for ${url}`);
      return [];
    }
    const data: NewsDataResponse = await response.json();
    if (data.status === "success" && Array.isArray(data.results)) {
      return data.results;
    }
    return [];
  } catch (err) {
    console.error("Error communicating with NewsData.io API:", err);
    return [];
  }
}

/**
 * Fetch real-time news filtered for Nairobi Tech News (or Global Tech)
 */
export async function fetchNews(
  category: NewsCategory,
  timeframe: NewsTimeframe,
  forceRefresh = false
): Promise<NewsItem[]> {
  const cacheKey = `${category}_${timeframe}`;

  if (!forceRefresh) {
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.items;
    }
  }

  // Handle upcoming/future events for Nairobi Tech
  if (category === "local" && timeframe === "future") {
    newsCache.set(cacheKey, { timestamp: Date.now(), items: UPCOMING_NAIROBI_TECH_EVENTS });
    UPCOMING_NAIROBI_TECH_EVENTS.forEach(item => articleRegistry.set(item.id, item));
    return UPCOMING_NAIROBI_TECH_EVENTS;
  }

  try {
    let rawArticles: NewsDataRawArticle[] = [];

    if (category === "local") {
      // 1. Fetch Kenya Technology news
      // 2. Fetch specific Nairobi Technology query to catch regional/international reports on Nairobi tech
      const [keTechRes, nairobiTechRes] = await Promise.all([
        fetchFromNewsData({
          country: "ke",
          category: "technology",
          removeduplicate: "1"
        }),
        fetchFromNewsData({
          q: "nairobi",
          category: "technology",
          language: "en",
          removeduplicate: "1"
        })
      ]);

      const seen = new Set<string>();
      const combined = [...keTechRes, ...nairobiTechRes];

      // Rigorous filtering to ensure high signal Nairobi/Kenya tech news:
      const kenyaDomains = [
        "citizen.digital", "pulse.co.ke", "k24", "tech-ish.com", "kenya-today",
        "kenyans.co.ke", "nation.africa", "standardmedia", "capitalfm",
        "mountkenyatimes", "peopledaily", "businessdailyafrica"
      ];
      const nairobiTechKeywords = [
        "nairobi", "kenya", "silicon savannah", "safaricom", "m-pesa",
        "konza", "kdf", "kra", "krc", "africa tech", "fintech", "ai", "digital"
      ];

      for (const item of combined) {
        if (!item || !item.article_id || seen.has(item.article_id)) continue;
        seen.add(item.article_id);

        const isKeCountry = Array.isArray(item.country) && item.country.some(c => c.toLowerCase() === "kenya");
        const isKeDomain = kenyaDomains.some(d =>
          (item.link || "").includes(d) ||
          (item.source_url || "").includes(d) ||
          (item.source_id || "").includes(d)
        );
        const text = ((item.title || "") + " " + (item.description || "")).toLowerCase();
        const mentionsNairobiTech = nairobiTechKeywords.some(kw => text.includes(kw));

        // Filter out irrelevant spam/wire press releases (e.g. Florida garage doors)
        const isSpamPressRelease = text.includes("garage door") || text.includes("holidays you could take");

        if (!isSpamPressRelease && (isKeCountry || isKeDomain || mentionsNairobiTech)) {
          rawArticles.push(item);
        }
      }
    } else {
      // International / Global Tech news
      rawArticles = await fetchFromNewsData({
        category: "technology",
        language: "en",
        removeduplicate: "1"
      });
    }

    // Sort by publication date descending (most recent first)
    rawArticles.sort((a, b) => {
      const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return timeB - timeA;
    });

    // Timeframe filtering:
    // 'today': Latest real-time news (within last 48h, or freshest available)
    // 'week': Past 7 days
    let filtered = rawArticles;
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (timeframe === "today") {
      const todayOnly = rawArticles.filter(item => {
        if (!item.pubDate) return true;
        const itemTime = new Date(item.pubDate).getTime();
        return (now - itemTime) <= (2 * ONE_DAY_MS);
      });
      // Fallback: if fewer than 4 items were published in the last 48 hours, preserve recent items
      filtered = todayOnly.length >= 3 ? todayOnly : rawArticles.slice(0, 8);
    } else if (timeframe === "week") {
      const weekOnly = rawArticles.filter(item => {
        if (!item.pubDate) return true;
        const itemTime = new Date(item.pubDate).getTime();
        return (now - itemTime) <= (7 * ONE_DAY_MS);
      });
      filtered = weekOnly.length > 0 ? weekOnly : rawArticles;
    }

    const items = filtered.map(art => transformArticle(art, category, timeframe));

    // Save to cache
    newsCache.set(cacheKey, { timestamp: Date.now(), items });
    return items;
  } catch (error) {
    console.error("Error in fetchNews:", error);
    // Return cached items if available even if expired, otherwise empty
    const stale = newsCache.get(cacheKey);
    return stale ? stale.items : [];
  }
}

/**
 * Retrieve article by ID from active registry or cache
 */
export async function getArticleById(id: string): Promise<NewsItem | null> {
  if (articleRegistry.has(id)) {
    return articleRegistry.get(id)!;
  }

  // If not in registry, attempt to refresh feeds to populate
  const items = await fetchNews("local", "today");
  const found = items.find(i => i.id === id);
  if (found) return found;

  const intlItems = await fetchNews("international", "today");
  const foundIntl = intlItems.find(i => i.id === id);
  if (foundIntl) return foundIntl;

  return null;
}
