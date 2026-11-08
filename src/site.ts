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

// UNSPSC commodity codes for the work HCI does (KB-77). Shown on the
// For government buyers page and the French page. Every code here has been
// used on federal contracts in the CanadaBuys contract history.
// Keep this list in step with the codes in our CanadaBuys supplier profile.
// fr: our own French wording, not the official GC translation.
export const UNSPSC = [
  { group: 'Government procurement readiness', groupFr: 'Préparation aux marchés publics', codes: [
    { code: '80101706', en: 'Professional procurement services', fr: 'Services professionnels en approvisionnement' },
  ]},
  { group: 'Business consulting', groupFr: 'Conseil en gestion', codes: [
    { code: '80101500', en: 'Business and corporate management consultation services', fr: 'Services de conseil en gestion d’entreprise' },
    { code: '80101504', en: 'Strategic planning consultation services', fr: 'Services de conseil en planification stratégique' },
  ]},
  { group: 'Project management', groupFr: 'Gestion de projet', codes: [
    { code: '80101600', en: 'Project management', fr: 'Gestion de projet' },
    { code: '80101604', en: 'Project administration or planning', fr: 'Administration ou planification de projet' },
  ]},
  { group: 'IT management and cloud', groupFr: 'Gestion des TI et infonuagique', codes: [
    { code: '80101507', en: 'Information technology consultation services', fr: 'Services de conseil en technologies de l’information' },
    { code: '80161604', en: 'Information technology IT management services', fr: 'Services de gestion des technologies de l’information (TI)' },
    { code: '81162000', en: 'Cloud-based software as a service', fr: 'Logiciel infonuagique offert en tant que service' },
  ]},
  { group: 'Technology stack selection and deployment', groupFr: 'Choix et déploiement de solutions technologiques', codes: [
    { code: '81111707', en: 'Systems planning services', fr: 'Services de planification de systèmes' },
    { code: '81111503', en: 'Systems integration design', fr: 'Conception de l’intégration de systèmes' },
    { code: '81111508', en: 'Application implementation services', fr: 'Services de mise en œuvre d’applications' },
    { code: '81111801', en: 'Computer or network or internet security', fr: 'Sécurité informatique, des réseaux ou d’Internet' },
    { code: '81111811', en: 'Technical support or help desk services', fr: 'Services de soutien technique ou de centre d’assistance' },
  ]},
  { group: 'Business process improvement', groupFr: 'Amélioration des processus d’affaires', codes: [
    { code: '80101702', en: 'Productivity or efficiency studies or implementation', fr: 'Études ou mise en œuvre en matière de productivité ou d’efficacité' },
  ]},
];
