export type NewsCategory = 'local' | 'international';
export type NewsTimeframe = 'week' | 'today' | 'future';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  timeframe: NewsTimeframe;
  date: string;
  sourceUrl?: string;
  imageUrl?: string;
  tag: string;
  author: string;
}

export interface SubscriptionStatus {
  email: string;
  subscribed: boolean;
}
