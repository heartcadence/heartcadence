// Scorecards at /scorecards/<slug>/ (KB-154 to KB-163).
// One shared engine (src/scripts/scorecard.ts). A new scorecard is new content here, no new code.
// DRAFT CONTENT: every word here is customer-facing and needs Jason's approval before go-live.
// Government facts must be checked against official Government of Canada sources.

export interface Tip { text: string; href?: string; linkText?: string }
export interface Category { id: string; name: string; tips: Tip[] }
export interface Question { cat: string; text: string }
export interface Extra { id: string; text: string; options?: string[] } // no options = free text
export interface Band { min: number; name: string; carrot: string; stick: string }
export interface Scorecard {
  slug: string;
  serviceAnchor?: string; // id of the matching card on /services/
  serviceHref: string;
  serviceLabel: string;
  cardTitle: string; // Resources page card and service card link
  cardText: string;
  title: string; // page heading and hook
  metaTitle: string;
  description: string; // under 160 characters
  lead: string;
  gets: string[];
  resultTitle: string; // "your ... readiness"
  categories: Category[];
  questions: Question[];
  extras: Extra[];
  bands: Band[];
  ctaHigh: { title: string; text: string };
}

// Answers and points. "Not sure" earns a little, since knowing you do not know is a start.
export const ANSWERS = [
  { key: 'yes', label: 'Yes', points: 1 },
  { key: 'no', label: 'No', points: 0 },
  { key: 'unsure', label: 'Not sure', points: 0.25 },
];

const HELP: Extra = {
  id: 'help',
  text: 'How would you like to make these improvements?',
  options: ['Do it myself with a good checklist', 'With expert help along the way', 'Have it done for me, start to finish'],
};

export const scorecards: Scorecard[] = [
  {
    slug: 'phone-system',
    serviceAnchor: 'phones-contact-centre',
    serviceHref: '/services/phones-contact-centre/',
    serviceLabel: 'See our phone and contact centre services',
    cardTitle: 'Phone system buyer checklist',
    cardText: 'Twelve quick questions to see if you are ready to switch business phone or contact centre providers.',
    title: 'Are you ready to choose a new phone system?',
    metaTitle: 'Phone system buyer scorecard',
    description: 'Answer 12 quick questions and see how ready your business is to choose a new phone or contact centre system. Free, about 2 minutes.',
    lead: 'Answer 12 quick questions and see how prepared you are before you talk to providers.',
    gets: ['A readiness score out of 100', 'Your score in 3 key areas', 'Practical tips for your weakest area', 'A printable report'],
    resultTitle: 'phone system readiness',
    categories: [
      { id: 'needs', name: 'Know your needs', tips: [
        { text: 'Sketch your call flow on one page: who answers, which departments, and what happens after hours.' },
        { text: 'List every tool the phone system must work with, such as your CRM, Microsoft Teams or help desk.' },
        { text: 'Decide if your team needs call queues, callbacks and reports before you sit through any demos.' },
      ]},
      { id: 'costs', name: 'Costs and contract', tips: [
        { text: 'Pull your last 3 phone bills and count your users and monthly calls.' },
        { text: 'Find your contract end date and the cost to leave early.' },
        { text: 'Ask each provider for the full cost over the contract: monthly per user, setup, hardware and terms.' },
      ]},
      { id: 'switch', name: 'Ready to switch', tips: [
        { text: 'Ask each provider, in writing, how 911 finds each user’s location, including remote staff.' },
        { text: 'Confirm you can keep every phone number, and ask where call data and recordings are stored.' },
        { text: 'Set a switch-over date, a short training plan and a fallback if something goes wrong.' },
      ]},
    ],
    questions: [
      { cat: 'costs', text: 'I know how many users we have and roughly how many calls we handle each month.' },
      { cat: 'costs', text: 'I know when our current contract ends and what it costs to leave early.' },
      { cat: 'needs', text: 'We know how calls should be routed: auto attendant, departments and after-hours rules.' },
      { cat: 'needs', text: 'We know which tools the phone system must connect to, such as our CRM, Microsoft Teams or help desk.' },
      { cat: 'needs', text: 'We know whether we need contact centre features like call queues, callbacks and reporting.' },
      { cat: 'switch', text: 'The provider has explained how 911 knows each user’s location, including remote workers.' },
      { cat: 'switch', text: 'We can keep all our existing phone numbers, and we know where our call data is stored.' },
      { cat: 'costs', text: 'We have the full cost: monthly per user, one-time setup, hardware and contract terms.' },
      { cat: 'switch', text: 'We have a switch-over plan with a date, staff training and a backup plan.' },
    ],
    extras: [
      { id: 'timing', text: 'When do you plan to make a change?', options: ['Within 3 months', 'In 3 to 6 months', 'In 6 to 12 months', 'Just researching for now'] },
      { id: 'obstacle', text: 'What is your biggest obstacle right now?', options: ['Not enough time', 'Hard to compare providers', 'Locked into a contract', 'Getting budget approved', 'Getting staff on board'] },
      HELP,
    ],
    bands: [
      { min: 0, name: 'Early stage',
        stick: 'A phone contract can last for years. Choosing before you know your needs can mean paying for features you never use, or missing ones you rely on.',
        carrot: 'A few hours of planning now gives you clear quotes you can compare side by side.' },
      { min: 50, name: 'Getting there',
        stick: 'Gaps left until switch-over day are the ones that cause dropped calls, lost numbers and surprise costs.',
        carrot: 'Close the gaps below and you will be ready to compare providers with confidence.' },
      { min: 80, name: 'Ready to buy',
        stick: 'The main risk now is a quote that hides costs, or a switch-over plan with no fallback.',
        carrot: 'You know what you need. The next step is getting quotes that match it.' },
    ],
    ctaHigh: { title: 'Get your quotes checked', text: 'Send us your quotes and we will help you compare them line by line before you sign.' },
  },

  {
    slug: 'service-desk',
    serviceAnchor: 'service-desk',
    serviceHref: '/services/service-desk-itsm/',
    serviceLabel: 'See our service desk services',
    cardTitle: 'Service desk health check',
    cardText: 'Twelve quick questions to see how your support desk is doing, based on ITIL 4 practice.',
    title: 'How healthy is your service desk?',
    metaTitle: 'Service desk health check',
    description: 'Answer 12 quick questions and see how well your service desk handles requests, fixes and reporting. Based on ITIL 4 practice. Free, about 2 minutes.',
    lead: 'Answer 12 quick questions about how your team handles requests, fixes issues and tracks results.',
    gets: ['A health score out of 100', 'Your score in 3 key areas', 'Practical tips for your weakest area', 'A printable report'],
    resultTitle: 'service desk health',
    categories: [
      { id: 'help', name: 'Getting help', tips: [
        { text: 'Give staff one front door for help, such as a portal or one email address, and log every request there.' },
        { text: 'Look at your 20 most common tickets and write a short help article for each one.' },
        { text: 'Write standard steps for your top 5 requests, such as new accounts, access and password resets.' },
      ]},
      { id: 'fix', name: 'Fixing issues', tips: [
        { text: 'Agree on simple priority rules based on how many people are affected and how urgent it is.' },
        { text: 'Hold a short weekly review of repeat issues, and assign someone to find the root cause of each one.' },
        { text: 'Review risky changes before they happen, with a plan to undo them if something breaks.' },
      ]},
      { id: 'measure', name: 'Measuring results', tips: [
        { text: 'Set 2 or 3 targets, such as first response time and fix time by priority, and report on them monthly.' },
        { text: 'Send a one-question satisfaction survey when a ticket is closed.' },
        { text: 'List the features you pay for in your help desk tool and check which ones the team actually uses.' },
      ]},
    ],
    questions: [
      { cat: 'help', text: 'Staff have one place to ask for help, and every request gets logged.' },
      { cat: 'help', text: 'Staff can find answers on their own in a help centre or knowledge base.' },
      { cat: 'help', text: 'Common requests, like new accounts or password resets, follow standard steps.' },
      { cat: 'fix', text: 'Everyone agrees on how urgent an issue is, using clear priority rules.' },
      { cat: 'fix', text: 'When the same issue keeps happening, someone finds and fixes the root cause.' },
      { cat: 'fix', text: 'Changes to our systems are reviewed and planned before they happen.' },
      { cat: 'measure', text: 'We have agreed response and fix times, and we track whether we meet them.' },
      { cat: 'measure', text: 'We regularly ask staff how happy they are with the help they get.' },
      { cat: 'measure', text: 'Our help desk tool does what we need, and the team uses it fully.' },
    ],
    extras: [
      { id: 'timing', text: 'When do you want to improve your service desk?', options: ['Within 3 months', 'In 3 to 6 months', 'In 6 to 12 months', 'Just researching for now'] },
      { id: 'obstacle', text: 'What is your biggest obstacle right now?', options: ['Not enough people', 'Our tool does not fit', 'No clear process', 'No time to improve', 'Getting budget approved'] },
      HELP,
    ],
    bands: [
      { min: 0, name: 'Needs attention',
        stick: 'When requests get lost and issues repeat, staff lose hours waiting and your support team spends its days firefighting.',
        carrot: 'A few basic practices, done well, make support faster and calmer for everyone.' },
      { min: 50, name: 'Solid base',
        stick: 'Gaps in root-cause fixes and measuring mean the same problems keep costing you time.',
        carrot: 'Close the gaps below to move from reacting to improving.' },
      { min: 80, name: 'Healthy',
        stick: 'The risk now is drift. Good habits slip when the team changes or ticket volume grows.',
        carrot: 'Your service desk has strong habits. The next step is fine-tuning and showing its value to leadership.' },
    ],
    ctaHigh: { title: 'Get an outside view', text: 'We can review your setup and reports and point out the next improvements worth making.' },
  },

  {
    slug: 'government-ready',
    serviceHref: '/government/',
    serviceLabel: 'See how we help with Government contracts',
    cardTitle: 'Government-ready checklist',
    cardText: 'Twelve quick questions to see what you have in place, and what is missing, before you bid.',
    title: 'Are you ready to bid on Government contracts?',
    metaTitle: 'Government-ready scorecard',
    description: 'Answer 12 quick questions and see what your business has in place, and what is missing, before you bid on federal contracts. Free, about 2 minutes.',
    lead: 'Answer 12 quick questions and see what you have in place, and what is missing, before you bid on a federal contract.',
    gets: ['A readiness score out of 100', 'Your score in 3 key areas', 'Practical tips with links to official sources', 'A printable report'],
    resultTitle: 'Government readiness',
    categories: [
      { id: 'register', name: 'Registration', tips: [
        { text: 'Get a business number from the Canada Revenue Agency. It is the starting point for registering as a federal supplier.',
          href: 'https://canadabuys.canada.ca/en/getting-started/preparing-sell-government', linkText: 'CanadaBuys: preparing to sell to the Government' },
        { text: 'Check whether you must register for GST/HST. You must register once your taxable sales pass $30,000 in one calendar quarter or over four quarters in a row.',
          href: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/when-register-charge', linkText: 'CRA: when to register for GST/HST' },
        { text: 'Register as a supplier in SAP Business Network and complete your profile before you need it. Many federal tenders are bid through it.' },
        { text: 'Find the UNSPSC and NAICS codes that describe what you sell, and use them to set up saved searches on CanadaBuys.' },
      ]},
      { id: 'bid', name: 'Bid readiness', tips: [
        { text: 'Write a one-page capability statement: what you do, your codes, relevant past work and who to contact.' },
        { text: 'Line up 2 or 3 references for similar work, and ask their permission before you list them.' },
        { text: 'Read a full solicitation before you need to bid on one. Note the mandatory requirements, the evaluation criteria and the pricing format.' },
        { text: 'Procurement Assistance Canada offers free seminars and help for businesses new to federal bidding.',
          href: 'https://canada.ca/pac', linkText: 'Procurement Assistance Canada' },
      ]},
      { id: 'comply', name: 'Compliance', tips: [
        { text: 'Prepare your list of names for integrity verification. For a private corporation, this means all directors and anyone with 5% or more ownership. Leaving it out can disqualify a bid.',
          href: 'https://www.canada.ca/en/public-services-procurement/services/standards-oversight/supplier-integrity-compliance/supplier-guidance/required-information.html', linkText: 'PSPC: information to submit with a bid' },
        { text: 'You cannot apply for security screening on your own. A government department or a cleared contractor must sponsor your organization through the Contract Security Program.',
          href: 'https://www.canada.ca/en/public-services-procurement/services/industrial-security/security-requirements-contracting/organization-security-screening/sponsorship-process.html', linkText: 'PSPC: Contract Security Program sponsorship' },
        { text: 'Read the insurance clauses in solicitations you want, and talk to your broker before you bid.' },
      ]},
    ],
    questions: [
      { cat: 'register', text: 'We have a business number from the Canada Revenue Agency.' },
      { cat: 'register', text: 'We are registered as a supplier in SAP Business Network, used to bid on CanadaBuys tenders.' },
      { cat: 'register', text: 'We know the UNSPSC and NAICS codes that describe what we sell.' },
      { cat: 'bid', text: 'We have an up-to-date one-page capability statement.' },
      { cat: 'bid', text: 'We have 2 or 3 recent references who can speak to similar work.' },
      { cat: 'bid', text: 'We have read a full federal solicitation and know how bids are evaluated and priced.' },
      { cat: 'comply', text: 'We can provide the list of names, such as directors and owners, needed for integrity checks.' },
      { cat: 'comply', text: 'We know whether the contracts we want need security screening, and how sponsorship works.' },
      { cat: 'comply', text: 'We have the business insurance that contracts commonly ask for, such as general liability.' },
    ],
    extras: [
      { id: 'timing', text: 'When do you plan to bid on a Government contract?', options: ['Within 3 months', 'In 3 to 6 months', 'In 6 to 12 months', 'Just researching for now'] },
      { id: 'obstacle', text: 'What is your biggest obstacle right now?', options: ['Finding the right opportunities', 'Understanding the bid documents', 'Time to write bids', 'Security requirements', 'Pricing a bid'] },
      HELP,
    ],
    bands: [
      { min: 0, name: 'Getting started',
        stick: 'A missing registration or form can set a bid aside before anyone reads it.',
        carrot: 'Most of these steps are free, and you can finish them before you find a tender you want.' },
      { min: 50, name: 'Almost ready',
        stick: 'A bid can be disqualified for one missing form or one missed mandatory requirement.',
        carrot: 'Close the gaps below and you will be ready to bid when the right tender appears.' },
      { min: 80, name: 'Bid ready',
        stick: 'The risk now is spending time on bids that are a poor fit for your business.',
        carrot: 'You have the basics in place. The next step is choosing the right opportunities and writing strong bids.' },
    ],
    ctaHigh: { title: 'Get a second set of eyes', text: 'We can review your next bid with you, against every requirement, before you submit it.' },
  },
];

export const scorecardForService = (anchor: string) => scorecards.find((s) => s.serviceAnchor === anchor);
export const scorecardForServicePage = (href: string) => scorecards.find((s) => s.serviceHref === href);
