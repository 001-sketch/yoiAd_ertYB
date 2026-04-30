import React from 'react';
import { motion } from 'motion/react';
import { Zap, Globe, ArrowDown } from 'lucide-react';
import { SITE_NAME, SITE_DESCRIPTION } from '../constants';

export const Hero = () => {
  return (
    <section className="relative min-h-[60vh] flex flex-col justify-center overflow-hidden pt-20 pb-10 tech-grid">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary uppercase tracking-widest">
            <Zap size={12} />
            <span>Nairobi Tech Pulse</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter">
            {SITE_NAME.split('_')[0]}<span className="text-primary prose-invert">_</span><br />
            {SITE_NAME.split('_')[1]}
          </h1>

          <p className="text-lg md:text-xl text-text-muted max-w-lg leading-relaxed font-light">
            {SITE_DESCRIPTION}
          </p>

          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold">24/7</span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">Live Coverage</span>
            </div>
            <div className="w-[1px] h-10 bg-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold">120+</span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">Daily Scans</span>
            </div>
          </div>
          
          <button 
            onClick={() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-primary hover:text-white transition-colors group"
          >
            <span>Initialize Feed</span>
            <ArrowDown size={14} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </motion.div>

        <div className="hidden lg:block relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative aspect-square glass rounded-3xl overflow-hidden p-8 flex items-center justify-center"
          >
            <div className="absolute inset-0 shimmer opacity-20" />
            <div className="relative z-10 text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center border border-primary animate-pulse">
                <Globe size={48} className="text-primary" />
              </div>
              <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Scanning Network...</h3>
              <div className="flex flex-col gap-2">
                <div className="h-2 w-48 bg-border rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="h-full w-full bg-primary"
                  />
                </div>
                <span className="text-[10px] text-text-muted font-mono">ENCRYPTED_LATENCY: 12ms</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
