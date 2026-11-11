// Role cuts of the Bangalore query ad. Each role swaps the hook pill, the typed query + chips,
// and the six candidate cards. Faces/names/matches/slots stay fixed: they are tied to the radar
// (PICKS) and the booking ticket. pillEm = pill width in em at Obviously Narrow Black Italic
// (measured with fontTools; an "&" counts as Impact 0.576em × 1.09) so BoltPill can shrink long lines to fit.
export type Person = { face: number; name: string; role: string; co: string; yrs: number; match: number; slot: string; skills: string[]; photo?: string; fx?: number };
// a role cut's own people for slots 0–2 (photo = public/people/<photo>.jpg + <photo>_sq.jpg, fx = face x in the 3:2 crop)
export type TrioPerson = { name: string; photo: string; fx: number };
export type Role = { pill: string; pillEm: number; file: string; query: (city: string) => string; tags: (city: string) => string[]; people: Person[] };

const BASE = [
  { face: 1, name: "Sahil Mehta", match: 91, slot: "Thu 09, 12:00 PM" },
  { face: 2, name: "Riya Nair", match: 94, slot: "Wed 08, 11:00 AM" },
  { face: 6, name: "Rahul Shetty", match: 90, slot: "Fri 10, 03:00 PM" },
  { face: 12, name: "Divya Hegde", match: 88, slot: "Wed 08, 11:00 AM" },
  { face: 16, name: "Vikram Rao", match: 87, slot: "Thu 09, 12:00 PM" },
  { face: 17, name: "Priya Gowda", match: 89, slot: "Fri 10, 03:00 PM" },
];
// [role, company, years, skills] for the six people in BASE order; [1] is the hero (top pick)
const cast = (rows: [string, string, number, string[]][]): Person[] => rows.map(([role, co, yrs, skills], i) => ({ ...BASE[i], role, co, yrs, skills }));

const ENGINEERS = cast([
  ["Backend Lead", "Flipkart", 8, ["Go", "Kafka", "AWS"]],
  ["SDE-3", "Zepto", 6, ["Go", "Kafka", "Postgres", "Startup exp"]],
  ["Senior SDE", "Razorpay", 7, ["Java", "Redis", "gRPC"]],
  ["SDE-2", "Swiggy", 5, ["Node", "Postgres"]],
  ["Platform Eng", "Meesho", 6, ["K8s", "Go"]],
  ["SDE-3", "Groww", 7, ["Python", "Kafka"]],
]);
const LEADERS = cast([
  ["VP Product", "Swiggy", 14, ["B2C", "Scale", "P&L"]],
  ["Product Director", "Zepto", 12, ["B2C", "Fintech", "P&L", "Team of 30"]],
  ["Head of Product", "Razorpay", 13, ["Payments", "B2B"]],
  ["Group PM", "Flipkart", 11, ["Marketplace", "Scale"]],
  ["VP Product", "Meesho", 15, ["B2C", "Scale"]],
  ["Product Director", "Groww", 12, ["Fintech", "Investing"]],
]);
const GCC = cast([
  ["Eng Manager", "Walmart", 12, ["Java", "Scale", "Hiring"]],
  ["Eng Manager", "Intuit", 11, ["Java", "AWS", "Team of 15", "GCC exp"]],
  ["Senior EM", "Target", 13, ["Platform", "Java"]],
  ["Eng Manager", "Lowe’s", 10, ["Cloud", "Agile"]],
  ["Senior EM", "Goldman Sachs", 14, ["Java", "Risk"]],
  ["Eng Manager", "JPMorgan", 11, ["Java", "Payments"]],
]);
const gccQ = { query: (c: string) => `Engineering Manager in ${c}. Java, 10+ yrs.`, tags: (c: string) => ["Engineering Manager", c, "Java", "10+ yrs"] };
const engineersQ = { query: (c: string) => `Senior Backend Engineer in ${c}. Go, Kafka, 5+ yrs.`, tags: (c: string) => ["Senior Backend", c, "Go", "Kafka", "5+ yrs"] };
const leadersQ = { query: (c: string) => `Head of Product in ${c}. 10+ yrs, led teams of 20+.`, tags: (c: string) => ["Head of Product", c, "10+ yrs", "Led teams of 20+"] };

export const ROLES = {
  engineers: { pill: "HIRE SOFTWARE ENGINEERS", pillEm: 10.528, file: "Hire Software Engineers", ...engineersQ, people: ENGINEERS },
  pm: {
    pill: "HIRE PRODUCT MANAGERS", pillEm: 10.073, file: "Hire Product Managers",
    query: (c) => `Product Manager in ${c}. B2C, growth, 4+ yrs.`,
    tags: (c) => ["Product Manager", c, "B2C", "Growth", "4+ yrs"],
    people: cast([
      ["Senior PM", "Flipkart", 8, ["B2C", "Growth", "SQL"]],
      ["Product Lead", "Zepto", 6, ["B2C", "Growth", "SQL", "Startup exp"]],
      ["Senior PM", "Razorpay", 7, ["Payments", "B2B", "SQL"]],
      ["PM-2", "Swiggy", 5, ["Growth", "A/B tests"]],
      ["Group PM", "Meesho", 9, ["Marketplace", "B2C"]],
      ["Senior PM", "Groww", 7, ["Fintech", "Growth"]],
    ]),
  },
  designer: {
    pill: "HIRE DESIGNERS", pillEm: 6.283, file: "Hire Designers",
    query: (c) => `Product Designer in ${c}. Mobile, Figma, 4+ yrs.`,
    tags: (c) => ["Product Designer", c, "Mobile", "Figma", "4+ yrs"],
    people: cast([
      ["Staff Designer", "Flipkart", 8, ["Mobile", "Figma", "Systems"]],
      ["Design Lead", "Zepto", 6, ["Mobile", "Figma", "Motion", "B2C"]],
      ["UX Lead", "Razorpay", 7, ["Fintech", "Figma", "Research"]],
      ["Designer II", "Swiggy", 5, ["Mobile", "Figma"]],
      ["Design Manager", "Meesho", 9, ["Systems", "Hiring"]],
      ["Senior Designer", "Groww", 7, ["Fintech", "Motion"]],
    ]),
  },
  marketer: {
    pill: "HIRE MARKETERS", pillEm: 6.595, file: "Hire Marketers",
    query: (c) => `Growth Marketer in ${c}. D2C, performance, 4+ yrs.`,
    tags: (c) => ["Growth Marketer", c, "D2C", "Performance", "4+ yrs"],
    people: cast([
      ["Brand Lead", "Swiggy", 8, ["Brand", "Content", "PR"]],
      ["Growth Lead", "Licious", 6, ["D2C", "Meta ads", "CRM", "SEO"]],
      ["Growth Manager", "Myntra", 7, ["Performance", "Google ads"]],
      ["CRM Lead", "Zepto", 5, ["CRM", "Retention"]],
      ["Marketing Manager", "Meesho", 6, ["Paid", "Analytics"]],
      ["Content Lead", "Nykaa", 7, ["Content", "Social"]],
    ]),
  },
  bd: {
    pill: "HIRE BD MANAGERS", pillEm: 7.529, file: "Hire BD Managers",
    query: (c) => `Business Development Lead in ${c}. SaaS, 5+ yrs.`,
    tags: (c) => ["Business Development", c, "SaaS", "5+ yrs"],
    people: cast([
      ["BD Lead", "Razorpay", 8, ["Enterprise", "Fintech", "SaaS"]],
      ["BD Manager", "Zeta", 6, ["SaaS", "Enterprise", "Banks", "APAC"]],
      ["BD Manager", "Juspay", 7, ["Payments", "Partners"]],
      ["Senior BDE", "Udaan", 5, ["B2B", "Sales"]],
      ["BD Lead", "Meesho", 6, ["Merchants", "B2B"]],
      ["BD Manager", "Swiggy", 7, ["Restaurants", "Ops"]],
    ]),
  },
  sales: {
    pill: "HIRE SALESPEOPLE", pillEm: 7.135, file: "Hire Salespeople",
    query: (c) => `Sales Manager in ${c}. B2B SaaS, enterprise, 5+ yrs.`,
    tags: (c) => ["Sales Manager", c, "B2B SaaS", "Enterprise", "5+ yrs"],
    people: cast([
      ["Senior AE", "Sprinklr", 8, ["Enterprise", "SaaS", "US"]],
      ["Sales Manager", "Razorpay", 6, ["B2B SaaS", "Enterprise", "CRM"]],
      ["Senior AE", "LeadSquared", 7, ["SaaS", "Mid-market"]],
      ["Account Exec", "Zeta", 5, ["BFSI", "SaaS"]],
      ["Sales Lead", "Juspay", 6, ["Payments", "Enterprise"]],
      ["Sales Manager", "Practo", 7, ["Healthtech", "Field"]],
    ]),
  },
  strategy: {
    pill: "HIRE FOR STRATEGY ROLES", pillEm: 10.024, file: "Hire for Strategy Roles",
    query: (c) => `Strategy Manager in ${c}. Consulting, MBA.`,
    tags: (c) => ["Strategy Manager", c, "Consulting", "MBA"],
    people: cast([
      ["Strategy Lead", "Flipkart", 8, ["Ex-McKinsey", "MBA"]],
      ["Strategy Manager", "Swiggy", 6, ["Ex-BCG", "MBA", "SQL", "Startup exp"]],
      ["BizOps Lead", "Groww", 7, ["Ex-Bain", "Ops"]],
      ["Strategy Manager", "Zepto", 5, ["MBA", "Pricing"]],
      ["Chief of Staff", "Meesho", 6, ["MBA", "Ops"]],
      ["Strategy Lead", "Udaan", 7, ["Ex-Kearney", "B2B"]],
    ]),
  },
  generalist: {
    pill: "HIRE GENERALISTS", pillEm: 7.05, file: "Hire Generalists",
    query: (c) => `Generalist for Founder’s Office in ${c}. 3+ yrs.`,
    tags: (c) => ["Generalist", "Founder’s Office", c, "3+ yrs"],
    people: cast([
      ["Chief of Staff", "Flipkart", 8, ["Founder’s Office", "Ops"]],
      ["Founder’s Office", "Zepto", 6, ["Ops", "Growth", "SQL", "Startup exp"]],
      ["Program Manager", "Razorpay", 7, ["Ops", "Launches"]],
      ["BizOps Manager", "Groww", 5, ["Ops", "SQL"]],
      ["Chief of Staff", "Jupiter", 6, ["Strategy", "Ops"]],
      ["Founder’s Office", "Swiggy", 7, ["Growth", "Ops"]],
    ]),
  },
  partnerships: {
    pill: "HIRE PARTNERSHIP MANAGERS", pillEm: 11.815, file: "Hire Partnership Managers",
    query: (c) => `Partnerships Manager in ${c}. Fintech, 5+ yrs.`,
    tags: (c) => ["Partnerships Manager", c, "Fintech", "5+ yrs"],
    people: cast([
      ["Alliances Lead", "Razorpay", 8, ["Fintech", "Banks", "Alliances"]],
      ["Partnerships Lead", "Zepto", 6, ["Fintech", "Banks", "Alliances", "APIs"]],
      ["Alliances Lead", "Swiggy", 7, ["Brands", "Co-marketing"]],
      ["Partnerships Manager", "Dunzo", 5, ["Brands", "Retail"]],
      ["Alliances Manager", "Flipkart", 6, ["Sellers", "Brands"]],
      ["Partnerships Lead", "Myntra", 7, ["Brands", "Fashion"]],
    ]),
  },
  leadership: { pill: "FOR FREE", pillEm: 3.533, file: "Senior Leadership - For Free", ...leadersQ, people: LEADERS },
  hr: { pill: "FOR HR AND TALENT TEAMS", pillEm: 10.148, file: "For HR and Talent Teams", ...engineersQ, people: ENGINEERS },
  chro: { pill: "FOR CHROs", pillEm: 4.286, file: "For CHROs", ...leadersQ, people: LEADERS },
  // GCC site leads / country heads: engineering-manager search, Bangalore GCC cast
  siteleads: { pill: "FOR SITE LEADS AND DIRECTORS", pillEm: 12.076, file: "For Site Leads and Directors", ...gccQ, people: GCC },
  sitecountry: { pill: "FOR SITE LEADS & COUNTRY MANAGERS", pillEm: 14.84, file: "For Site Leads and Country Managers", ...gccQ, people: GCC },
} satisfies Record<string, Role>;
export type RoleKey = keyof typeof ROLES;
export const ROLE_KEYS = Object.keys(ROLES) as RoleKey[];
