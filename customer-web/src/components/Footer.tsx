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
            <span className="text-primary">{config.brandName || 'Snack Exchange'}</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            {config.brandTagline}
          </p>

          {/* Timings Badge */}
          {config.openingHours && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-amber-400 text-xs font-bold rounded-lg border border-slate-700">
              <span>🕒</span>
              <span>{config.openingHours}</span>
            </div>
          )}

          {/* Social Links */}
          <div className="flex space-x-4 pt-1">
            {config.instagramUrl && (
              <a
                href={config.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>@_snack.exchange__</span>
              </a>
            )}
          </div>
        </div>

        {/* Store Location Details + Embedded Google Map */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-base uppercase tracking-wider text-sm">Our Location & Map</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {config.address || 'Shop No. 8, Meena Food Court, Vasantham Nagar, Thudiyalur Road, Saravanampatti, Coimbatore, Tamil Nadu 641035'}
          </p>

          {/* Embedded Google Map iframe */}
          <div className="w-full h-36 rounded-2xl overflow-hidden shadow-md border border-slate-750 relative bg-slate-800">
            <iframe
              title="Snack Exchange Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15662.288059325632!2d76.99885565000001!3d11.07067965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8f7d126b1315b%3A0x1830a124a5d22ef7!2sSnack%20Exchange!5e0!3m2!1sen!2sin!4v1787382440785!5m2!1sen!2sin"
              className="w-full h-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        {/* Quick Links & Contact */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {config.supportLinks.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Locations */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider text-sm">Delivery In Coimbatore</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            {config.deliveryCities.map((city, idx) => (
              <li key={idx}>📍 {city}</li>
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
