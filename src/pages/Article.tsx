import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Share2, Globe, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { NewsItem } from '../types';
import { getArticleById } from '../services/newsService';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Safe URL protocol validator to protect against malicious markdown links (XSS)
const sanitizeMarkdownUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) {
    return trimmed;
  }
  return '';
};

export const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsItem | null>(location.state?.article || null);
  const [loading, setLoading] = useState(!article);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!article && id) {
      loadArticle(id);
    }
  }, [id, article]);

  const loadArticle = async (articleId: string) => {
    setLoading(true);
    try {
      // 1. First try to resolve from active news cache / registry
      const localArticle = await getArticleById(articleId);
      if (localArticle) {
        setArticle(localArticle);
        return;
      }

      // 2. Fall back to AI synthesis if not found in cache
      await scrapArticleData(articleId);
    } catch (err) {
      console.error('Error loading article:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrapArticleData = async (articleId: string) => {
    try {
      const prompt = `System: You are a news synthesis engine for Byte_daily.
Input ID: ${articleId}
Task: Reconstruct the full tech news article for this ID.
Return a valid JSON object matching: {"title": string, "summary": string, "content": string (markdown format), "date": string, "tag": string, "author": string, "sourceUrl": string}.
Focus: East African / Global tech ecosystem.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text.trim());
        setArticle({ ...data, id: articleId } as NewsItem);
      }
    } catch (error) {
      console.error("Error synthesizing article data:", error);
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
          className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-primary transition-colors uppercase tracking-widest cursor-pointer"
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
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const parent = e.currentTarget.parentElement;
                if (parent) parent.style.display = 'none';
              }} 
            />
          </div>
        )}

        <div className="prose prose-invert prose-primary max-w-none font-light leading-loose text-gray-300">
          <Markdown urlTransform={sanitizeMarkdownUrl}>
            {article.content}
          </Markdown>
        </div>

        <div className="pt-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: article.title,
                    text: article.summary,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-primary transition-colors uppercase cursor-pointer"
            >
              <Share2 size={16} /> Share Signal
            </button>
            {article.sourceUrl && (
              <a 
                href={article.sourceUrl} 
                target="_blank" 
                rel="noreferrer noopener"
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
              <span className="text-[10px] font-mono text-text-muted uppercase">Tech Intelligence Bureau</span>
            </div>
          </div>
        </div>
      </motion.div>
    </article>
  );
};
