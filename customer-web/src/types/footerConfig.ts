// Shared footer config type and localStorage helpers used by both
// the admin-panel's FooterSettings page and the customer-web's Footer component.

export interface FooterConfig {
  // Brand column
  brandName: string;
  brandTagline: string;
  twitterUrl?: string;
  instagramUrl: string;
  swiggyUrl?: string;
  justdialUrl?: string;
  githubUrl?: string;
  mapsUrl?: string;
  address?: string;
  openingHours?: string;

  // Company column
  companyLinks: { label: string; url: string }[];

  // Contact & Support column
  supportLinks: { label: string; url: string }[];

  // Delivery cities column
  deliveryCities: string[];

  // Bottom bar
  copyrightText: string;
}

export const FOOTER_STORAGE_KEY = 'snack_exchange_footer_config';

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brandName: 'Snack Exchange',
  brandTagline:
    'Crispy snacks, gourmet burgers, loaded fries & sweet desserts made fresh. Visit us in Saravanampatti or order online.',
  instagramUrl: 'https://www.instagram.com/_snack.exchange__?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==',
  swiggyUrl: 'https://www.swiggy.com/city/coimbatore/snack-exchange-saravanampatti-rest1417490',
  justdialUrl: 'https://www.justdial.com/Coimbatore/Snack-Exchange-Saravanampatti/0422PX422-X422-260613000307-C2T3_BZDET/amp',
  mapsUrl: 'https://share.google/Fhxt9w4vHjqVJVK0w',
  address: 'Shop No. 8, Meena Food Court, Vasantham Nagar, Thudiyalur Road, Saravanampatti, Coimbatore, Tamil Nadu 641035',
  openingHours: 'Open Daily: 3:00 PM – 11:00 PM',
  companyLinks: [
    { label: 'Our Story', url: '/' },
    { label: 'Food Menu', url: '/' },
    { label: 'Order on Swiggy', url: 'https://www.swiggy.com/city/coimbatore/snack-exchange-saravanampatti-rest1417490' },
    { label: 'Justdial Profile', url: 'https://www.justdial.com/Coimbatore/Snack-Exchange-Saravanampatti/0422PX422-X422-260613000307-C2T3_BZDET/amp' },
  ],
  supportLinks: [
    { label: 'Follow on Instagram', url: 'https://www.instagram.com/_snack.exchange__?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==' },
    { label: 'Order via Swiggy', url: 'https://www.swiggy.com/city/coimbatore/snack-exchange-saravanampatti-rest1417490' },
    { label: 'View on Justdial', url: 'https://www.justdial.com/Coimbatore/Snack-Exchange-Saravanampatti/0422PX422-X422-260613000307-C2T3_BZDET/amp' },
    { label: 'Google Maps Directions', url: 'https://share.google/Fhxt9w4vHjqVJVK0w' },
  ],
  deliveryCities: ['Saravanampatti', 'Thudiyalur', 'Kalapatti', 'Keeranatham', 'Ganapathy', 'Coimbatore'],
  copyrightText: `© ${new Date().getFullYear()} Snack Exchange. Shop No. 8, Meena Food Court, Saravanampatti, Coimbatore. All rights reserved.`,
};

export function loadFooterConfig(): FooterConfig {
  try {
    const raw = localStorage.getItem(FOOTER_STORAGE_KEY);
    if (raw) return { ...DEFAULT_FOOTER_CONFIG, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_FOOTER_CONFIG;
}

export function saveFooterConfig(config: FooterConfig): void {
  localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(config));
}
