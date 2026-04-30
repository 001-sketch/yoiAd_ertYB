import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, User, Calendar, Tag } from 'lucide-react';
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
      transition={{ delay: index * 0.1 }}
      className="group bg-bg-card border border-border hover:border-primary/50 transition-all rounded-xl overflow-hidden flex flex-col h-full"
    >
      <div className="p-6 flex flex-col flex-grow space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-[10px] font-mono text-primary uppercase tracking-wider border border-primary/20">
            <Tag size={10} />
            {item.tag}
          </span>
          <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
            <Calendar size={10} />
            {item.date}
          </span>
        </div>

        <Link to={`/article/${item.id}`} state={{ article: item }}>
          <h3 className="text-xl font-display font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer">
            {item.title}
          </h3>
        </Link>

        <p className="text-sm text-text-muted line-clamp-3 font-light leading-relaxed">
          {item.summary}
        </p>

        <div className="pt-4 mt-auto flex items-center justify-between border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center">
              <User size={12} className="text-text-muted" />
            </div>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-tighter">
              {item.author}
            </span>
          </div>
          <Link 
            to={`/article/${item.id}`} 
            state={{ article: item }}
            className="text-primary hover:text-white transition-colors"
          >
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
