import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Cpu, Bell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_LINKS, SITE_NAME } from '../constants';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, category?: string) => {
    e.preventDefault();
    setIsOpen(false);

    const targetPath = category ? `/?category=${category}#${href}` : `/#${href}`;

    if (location.pathname !== '/') {
      navigate(targetPath);
    } else {
      if (category) {
        navigate(targetPath);
      }
      const element = document.getElementById(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToSubscribe = () => {
    if (location.pathname !== '/') {
      navigate('/#subscribe');
    } else {
      document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          scrolled ? 'bg-bg-dark/80 backdrop-blur-xl border-b border-border py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" aria-label={`${SITE_NAME} - Go to home page`}>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
              <Cpu size={20} className="text-primary" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold tracking-tight text-white">
                {SITE_NAME.split('_')[0]}
                <span className="text-primary">_{SITE_NAME.split('_')[1]}</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a 
                key={link.label}
                href={`#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href, link.category)}
                className="text-xs font-mono uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={scrollToSubscribe}
              className="hidden sm:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-primary transition-all cursor-pointer"
            >
              <Bell size={14} />
              <span>Subscribe</span>
            </button>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white hover:text-primary transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-bg-dark border-l border-border md:hidden flex flex-col p-8 pt-24 gap-6"
          >
            {NAV_LINKS.map((link) => (
              <a 
                key={link.label}
                href={`#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href, link.category)}
                className="text-3xl font-display font-bold hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-auto">
              <button 
                onClick={scrollToSubscribe}
                className="w-full flex items-center justify-center gap-2 bg-primary text-black py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
              >
                <Bell size={20} />
                <span>Get Daily Updates</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
