import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Tag, Share2, Globe, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { NewsItem } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const Article = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsItem | null>(location.state?.article || null);
  const [loading, setLoading] = useState(!article);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!article && id) {
      // Simulate "scrapping" if we don't have the data
      // In a real app, this would fetch from a database or a scraping service
      scrapArticleData(id);
    }
  }, [id, article]);

  const scrapArticleData = async (articleId: string) => {
    setLoading(true);
    try {
      // We simulate a scrap by asking Gemini to reconstruct the article based on the ID (title slug)
      const prompt = `System: You are a news scraping engine. 
      Input ID: ${articleId}
      Task: Reconstruct the full tech news article for this ID.
      Return a JSON object with: title, summary, content (markdown, 1000+ words), date, tag, author, sourceUrl.
      Current Date: April 30, 2026.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text.trim());
      setArticle({ ...data, id: articleId } as NewsItem);
    } catch (error) {
      console.error("Error scrapping article:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary animate-spin" size={48} />
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">Extracting data package...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-display font-bold">Signal Lost</h2>
        <p className="text-text-muted">Article not found in the grid.</p>
        <Link to="/" className="text-primary hover:underline font-mono text-xs uppercase">Return Home</Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-primary transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back to Pulse
        </button>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary uppercase rounded tracking-widest">
              {article.tag}
            </span>
            <div className="flex items-center gap-2 text-text-muted text-[10px] font-mono uppercase tracking-tighter">
              <Calendar size={12} /> {article.date}
            </div>
            <div className="flex items-center gap-2 text-text-muted text-[10px] font-mono uppercase tracking-tighter">
              <User size={12} /> {article.author}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-black leading-tight tracking-tighter">
            {article.title}
          </h1>

          <p className="text-xl text-text-muted font-light leading-relaxed border-l-2 border-primary/30 pl-6 py-2 italic font-display">
            {article.summary}
          </p>
        </div>

        {article.imageUrl && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden tech-border">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-invert prose-primary max-w-none font-light leading-loose text-gray-300">
          <Markdown>{article.content}</Markdown>
        </div>

        <div className="pt-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-primary transition-colors uppercase">
              <Share2 size={16} /> Share Signal
            </button>
            {article.sourceUrl && (
              <a 
                href={article.sourceUrl} 
                target="_blank" 
                rel="no-referrer"
                className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-primary transition-colors uppercase"
              >
                <Globe size={16} /> Original Source
              </a>
            )}
          </div>

          <div className="p-4 glass rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
              <User size={20} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-display font-bold uppercase tracking-tight">{article.author}</span>
              <span className="text-[10px] font-mono text-text-muted uppercase">Senior Tech Analyst</span>
            </div>
          </div>
        </div>
      </motion.div>
    </article>
  );
};
