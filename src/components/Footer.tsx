import React from 'react';
import { Cpu, Instagram, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { SITE_NAME, FOOTER_SECTIONS } from '../constants';

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent, href: string, category?: string) => {
    if (href === '#') return;
    
    if (href.startsWith('info/')) {
      // Just let the default Link behavior happen or navigate manually
      return;
    }

    e.preventDefault();
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

  return (
    <footer className="bg-bg-dark border-t border-border pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <div className="md:col-span-2 space-y-4 text-center md:text-left">
            <Link to="/" className="flex justify-center md:justify-start items-center gap-2 group">
              <Cpu size={24} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-display font-black tracking-tight text-white">
                {SITE_NAME.split('_')[0]}<span className="text-primary">_{SITE_NAME.split('_')[1]}</span>
              </span>
            </Link>
            <p className="text-text-muted max-w-md mx-auto md:mx-0 font-light leading-relaxed">
              Real-time tech intelligence synthesized for the modern pioneer. From the streets of Nairobi to the clusters of Silicon Valley.
            </p>
            <div className="flex justify-center md:justify-start gap-4 pt-4">
              <a 
                href="https://instagram.com/byte_daily" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border rounded-lg text-text-muted hover:text-primary hover:border-primary/50 transition-all group"
              >
                <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono uppercase tracking-widest">@byte_daily</span>
              </a>
            </div>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4 text-center md:text-left">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-primary">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.href.startsWith('info/') ? `/${link.href}` : (link.href.startsWith('#') ? link.href : `/#${link.href}`)}
                      onClick={(e) => handleNavClick(e, link.href, (link as any).category)}
                      className="text-sm text-text-muted hover:text-white transition-colors cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-8 border-t border-border">
          <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-primary text-center md:text-left">Network Status</h4>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-green-500">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>ALL_SYSTEMS_OPERATIONAL</span>
              </div>
              <span className="text-[10px] text-text-muted font-mono uppercase">Uptime: 99.99%</span>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest leading-loose">
                © {new Date().getFullYear()} {SITE_NAME}
              </p>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest hidden lg:block">
                LATENCY: 14MS | REGION: AF-SOUTH-1
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
