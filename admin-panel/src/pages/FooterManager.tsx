import React, { useState, useEffect } from 'react';
import { Layout, Save, Plus, Trash2, Globe, Building2, HelpCircle, MapPin, RefreshCw } from 'lucide-react';

export interface FooterConfig {
  brandName: string;
  brandTagline: string;
  twitterUrl: string;
  instagramUrl: string;
  githubUrl: string;
  companyLinks: { label: string; url: string }[];
  supportLinks: { label: string; url: string }[];
  deliveryCities: string[];
  copyrightText: string;
}

export const FOOTER_STORAGE_KEY = 'bistro_footer_config';

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brandName: 'Foodie',
  brandTagline:
    'Delicious food, delivered fast. Discover the best restaurants near you and order your favorite meals in just a few clicks.',
  twitterUrl: '#',
  instagramUrl: '#',
  githubUrl: '#',
  companyLinks: [
    { label: 'About Us', url: '#' },
    { label: 'Careers', url: '#' },
    { label: 'Team', url: '#' },
    { label: 'Foodie One', url: '#' },
  ],
  supportLinks: [
    { label: 'Help & Support', url: '#' },
    { label: 'Partner with us', url: '#' },
    { label: 'Ride with us', url: '#' },
    { label: 'Terms & Conditions', url: '#' },
  ],
  deliveryCities: ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune'],
  copyrightText: `© ${new Date().getFullYear()} Foodie Technologies Pvt. Ltd. All rights reserved.`,
};

export const FooterManager: React.FC = () => {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FOOTER_STORAGE_KEY);
      if (saved) {
        setConfig({ ...DEFAULT_FOOTER_CONFIG, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load footer config:', e);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(config));
      // Dispatch a storage event so open tabs/windows can update instantly
      window.dispatchEvent(new Event('storage'));
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (e) {
      console.error('Failed to save footer config:', e);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset footer configuration to default settings?')) {
      setConfig(DEFAULT_FOOTER_CONFIG);
      localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(DEFAULT_FOOTER_CONFIG));
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Company Link handlers
  const handleCompanyLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...config.companyLinks];
    updated[index][field] = value;
    setConfig({ ...config, companyLinks: updated });
  };

  const addCompanyLink = () => {
    setConfig({
      ...config,
      companyLinks: [...config.companyLinks, { label: 'New Link', url: '#' }],
    });
  };

  const removeCompanyLink = (index: number) => {
    setConfig({
      ...config,
      companyLinks: config.companyLinks.filter((_, i) => i !== index),
    });
  };

  // Support Link handlers
  const handleSupportLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...config.supportLinks];
    updated[index][field] = value;
    setConfig({ ...config, supportLinks: updated });
  };

  const addSupportLink = () => {
    setConfig({
      ...config,
      supportLinks: [...config.supportLinks, { label: 'New Link', url: '#' }],
    });
  };

  const removeSupportLink = (index: number) => {
    setConfig({
      ...config,
      supportLinks: config.supportLinks.filter((_, i) => i !== index),
    });
  };

  // City handlers
  const handleCityChange = (index: number, value: string) => {
    const updated = [...config.deliveryCities];
    updated[index] = value;
    setConfig({ ...config, deliveryCities: updated });
  };

  const addCity = () => {
    setConfig({
      ...config,
      deliveryCities: [...config.deliveryCities, 'New City'],
    });
  };

  const removeCity = (index: number) => {
    setConfig({
      ...config,
      deliveryCities: config.deliveryCities.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Layout className="w-8 h-8 text-indigo-600" />
            Customer Footer Customizer
          </h1>
          <p className="text-slate-500 font-medium">
            Customize branding, social media links, navigation menus, and delivery locations on the customer website footer
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>Save Footer</span>
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-2xl animate-fade-in flex items-center justify-between">
          <span>✅ Footer configuration updated successfully! Refresh or check the Customer Web to see changes.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Branding & Social Links */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Brand Information &amp; Social Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Brand Name
              </label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-600 outline-none"
                placeholder="e.g. Foodie"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Copyright Line
              </label>
              <input
                type="text"
                value={config.copyrightText}
                onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Brand Description / Tagline
            </label>
            <textarea
              rows={2}
              value={config.brandTagline}
              onChange={(e) => setConfig({ ...config, brandTagline: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Twitter URL
              </label>
              <input
                type="text"
                value={config.twitterUrl}
                onChange={(e) => setConfig({ ...config, twitterUrl: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-600 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Instagram URL
              </label>
              <input
                type="text"
                value={config.instagramUrl}
                onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-600 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                GitHub URL
              </label>
              <input
                type="text"
                value={config.githubUrl}
                onChange={(e) => setConfig({ ...config, githubUrl: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Links & Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Links */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Company Links
              </h2>
              <button
                type="button"
                onClick={addCompanyLink}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {config.companyLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => handleCompanyLinkChange(idx, 'label', e.target.value)}
                    className="w-1/2 px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => handleCompanyLinkChange(idx, 'url', e.target.value)}
                    className="w-1/2 px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => removeCompanyLink(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Support Links */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Support Links
              </h2>
              <button
                type="button"
                onClick={addSupportLink}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {config.supportLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => handleSupportLinkChange(idx, 'label', e.target.value)}
                    className="w-1/2 px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => handleSupportLinkChange(idx, 'url', e.target.value)}
                    className="w-1/2 px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => removeSupportLink(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Delivery Cities */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Delivery Locations
            </h2>
            <button
              type="button"
              onClick={addCity}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Location
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {config.deliveryCities.map((city, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => handleCityChange(idx, e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeCity(idx)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold shadow-lg hover:shadow-xl transition-all cursor-pointer text-base"
          >
            <Save className="w-5 h-5" />
            <span>Save All Footer Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
