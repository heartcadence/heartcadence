// Company facts used across the site. Change them here, not on each page.

export const SITE = {
  name: 'Heart Cadence Inc.',
  shortName: 'HCI',
  description:
    'Heart Cadence helps Canadian businesses become government-ready, submit stronger bids, and deliver public sector contracts with confidence.',
  url: 'https://heartcadence.com',
  email: 'info@heartcadence.com',
  location: 'Brantford, Ontario',
  pbn: '794978619PG0001',
  // Set PUBLIC_BOOKING_URL in .env (or in Cloudflare Pages settings) to the
  // Google Calendar appointment schedule booking page link.
  bookingUrl: import.meta.env.PUBLIC_BOOKING_URL || '',
};

export const NAV = [
  { href: '/services/', label: 'Services' },
  { href: '/how-we-work/', label: 'How we work' },
  { href: '/government-buyers/', label: 'For government buyers' },
  { href: '/about/', label: 'About' },
  { href: '/resources/', label: 'Resources' },
];
