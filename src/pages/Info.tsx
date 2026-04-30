import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, FileText, Gavel, Mail } from 'lucide-react';

const CONTENT_MAP: Record<string, { title: string, icon: any, text: string }> = {
  privacy: {
    title: "Privacy Protocol",
    icon: Shield,
    text: "At Byte_daily, we adhere to a strict Zero-Trace policy. Your data is your own. We do not track individual users across the grid. Our intelligence gathering is strictly limited to public technical signals and authorized research feeds. We encrypt all internal transmissions using post-quantum standards."
  },
  terms: {
    title: "Terms of Engagement",
    icon: Gavel,
    text: "By accessing the Byte_daily node, you agree to become a part of the global tech intelligence network. You are authorized to use our synthesized data for research and innovation. Redistributing raw intelligence without attribution is a breach of the protocol. We reserve the right to rotate keys and update our endpoints at any time."
  },
  guidelines: {
    title: "Editorial Guidelines",
    icon: FileText,
    text: "Our reporting is driven by objective technical metrics. We prioritize verifiable breakthroughs over marketing hype. Every signal published is cross-referenced through at least three independent nodes. We disclose all strategic partnerships to maintain full transparency in the Silicon Savannah."
  },
  contact: {
    title: "Contact Intelligence",
    icon: Mail,
    text: "Reach out via our encrypted channels. Email: signal@byte_daily.pulse | Matrix: #bytedaily:nairobi.grid. Our current response latency is 24-48 hours depending on network congestion."
  },
  media: {
    title: "Media Kit",
    icon: FileText,
    text: "Download our brand assets, including the high-resolution logo and color palettes. Our brand represents the intersection of Kenyan grit and global technology. Please adhere to our visual standards when representing the pulse."
  }
};

export const Info = () => {
  const { slug } = useParams<{ slug: string }>();
  const content = slug ? CONTENT_MAP[slug] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!content) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-display font-bold">Node Not Found</h2>
        <Link to="/" className="text-primary hover:underline font-mono text-xs uppercase">Return Home</Link>
      </div>
    );
  }

  const Icon = content.icon;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <Link 
          to="/"
          className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-primary transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back to Terminal
        </Link>

        <div className="space-y-6">
          <div className="inline-flex p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
            <Icon size={32} />
          </div>
          <h1 className="text-5xl font-display font-black tracking-tighter uppercase">
            {content.title}
          </h1>
        </div>

        <div className="prose prose-invert prose-primary max-w-none">
          <p className="text-xl text-text-muted leading-relaxed font-light">
            {content.text}
          </p>
          <p className="pt-8 text-sm text-text-muted font-mono uppercase tracking-[0.2em]">
            Revision: 2026.04.V1 | Nairobi Node 01
          </p>
        </div>
      </motion.div>
    </div>
  );
};
