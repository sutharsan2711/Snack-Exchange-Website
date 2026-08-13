import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadFooterConfig, DEFAULT_FOOTER_CONFIG } from '../types/footerConfig';
import type { FooterConfig } from '../types/footerConfig';

export const Footer: React.FC = () => {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);

  useEffect(() => {
    // Initial load
    setConfig(loadFooterConfig());

    // Listen for live updates when saved in admin panel (or cross-tab)
    const handleStorageChange = () => {
      setConfig(loadFooterConfig());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2 text-white font-extrabold text-2xl tracking-tight">
            <span className="text-primary">{config.brandName || 'Foodie'}</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            {config.brandTagline}
          </p>
          <div className="flex space-x-4 pt-2">
            {config.twitterUrl && (
              <a href={config.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors duration-200" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            )}
            {config.instagramUrl && (
              <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors duration-200" aria-label="Instagram">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            )}
            {config.githubUrl && (
              <a href={config.githubUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors duration-200" aria-label="Github">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            {config.companyLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.url} className="hover:text-white transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Support */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider text-sm">Contact &amp; Support</h4>
          <ul className="space-y-2 text-sm">
            {config.supportLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.url} className="hover:text-white transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Locations */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider text-sm">We Deliver To</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            {config.deliveryCities.map((city, idx) => (
              <li key={idx}>{city}</li>
            ))}
          </ul>
        </div>

      </div>

      <div className="border-t border-slate-800 py-6 text-center text-xs md:text-sm text-slate-500">
        <p>{config.copyrightText}</p>
      </div>
    </footer>
  );
};
