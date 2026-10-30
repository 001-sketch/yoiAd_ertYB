import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, User, Calendar, Tag, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NewsItem } from '../types';

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group bg-bg-card border border-border hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full hover:shadow-[0_0_25px_rgba(34,197,94,0.1)]"
    >
      {item.imageUrl && (
        <div className="relative w-full h-44 overflow-hidden bg-bg-dark border-b border-border/40">
          <img 
            src={item.imageUrl} 
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              // Hide image container seamlessly if source image fails to load
              const parent = (e.currentTarget.parentElement as HTMLElement);
              if (parent) parent.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-60" />
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-[10px] font-mono text-primary uppercase tracking-wider border border-primary/20">
            <Tag size={10} />
            {item.tag}
          </span>
          <span className="text-[10px] font-mono text-text-muted flex items-center gap-1 shrink-0">
            <Calendar size={10} />
            {item.date}
          </span>
        </div>

        <Link to={`/article/${item.id}`} state={{ article: item }}>
          <h3 className="text-xl font-display font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
            {item.title}
          </h3>
        </Link>

        <p className="text-sm text-text-muted line-clamp-3 font-light leading-relaxed">
          {item.summary}
        </p>

        <div className="pt-4 mt-auto flex items-center justify-between border-t border-border/50">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center shrink-0">
              <User size={12} className="text-text-muted" />
            </div>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-tighter truncate">
              {item.author}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                title="View original publisher report"
                className="text-text-muted hover:text-white transition-colors p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowUpRight size={15} />
              </a>
            )}
            <Link 
              to={`/article/${item.id}`} 
              state={{ article: item }}
              className="text-primary hover:text-white transition-colors p-1"
              title="Read full dispatch briefing"
            >
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
