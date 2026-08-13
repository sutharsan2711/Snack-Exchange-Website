// Shared footer config type and localStorage helpers used by both
// the admin-panel's FooterSettings page and the customer-web's Footer component.

export interface FooterConfig {
  // Brand column
  brandName: string;
  brandTagline: string;
  twitterUrl: string;
  instagramUrl: string;
  githubUrl: string;

  // Company column
  companyLinks: { label: string; url: string }[];

  // Contact & Support column
  supportLinks: { label: string; url: string }[];

  // Delivery cities column
  deliveryCities: string[];

  // Bottom bar
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
