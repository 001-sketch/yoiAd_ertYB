import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES, TIMEFRAMES } from '../constants';
import { NewsCategory, NewsTimeframe, NewsItem } from '../types';
import { fetchNews } from '../services/newsService';
import { NewsCard } from './NewsCard';

export const NewsFeed = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') as NewsCategory;
  
  const [category, setCategory] = useState<NewsCategory>(urlCategory || 'local');
  const [timeframe, setTimeframe] = useState<NewsTimeframe>('today');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state with URL params
  useEffect(() => {
    if (urlCategory && (urlCategory === 'local' || urlCategory === 'international')) {
      setCategory(urlCategory);
    }
  }, [urlCategory]);

  const handleCategoryChange = (newCat: NewsCategory) => {
    setCategory(newCat);
    setSearchParams({ category: newCat });
  };

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNews(category, timeframe);
      setNews(data);
    } catch (err) {
      setError('Failed to fetch latest news updates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [category, timeframe]);

  return (
    <section id="feed" className="py-12 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-black tracking-tighter uppercase">
            The <span className="text-primary">Intelligence</span> Stream
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id as NewsCategory)}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all border ${
                  category === cat.id 
                    ? 'bg-primary text-black border-primary font-bold' 
                    : 'bg-transparent text-text-muted border-border hover:border-primary/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex bg-bg-card rounded-lg p-1 border border-border w-full md:w-auto">
            {TIMEFRAMES.map((time) => (
              <button
                key={time.id}
                onClick={() => setTimeframe(time.id as NewsTimeframe)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-widest transition-all ${
                  timeframe === time.id 
                    ? 'bg-white text-black font-bold' 
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {time.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-tighter">
            Last update: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-xs font-mono uppercase tracking-widest text-text-muted">Synchronizing with Global Node...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 space-y-4 text-center"
          >
            <AlertCircle size={40} className="text-red-500" />
            <p className="text-white font-display font-medium">{error}</p>
            <button 
              onClick={loadNews}
              className="flex items-center gap-2 text-xs font-mono uppercase text-primary hover:underline"
            >
              <RefreshCw size={14} /> Retry Handshake
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {news.map((item, idx) => (
              <NewsCard key={item.id} item={item} index={idx} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
