// Content for the individual service pages at /services/<slug>/.
// Keep facts here confirmed. Never add results, clients or credentials we do not have.

export interface ServicePage {
  slug: string;
  anchor: string; // matching section id on /services/
  title: string; // browser tab and Google title (site name is added)
  heading: string;
  description: string; // under 160 characters
  intro: string;
  image: string;
  signs: string[];
  work: string[];
  steps: { title: string; text: string }[];
  toolsNote?: string;
  providers: string[];
  area?: string; // filter on /technology-providers/
  areaLabel?: string;
  lead: { name: string; role: string; text: string; certs?: string[] };
  faqs: { q: string; a: string }[];
  cta: { title: string; text: string };
}

const jason = {
  name: 'Jason K. McEwan',
  role: 'Founder and Principal Consultant',
};

export const servicePages: ServicePage[] = [
  {
    slug: 'service-desk-itsm',
    anchor: 'service-desk',
    title: 'Service desk and ITSM consulting for Canadian businesses',
    heading: 'Service desk and ITSM consulting',
    description:
      'Service desk and ITSM consulting for Canadian businesses. ITIL 4 based process design, platform setup and training. Authorized ManageEngine reseller.',
    intro:
      'A service desk your staff and customers can count on. We review how support works today, design a clear process based on ITIL 4 practice, and set up the tools to run it.',
    image: '/images/service-service-desk.webp',
    signs: [
      'Requests arrive by email, phone and hallway chats, and some get lost',
      'The same issues keep coming back',
      'No one agrees on what is urgent',
      'You cannot say how long fixes take',
      'You pay for a help desk tool your team does not fully use',
    ],
    work: [
      'Review your current support process, tools and ticket volumes',
      'Design ticket categories, priorities, service levels and escalation paths',
      'Set up your ITSM platform, including a self-service portal, knowledge base and asset tracking',
      'Set up incident, problem, change and request processes based on ITIL practices',
      'Build reports on response times and repeat issues',
      'Train your service desk team',
      'Arrange an outsourced help desk if you need extra coverage',
    ],
    steps: [
      { title: 'Fit call', text: 'We learn how support works today and what is not working.' },
      { title: 'Review', text: 'We look at your tickets, tools and process, and share what we find in plain language.' },
      { title: 'Plan', text: 'A clear recommendation, with priorities, owners and dates.' },
      { title: 'Set up and support', text: 'We configure the platform, train your team and stay your point of contact.' },
    ],
    toolsNote: 'We are an authorized ManageEngine reseller. If another platform fits your business better, we will tell you.',
    providers: ['ManageEngine'],
    lead: {
      ...jason,
      text: 'Jason has about 20 years in IT, with deep expertise in service desk and IT service management.',
      certs: [
        'ITIL 4 Foundation',
        'ITIL 4 Specialist: Create, Deliver and Support',
        'ITIL 4 Strategist: Direct, Plan and Improve',
      ],
    },
    faqs: [
      { q: 'Do we have to replace our current tool?', a: 'Not always. We start by checking whether your current tool can do the job with better setup.' },
      { q: 'What is ITIL, and do we need it?', a: 'ITIL is a widely used set of practices for running IT services. We use the parts that fit your size, not the whole framework.' },
      { q: 'How long does a setup take?', a: 'It depends on your size and how many processes you need. You get dates in the plan after the review.' },
      { q: 'Can you run our help desk for us?', a: 'We can arrange an outsourced help desk through our providers, and set it up so it follows your process.' },
    ],
    cta: { title: 'Want a service desk that works?', text: 'Book a call. We will look at how support runs today and where to start.' },
  },
  {
    slug: 'phones-contact-centre',
    anchor: 'phones-contact-centre',
    title: 'Business phone and contact centre consulting in Canada',
    heading: 'Business phones and contact centre',
    description:
      'Compare and set up business phone (UCaaS) and contact centre (CCaaS) systems for your Canadian business. We are not tied to any one brand.',
    intro:
      'Business phones (UCaaS), contact centre (CCaaS), call recording, chat, text and AI agents. We compare the options that fit your size and budget, then manage the switch with you.',
    image: '/images/service-phones-contact-centre.webp',
    signs: [
      'Your phone system is old, or your contract is ending soon',
      'Calls get missed, dropped or passed around',
      'Your team uses separate tools for calls, chat and text',
      'You cannot see call volumes, wait times or outcomes',
      'Your copper phone lines are being retired',
    ],
    work: [
      'Review your current setup, contracts and costs',
      'Compare providers that fit your size and budget',
      'Plan call flows, menus and routing',
      'Manage number transfers and setup',
      'Connect your phone system to your CRM and other tools',
      'Train your team',
      'Stay your point of contact after go-live',
    ],
    steps: [
      { title: 'Fit call', text: 'We learn how calls and messages reach your team today.' },
      { title: 'Review', text: 'We look at your current system, contracts, costs and call patterns.' },
      { title: 'Plan', text: 'A side-by-side comparison of the options that fit, with our recommendation.' },
      { title: 'Set up and support', text: 'We manage the number transfers and setup, train your team and stay your contact.' },
    ],
    providers: ['RingCentral', 'Zoom', '8x8', 'Dialpad', 'Nextiva', 'Genesys', 'Five9', 'Talkdesk'],
    area: 'Unified communications',
    areaLabel: 'phone and contact centre',
    lead: {
      name: 'The HCI team',
      role: 'Jason K. McEwan and Rory Stennett',
      text: 'Jason brings about 20 years in IT. Rory brings deep expertise in customer experience and customer journey design, so the setup works for your customers as well as your team.',
    },
    faqs: [
      { q: 'What is the difference between UCaaS and CCaaS?', a: 'UCaaS is your business phone system, with calling, video and chat for staff. CCaaS is a contact centre platform for teams that handle customer calls and messages, with queues, routing and reporting.' },
      { q: 'Can we keep our phone numbers?', a: 'In most cases, yes. We manage the number transfer with your new provider.' },
      { q: 'Do you only recommend one brand?', a: 'No. We work with many providers and recommend the one that fits your business.' },
      { q: 'What happens to our old copper lines?', a: 'We help you move them to internet or cellular options before they are retired.' },
    ],
    cta: { title: 'Thinking about switching phone systems?', text: 'Book a call. We will look at what you have today and compare the options that fit.' },
  },
  {
    slug: 'customer-experience',
    anchor: 'customer-experience',
    title: 'Customer experience and customer journey consulting in Canada',
    heading: 'Customer experience consulting',
    description:
      'Customer experience and journey design for Canadian businesses. Find where customers wait or give up, then fix the process and the tools.',
    intro:
      'We look at every way customers reach you, and what happens next. Then we fix the gaps, in the process and in the tools.',
    image: '/images/service-customer-experience.webp',
    signs: [
      'Customers have to repeat themselves',
      'Response times depend on who picks up',
      'Complaints keep coming back to the same issues',
      'Each team sees only its part of the customer',
      'You are not sure where customers drop off',
    ],
    work: [
      'Map the journey from first contact to follow-up',
      'Find where customers wait, repeat themselves or give up',
      'Design simple processes your team can follow',
      'Choose and set up the tools that support them',
      'Set up ways to measure what customers experience',
    ],
    steps: [
      { title: 'Fit call', text: 'We learn who your customers are and how they reach you.' },
      { title: 'Review', text: 'We map the journey and show where it breaks down.' },
      { title: 'Plan', text: 'Clear fixes, in order of impact, with owners and dates.' },
      { title: 'Set up and support', text: 'We put the changes in place with your team and check that they work.' },
    ],
    providers: ['Genesys', 'Five9', 'Talkdesk', 'NICE', 'Sprinklr'],
    area: 'Contact centre and CX',
    areaLabel: 'customer experience',
    lead: {
      name: 'Rory Stennett',
      role: 'Director, Client Experience and Growth',
      text: 'Rory is an expert in customer experience and customer journey design. He helps clients shape how customers experience their business, so those customers want to come back.',
    },
    faqs: [
      { q: 'What is a customer journey map?', a: 'A simple picture of every step a customer takes with your business, from first contact to follow-up, and how it feels at each step.' },
      { q: 'Do we need new software?', a: 'Not always. Many fixes are process changes. When a tool will help, we compare the options and set up the one you choose.' },
      { q: 'Is this only for contact centres?', a: 'No. It covers every way customers reach you, including phone, email, chat, your website and in person.' },
    ],
    cta: { title: 'Want to see your business through your customers’ eyes?', text: 'Book a call. We will talk about how customers reach you today and where they get stuck.' },
  },
  {
    slug: 'cybersecurity',
    anchor: 'cybersecurity',
    title: 'Cybersecurity services for small and mid-sized Canadian businesses',
    heading: 'Cybersecurity for small and mid-sized businesses',
    description:
      'Cybersecurity for Canadian small and mid-sized businesses: assessments, managed detection and response, endpoint protection and staff training.',
    intro:
      'Find the gaps, close them and watch for threats. We help you choose and set up security that fits your size, not a big-company price tag.',
    image: '/images/service-cybersecurity.webp',
    signs: [
      'You do not know where your biggest risks are',
      'Your cyber insurance or a client is asking for security controls',
      'No one is watching for threats after hours',
      'Staff have not had security training',
      'You do not have a plan for what to do if something happens',
    ],
    work: [
      'Security assessments',
      'Managed detection and response',
      'Firewall and endpoint protection',
      'Email security',
      'Staff training',
      'Compliance support',
      'Incident response planning',
    ],
    steps: [
      { title: 'Fit call', text: 'We learn about your business, your data and what is driving the need.' },
      { title: 'Review', text: 'We look at your current protection and arrange an assessment if needed.' },
      { title: 'Plan', text: 'Fixes ranked by risk and cost, so you know what to do first.' },
      { title: 'Set up and support', text: 'We set up the services you choose and stay your point of contact.' },
    ],
    providers: ['eSentire', 'Field Effect', 'Akamai Technologies, Inc', 'Appgate Cybersecurity', 'Drata'],
    area: 'Cybersecurity',
    areaLabel: 'cybersecurity',
    lead: {
      ...jason,
      text: 'Jason has about 20 years in IT and leads technology work for HCI clients.',
    },
    faqs: [
      { q: 'What is managed detection and response?', a: 'A service where a security team watches your systems around the clock and responds to threats, so you do not need your own security staff.' },
      { q: 'Where should a small business start?', a: 'Usually with an assessment. It shows your biggest risks so you can fix the most important things first.' },
      { q: 'Can you help with cyber insurance requirements?', a: 'Yes. We help you understand the controls your insurer asks for and set up the ones you are missing.' },
    ],
    cta: { title: 'Not sure where your risks are?', text: 'Book a call. We will talk about your setup and where to start.' },
  },
];
