import { GoogleGenAI } from "@google/genai";
import { NewsItem, NewsCategory, NewsTimeframe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert tech journalist for Byte_daily. 
You provide high-quality, precise tech news in JSON format.
Current date context: April 30, 2026.

Content focus:
1. Nairobi (Silicon Savannah) local tech news, startups, and infrastructure.
2. Global tech (AI, silicon, robotics, etc.).

Timeframe mappings:
- 'week': News covering April 23, 2026 to April 29, 2026.
- 'today': News for April 30, 2026.
- 'future': Upcoming events and trends for May 2026 and beyond.

Return an array of NewsItem objects.
Each object must have: id, title, summary, content (detailed 300+ word article), category (local|international), timeframe (week|today|future), date (YYYY-MM-DD), tag, author, sourceUrl.
`;

export async function fetchNews(category: NewsCategory, timeframe: NewsTimeframe): Promise<NewsItem[]> {
  try {
    const prompt = `Generate 4 realistic tech news articles for ${category === 'local' ? 'Nairobi, Kenya' : 'Global Tech'}.
    Target timeframe: ${timeframe}.
    Requirement for ${timeframe}:
    - if 'week': date must be between 2026-04-23 and 2026-04-29.
    - if 'today': date must be 2026-04-30.
    - if 'future': date must be in May 2026.
    
    Make the 'content' field a full, engaging technical article (at least 3 paragraphs).
    Include a realistic-looking 'sourceUrl' (e.g. from a tech blog domain).
    Make them feel grounded in real potential tech trends of 2026 (e.g. advanced AI integration, space economy, green hydrogen in Kenya).
    Use unique IDs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      }
    });

    const news: NewsItem[] = JSON.parse(response.text.trim());
    return news;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}
