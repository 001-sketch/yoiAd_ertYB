export const NAV_LINKS = [
  { label: "Feed", href: "feed" },
  { label: "Nairobi", href: "feed", category: 'local' },
  { label: "Global", href: "feed", category: 'international' },
  { label: "Subscribe", href: "subscribe" },
];

export const CATEGORIES = [
  { id: 'local', label: 'Nairobi Tech', description: 'Silicon Savannah innovations and startup ecosystem.' },
  { id: 'international', label: 'Global Tech', description: 'Worldwide breakthroughs and industry updates.' },
] as const;

export const TIMEFRAMES = [
  { id: 'week', label: 'Past Week' },
  { id: 'today', label: 'Today' },
  { id: 'future', label: 'Upcoming' },
] as const;

export const SITE_NAME = 'Byte_daily';
export const SITE_DESCRIPTION = 'Precision tech journalism from Nairobi to the world.';

export const FOOTER_SECTIONS = [
  {
    title: "Discovery",
    links: [
      { label: "Latest Feed", href: "feed" },
      { label: "Nairobi Pulse", href: "feed", category: 'local' },
      { label: "Global Trends", href: "feed", category: 'international' },
    ]
  },
  {
    title: "Protocol",
    links: [
      { label: "Privacy Policy", href: "info/privacy" },
      { label: "Terms of Service", href: "info/terms" },
      { label: "Editorial Guidelines", href: "info/guidelines" },
    ]
  },
  {
    title: "Connection",
    links: [
      { label: "Contact Intelligence", href: "info/contact" },
      { label: "Newsletter", href: "subscribe" },
      { label: "Media Kit", href: "info/media" },
    ]
  }
];
