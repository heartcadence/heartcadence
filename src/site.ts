// Company facts used across the site. Change them here, not on each page.

export const SITE = {
  name: 'Heart Cadence Inc.',
  shortName: 'HCI',
  description:
    'Heart Cadence Inc. helps Canadian businesses choose, set up and run the phone, contact centre, network, security and service desk tools their teams and customers rely on. We also help vendors become Government-ready and submit stronger bids.',
  url: 'https://heartcadence.com',
  email: 'info@heartcadence.com',
  location: 'Brantford, Ontario',
  pbn: '794978619PG0001',
  // HCI LinkedIn company page. The footer icon shows only when this is set.
  linkedin: 'https://www.linkedin.com/company/heartcadence/',
  // Set PUBLIC_BOOKING_URL in .env (or in Cloudflare Pages settings) to the
  // Google Calendar appointment schedule booking page link.
  bookingUrl: import.meta.env.PUBLIC_BOOKING_URL || '',
};

export const NAV = [
  { href: '/services/', label: 'Services' },
  { href: '/how-we-work/', label: 'How we work' },
  { href: '/government/', label: 'Government' },
  { href: '/about/', label: 'About' },
  { href: '/resources/', label: 'Resources' },
];

// UNSPSC commodity codes for the work HCI does (KB-77). Shown on the
// For Government Buyers page and the French page. Every code here has been
// used on federal contracts in the CanadaBuys contract history.
// Keep this list in step with the codes in our CanadaBuys supplier profile.
// fr: our own French wording, not the official GC translation.
export const UNSPSC = [
  { group: 'Government procurement readiness', groupFr: 'Préparation aux marchés publics', codes: [
    { code: '80101706', en: 'Professional procurement services', fr: 'Services professionnels en approvisionnement' },
  ]},
  { group: 'Business consulting and customer experience', groupFr: 'Conseil en gestion et expérience client', codes: [
    { code: '80101500', en: 'Business and corporate management consultation services', fr: 'Services de conseil en gestion d’entreprise' },
    { code: '80101504', en: 'Strategic planning consultation services', fr: 'Services de conseil en planification stratégique' },
    { code: '80101702', en: 'Productivity or efficiency studies or implementation', fr: 'Études ou mise en œuvre en matière de productivité ou d’efficacité' },
  ]},
  { group: 'Project management', groupFr: 'Gestion de projet', codes: [
    { code: '80101600', en: 'Project management', fr: 'Gestion de projet' },
    { code: '80101604', en: 'Project administration or planning', fr: 'Administration ou planification de projet' },
  ]},
  { group: 'Service desk and IT service management (ITSM)', groupFr: 'Centre de services et gestion des services TI', codes: [
    { code: '81111811', en: 'Technical support or help desk services', fr: 'Services de soutien technique ou de centre d’assistance' },
    { code: '80161604', en: 'Information technology IT management services', fr: 'Services de gestion des technologies de l’information (TI)' },
    { code: '81161501', en: 'Software application administration service', fr: 'Services d’administration d’applications logicielles' },
  ]},
  { group: 'Phones, contact centre and networks', groupFr: 'Téléphonie, centre de contact et réseaux', codes: [
    { code: '81161700', en: 'Telecommunication services', fr: 'Services de télécommunications' },
  ]},
  { group: 'Cybersecurity', groupFr: 'Cybersécurité', codes: [
    { code: '81111801', en: 'Computer or network or internet security', fr: 'Sécurité informatique, des réseaux ou d’Internet' },
  ]},
  { group: 'Cloud, software and licensing', groupFr: 'Infonuagique, logiciels et licences', codes: [
    { code: '80101507', en: 'Information technology consultation services', fr: 'Services de conseil en technologies de l’information' },
    { code: '81162000', en: 'Cloud-based software as a service', fr: 'Logiciel infonuagique offert en tant que service' },
    { code: '81112501', en: 'Computer software licensing service', fr: 'Services d’octroi de licences de logiciels' },
    { code: '81112200', en: 'Software maintenance and support', fr: 'Maintenance et soutien de logiciels' },
  ]},
  { group: 'Technology selection and deployment', groupFr: 'Choix et déploiement de solutions technologiques', codes: [
    { code: '81111707', en: 'Systems planning services', fr: 'Services de planification de systèmes' },
    { code: '81111503', en: 'Systems integration design', fr: 'Conception de l’intégration de systèmes' },
    { code: '81111508', en: 'Application implementation services', fr: 'Services de mise en œuvre d’applications' },
  ]},
  { group: 'Mobility and IoT', groupFr: 'Mobilité et IdO', codes: [
    { code: '92121700', en: 'Security systems services', fr: 'Services de systèmes de sécurité' },
  ]},
];

// NAICS Canada 2022 Version 1.0 industry codes (Statistics Canada) that match the work
// HCI does and the provider categories we work with. Shown with the UNSPSC codes.
// Keep in step with the CanadaBuys supplier profile and SAP Ariba registration.
export const NAICS = [
  { code: '541611', en: 'Administrative management and general management consulting services', fr: 'Services de conseils en gestion administrative et générale' },
  { code: '541619', en: 'Other management consulting services', fr: 'Autres services de conseils en gestion' },
  { code: '541514', en: 'Computer systems design and related services (except video game design and development)', fr: 'Conception de systèmes informatiques et services connexes (sauf la conception et le développement de jeux vidéo)' },
  { code: '517911', en: 'Telecommunications resellers', fr: 'Revendeurs de services de télécommunications' },
  { code: '417310', en: 'Computer, computer peripheral and pre-packaged software merchant wholesalers', fr: 'Grossistes-marchands d’ordinateurs, de périphériques et de logiciels préemballés' },
];
