// Dynamic Master Question Bank & Smart Rotation System
// For Placement Suite JAM Simulator

export interface MasterPrompt {
  id: string;
  question: string;
  category: 'Campus' | 'Tech' | 'Logic' | 'Workplace' | 'Society';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint?: string;
}

export interface PromptUserHistory {
  timesShown: number;
  timesPracticed: number;
  lastShownAt: number | null;
  lastPracticedAt: number | null;
  attempts: number;
  bestScore: number | null;
  lastScore: number | null;
}

// 100+ curated tier-1 placement questions asked across campus recruitment drives in India
export const MASTER_QUESTION_BANK: MasterPrompt[] = [
  // --- CAMPUS & EDUCATION (20 Prompts) ---
  {
    id: 'campus-01',
    question: "Should university class attendance be made optional for engineering and degree students?",
    category: 'Campus',
    difficulty: 'Medium',
    hint: "Weigh student accountability and practical learning against autonomy and self-paced study."
  },
  {
    id: 'campus-02',
    question: "Are college degrees losing value compared to hands-on skill portfolios and certifications?",
    category: 'Campus',
    difficulty: 'Hard',
    hint: "Contrast foundational pedigree and alumni networks with rapidly changing tech requirements."
  },
  {
    id: 'campus-03',
    question: "The role of student clubs and technical societies in preparing candidates for placements.",
    category: 'Campus',
    difficulty: 'Easy',
    hint: "Highlight leadership, team collaboration, and real-world project delivery under pressure."
  },
  {
    id: 'campus-04',
    question: "Should industry internships be mandatory starting from the second year of graduation?",
    category: 'Campus',
    difficulty: 'Medium',
    hint: "Discuss bridging theory with industry practice early versus academic cognitive overload."
  },
  {
    id: 'campus-05',
    question: "Online degrees vs. traditional campus education: which builds better industry talent?",
    category: 'Campus',
    difficulty: 'Medium',
    hint: "Compare cost flexibility and access with peer interaction and campus placement ecosystems."
  },
  {
    id: 'campus-06',
    question: "Campus placement security vs. joining an early-stage startup right after college.",
    category: 'Campus',
    difficulty: 'Medium',
    hint: "Analyze risk tolerance, steep learning curves, brand value, and financial stability."
  },
  {
    id: 'campus-07',
    question: "Is grade inflation diluting the true assessment of student academic merit?",
    category: 'Campus',
    difficulty: 'Hard',
    hint: "Discuss GPA relevance in campus screening versus coding and analytical interviews."
  },
  {
    id: 'campus-08',
    question: "Should personal financial literacy and taxation be taught as compulsory college subjects?",
    category: 'Campus',
    difficulty: 'Easy',
    hint: "Explain practical adult preparedness, investing habits, and debt management for freshers."
  },
  {
    id: 'campus-09',
    question: "The psychological pressure of competitive entrance exams and campus placement drives.",
    category: 'Campus',
    difficulty: 'Hard',
    hint: "Address peer comparison, mental resilience, institutional support, and broader career paths."
  },
  {
    id: 'campus-10',
    question: "Should coding and computational thinking be mandatory for non-technical disciplines?",
    category: 'Campus',
    difficulty: 'Medium',
    hint: "Examine automation across commerce, arts, and sciences versus forcing artificial skills."
  },
  {
    id: 'campus-11',
    question: "College festival organizing as practical training for corporate event and team management.",
    category: 'Campus',
    difficulty: 'Easy',
    hint: "Connect vendor negotiation, budgeting, and crisis control to corporate skillsets."
  },
  {
    id: 'campus-12',
    question: "Why cross-disciplinary learning produces better engineers and business leaders.",
    category: 'Campus',
    difficulty: 'Medium',
    hint: "Show how blending design, economics, and engineering creates differentiated solutions."
  },
  {
    id: 'campus-13',
    question: "Standardized entrance exams vs. continuous holistic assessment for admissions.",
    category: 'Campus',
    difficulty: 'Hard',
    hint: "Balance objectivity and scale against socio-economic bias and creative potential."
  },
  {
    id: 'campus-14',
    question: "The influence of hostel and peer culture on professional independence and adaptability.",
    category: 'Campus',
    difficulty: 'Easy',
    hint: "Discuss self-reliance, cross-cultural empathy, and problem solving away from family comfort."
  },
  {
    id: 'campus-15',
    question: "How universities can effectively bridge the gap between academic syllabus and industry needs.",
    category: 'Campus',
    difficulty: 'Medium',
    hint: "Propose adjunct industry faculty, live capstone projects, and agile curriculum revamps."
  },
  {
    id: 'campus-16',
    question: "Pursuing higher studies (MS/MBA) immediately after college vs. gaining 2 years of work experience.",
    category: 'Campus',
    difficulty: 'Medium',
    hint: "Evaluate classroom context after corporate exposure versus momentum of student life."
  },
  {
    id: 'campus-17',
    question: "Does college brand reputation still guarantee career success ten years into the future?",
    category: 'Campus',
    difficulty: 'Hard',
    hint: "Distinguish initial campus placement launchpad from continuous upskilling and grit."
  },
  {
    id: 'campus-18',
    question: "The role of hackathons and open-source contributions in landing top tech placements.",
    category: 'Campus',
    difficulty: 'Easy',
    hint: "Emphasize public proof of work, collaborative git workflows, and self-initiative."
  },
  {
    id: 'campus-19',
    question: "Should universities penalize attendance or reward high attendance with extra academic credits?",
    category: 'Campus',
    difficulty: 'Medium',
    hint: "Contrast positive behavioral incentives against punitive compliance metrics."
  },
  {
    id: 'campus-20',
    question: "Is academic cheating and plagiarism increasing due to generative AI tools?",
    category: 'Campus',
    difficulty: 'Hard',
    hint: "Discuss transforming assessment design from essay memorization to oral defense and applied tests."
  },

  // --- TECHNOLOGY & AI (20 Prompts) ---
  {
    id: 'tech-01',
    question: "The impact of generative AI and automation on entry-level IT engineering jobs.",
    category: 'Tech',
    difficulty: 'Medium',
    hint: "Examine shifting developer roles from manual syntax writing to architectural prompts."
  },
  {
    id: 'tech-02',
    question: "Is remote work a sustainable long-term model for engineering and knowledge teams?",
    category: 'Tech',
    difficulty: 'Medium',
    hint: "Balance global hiring and work-life flexibility against spontaneous mentoring and culture."
  },
  {
    id: 'tech-03',
    question: "Should AI-generated artwork, music, and writing be granted legal copyright protection?",
    category: 'Tech',
    difficulty: 'Hard',
    hint: "Debate human creative agency versus statistical model inference trained on public data."
  },
  {
    id: 'tech-04',
    question: "The ethical dilemma of autonomous vehicles during unavoidable highway accidents.",
    category: 'Tech',
    difficulty: 'Hard',
    hint: "Address algorithmic utilitarian decisions, passenger safety priority, and legal liability."
  },
  {
    id: 'tech-05',
    question: "Social media recommendation algorithms: connecting communities or amplifying extremism?",
    category: 'Tech',
    difficulty: 'Medium',
    hint: "Examine engagement-optimized metrics, echo chambers, and user radicalization risks."
  },
  {
    id: 'tech-06',
    question: "The threat of hyper-realistic deepfakes to democratic elections and digital trust.",
    category: 'Tech',
    difficulty: 'Hard',
    hint: "Discuss digital watermarking, cryptographic provenance, and critical media literacy."
  },
  {
    id: 'tech-07',
    question: "The semiconductor supply chain as the defining battleground of global geopolitics.",
    category: 'Tech',
    difficulty: 'Hard',
    hint: "Analyze fabrication concentration in East Asia, critical mineral security, and national sovereignty."
  },
  {
    id: 'tech-08',
    question: "Can digital public infrastructure like UPI and ONDC democratize developing economies?",
    category: 'Tech',
    difficulty: 'Easy',
    hint: "Highlight zero-fee transactions, small merchant inclusion, and open protocols over monopolies."
  },
  {
    id: 'tech-09',
    question: "The environmental cost of training massive AI models and operating global data centers.",
    category: 'Tech',
    difficulty: 'Medium',
    hint: "Discuss megawatt power demands, fresh water cooling constraints, and clean energy adoption."
  },
  {
    id: 'tech-10',
    question: "Will quantum computing render modern internet cryptography and banking obsolete?",
    category: 'Tech',
    difficulty: 'Hard',
    hint: "Outline post-quantum cryptography transition, asymmetric encryption vulnerabilities, and timelines."
  },
  {
    id: 'tech-11',
    question: "Smartphones in schools: essential educational devices or the ultimate cognitive distraction?",
    category: 'Tech',
    difficulty: 'Easy',
    hint: "Weigh instant information retrieval against attention fragmentation and dopamine loops."
  },
  {
    id: 'tech-12',
    question: "Are big tech monopolies stifling open innovation through aggressive startup buyouts?",
    category: 'Tech',
    difficulty: 'Medium',
    hint: "Evaluate exit incentives for founders versus anticompetitive killer acquisitions."
  },
  {
    id: 'tech-13',
    question: "The 'Right to Disconnect': should after-hours work communication be banned by law?",
    category: 'Tech',
    difficulty: 'Medium',
    hint: "Discuss employee burnout prevention versus asynchronous global timezone collaboration."
  },
  {
    id: 'tech-14',
    question: "Biometric surveillance and facial recognition in public transportation hubs.",
    category: 'Tech',
    difficulty: 'Hard',
    hint: "Balance public crime prevention against civilian privacy rights and algorithmic bias."
  },
  {
    id: 'tech-15',
    question: "Is modern technology making humans socially isolated despite 24/7 connectivity?",
    category: 'Tech',
    difficulty: 'Easy',
    hint: "Contrast superficial digital likes and virtual chatter with deep, empathetic presence."
  },
  {
    id: 'tech-16',
    question: "Open-source foundation models vs. closed proprietary AI ecosystems.",
    category: 'Tech',
    difficulty: 'Medium',
    hint: "Examine security auditing, democratic innovation, misuse guardrails, and safety control."
  },
  {
    id: 'tech-17',
    question: "The role of humanoid robotics and companion AI in future geriatric healthcare.",
    category: 'Tech',
    difficulty: 'Medium',
    hint: "Address aging global demographics, physical nursing assistance, and lack of human warmth."
  },
  {
    id: 'tech-18',
    question: "Can cyber warfare completely replace conventional kinetic warfare in modern conflicts?",
    category: 'Tech',
    difficulty: 'Hard',
    hint: "Analyze critical electrical grid disruption, satellite jamming, and deniable sabotage."
  },
  {
    id: 'tech-19',
    question: "The commercialization of space exploration: private aerospace firms vs. national agencies.",
    category: 'Tech',
    difficulty: 'Medium',
    hint: "Compare cost-efficient reusable rockets with national scientific exploration priorities."
  },
  {
    id: 'tech-20',
    question: "Should governments regulate artificial general intelligence before it becomes reality?",
    category: 'Tech',
    difficulty: 'Hard',
    hint: "Balance proactive existential safety measures against stifling foundational economic research."
  },

  // --- ABSTRACT & LATERAL THINKING (20 Prompts) ---
  {
    id: 'logic-01',
    question: "Silence is often the most powerful and strategic argument in a negotiation.",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Explain how strategic silence compels the opposing party to reveal cards and reflect."
  },
  {
    id: 'logic-02',
    question: "Failure is not the opposite of success; it is a compulsory stepping stone toward it.",
    category: 'Logic',
    difficulty: 'Easy',
    hint: "Draw lessons from iterative design, rapid prototyping, and resilience under pressure."
  },
  {
    id: 'logic-03',
    question: "Does absolute, unrestricted freedom produce groundbreaking creativity or utter chaos?",
    category: 'Logic',
    difficulty: 'Hard',
    hint: "Show how creative constraints (time, budget, medium) focus human ingenuity."
  },
  {
    id: 'logic-04',
    question: "If everything is labeled as urgent, then nothing is truly important.",
    category: 'Logic',
    difficulty: 'Easy',
    hint: "Discuss the Eisenhower Matrix, reactive workplaces, and prioritization discipline."
  },
  {
    id: 'logic-05',
    question: "The vital difference between merely looking busy and generating actual business value.",
    category: 'Logic',
    difficulty: 'Easy',
    hint: "Contrast performative vanity metrics and endless meetings with deep focused output."
  },
  {
    id: 'logic-06',
    question: "Change is the only constant in life, yet human beings resist it the most.",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Analyze evolutionary comfort zones, risk aversion, and institutional inertia."
  },
  {
    id: 'logic-07',
    question: "Is extreme simplicity the ultimate sophistication in engineering and design?",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Discuss reducing cognitive friction, elegant minimalist systems, and Apple/Google design."
  },
  {
    id: 'logic-08',
    question: "Perfectionism is frequently the most dangerous form of creative procrastination.",
    category: 'Logic',
    difficulty: 'Easy',
    hint: "Emphasize shipping minimum viable products, learning from users, and avoiding analysis paralysis."
  },
  {
    id: 'logic-09',
    question: "Can financial wealth buy genuine happiness or merely higher levels of convenience?",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Distinguish basic stress alleviation and health security from purpose, community, and peace."
  },
  {
    id: 'logic-10',
    question: "The immense courage required for a leader to say 'I do not know' in public.",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Demonstrate intellectual honesty, psychological safety, and avoiding catastrophic blunders."
  },
  {
    id: 'logic-11',
    question: "A smooth sea never made a skilled and seasoned sailor.",
    category: 'Logic',
    difficulty: 'Easy',
    hint: "Show how navigating economic recessions and personal crises builds irreplaceable grit."
  },
  {
    id: 'logic-12',
    question: "The illusion of multitasking in a culture of fragmented notifications and attention.",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Explain rapid context switching penalties, cognitive fatigue, and the power of deep work."
  },
  {
    id: 'logic-13',
    question: "Rules exist for the guidance of wise minds and the blind obedience of fools.",
    category: 'Logic',
    difficulty: 'Hard',
    hint: "Balance institutional compliance and safety with first-principles disruption when rules become obsolete."
  },
  {
    id: 'logic-14',
    question: "Why daily unsexy discipline consistently beats sporadic motivation over a decade.",
    category: 'Logic',
    difficulty: 'Easy',
    hint: "Illustrate the compounding interest of habit formation vs. fleeting emotional bursts."
  },
  {
    id: 'logic-15',
    question: "The Paradox of Choice: why having infinite options makes modern consumers miserable.",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Analyze decision paralysis, post-purchase regret, and constant opportunity cost anxiety."
  },
  {
    id: 'logic-16',
    question: "Are heroic leaders born out of crisis, or does crisis merely expose existing character?",
    category: 'Logic',
    difficulty: 'Hard',
    hint: "Examine innate stress fortitude versus situations that demand ordinary people to rise."
  },
  {
    id: 'logic-17',
    question: "Is nostalgia a comforting emotional anchor or an invisible barrier to forward innovation?",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Compare celebrating heritage and timeless values with resisting inevitable modern evolution."
  },
  {
    id: 'logic-18',
    question: "To lead people, one must first master the art of walking behind them.",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Explore servant leadership, removing blockers for team members, and shared credit."
  },
  {
    id: 'logic-19',
    question: "The greatest risk in an accelerating world is taking no risk at all.",
    category: 'Logic',
    difficulty: 'Easy',
    hint: "Recall Kodak, Blockbuster, and Nokia: maintaining status quo during paradigm shifts."
  },
  {
    id: 'logic-20',
    question: "Is speed of execution more critical than perfection of the initial strategy?",
    category: 'Logic',
    difficulty: 'Medium',
    hint: "Discuss feedback loops, market validation, and agile iteration over rigid 5-year plans."
  },

  // --- WORKPLACE & LEADERSHIP (20 Prompts) ---
  {
    id: 'work-01',
    question: "Emotional Intelligence (EQ) vs. Technical IQ in corporate manager promotions.",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Highlight conflict mediation, stakeholder empathy, and motivation over solo engineering skills."
  },
  {
    id: 'work-02',
    question: "How to rebuild professional trust with your team after committing a critical operational blunder.",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Outline immediate ownership without excuses, root cause transparency, and verifiable restitution."
  },
  {
    id: 'work-03',
    question: "The dangerous cost of an agreeable 'Yes Men' culture in high-stakes corporate boardrooms.",
    category: 'Workplace',
    difficulty: 'Hard',
    hint: "Discuss psychological safety, constructive dissent, and avoiding groupthink catastrophes."
  },
  {
    id: 'work-04',
    question: "Should mental health days be formally integrated into corporate paid leave policies?",
    category: 'Workplace',
    difficulty: 'Easy',
    hint: "De-stigmatize psychological burnout, reduce long-term attrition, and boost productivity."
  },
  {
    id: 'work-05',
    question: "Cognitive diversity: why differing problem-solving styles matter as much as demographic balance.",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Explain how neurodivergent perspectives and unconventional backgrounds prevent blind spots."
  },
  {
    id: 'work-06',
    question: "Corporate whistleblowing: ethical heroism vs. personal and career destruction.",
    category: 'Workplace',
    difficulty: 'Hard',
    hint: "Examine moral duty to the public versus non-disclosure agreements and industry blacklisting."
  },
  {
    id: 'work-07',
    question: "Moonlighting and holding secondary contracts: unethical conflict of interest or individual freedom?",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Balance non-compete IP confidentiality with workers leveraging free time for supplemental income."
  },
  {
    id: 'work-08',
    question: "The role of mentorship in accelerating early-career progression and avoiding pitfalls.",
    category: 'Workplace',
    difficulty: 'Easy',
    hint: "Share how experienced mentors provide unwritten organizational context and sponsors."
  },
  {
    id: 'work-09',
    question: "Managing ideological friction between seasoned domain veterans and digital-native newcomers.",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Bridge established business acumen and intuition with cutting-edge tools and rapid iteration."
  },
  {
    id: 'work-10',
    question: "Should salary bands and compensation figures be completely transparent inside a company?",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Examine closing gender pay gaps and trust vs. toxic peer resentment and poaching battles."
  },
  {
    id: 'work-11',
    question: "Work-life integration vs. strict work-life boundary separation: what works best in 2026?",
    category: 'Workplace',
    difficulty: 'Easy',
    hint: "Discuss flexible fluid working hours versus shutting off devices for recuperation."
  },
  {
    id: 'work-12',
    question: "Constructive feedback vs. demoralizing micromanagement: where is the exact boundary?",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Define outcome-oriented delegating with guardrails versus obsessing over minute steps."
  },
  {
    id: 'work-13',
    question: "The ethical responsibility of software developers when building algorithms that affect society.",
    category: 'Workplace',
    difficulty: 'Hard',
    hint: "Argue that engineers are not mere code monkeys; ethical duty extends to end-user impact."
  },
  {
    id: 'work-14',
    question: "Is hyper-aggressive competitiveness healthy or toxic inside high-performance sales and tech teams?",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Distinguish striving for excellence against backstabbing and hoarding client information."
  },
  {
    id: 'work-15',
    question: "Quiet Quitting vs. Quiet Firing: symptom of bad employee work ethic or poor managerial leadership?",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Address unspoken disengagement, lack of recognition, and passive-aggressive performance management."
  },
  {
    id: 'work-16',
    question: "Balancing empathetic compassionate leadership with uncompromising team accountability.",
    category: 'Workplace',
    difficulty: 'Hard',
    hint: "Explain how high standards and deep personal care are complementary, not contradictory."
  },
  {
    id: 'work-17',
    question: "How fresh campus graduates can build executive presence and professional credibility quickly.",
    category: 'Workplace',
    difficulty: 'Easy',
    hint: "Focus on proactive communication, concise email updates, meeting punctuality, and taking notes."
  },
  {
    id: 'work-18',
    question: "The impact of company culture on talent retention during periods of economic austerity.",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Demonstrate why transparent communication during layoffs protects core survivor morale."
  },
  {
    id: 'work-19',
    question: "Should employees be rewarded primarily for inputs (hours logged) or outputs (results achieved)?",
    category: 'Workplace',
    difficulty: 'Easy',
    hint: "Dismantle archaic factory clock-in mentality in favor of meritocratic milestone delivery."
  },
  {
    id: 'work-20',
    question: "How to gracefully decline a high-pressure request from your direct supervisor without damaging relations.",
    category: 'Workplace',
    difficulty: 'Medium',
    hint: "Frame refusals around existing priority trade-offs: 'If I take this on, which project should we deprioritize?'"
  },

  // --- ECONOMY, SOCIETY & SUSTAINABILITY (20 Prompts) ---
  {
    id: 'soc-01',
    question: "The role of renewable solar and nuclear energy in future national grid stability.",
    category: 'Society',
    difficulty: 'Medium',
    hint: "Weigh green decarbonization imperatives against baseload reliability and capital expenditure."
  },
  {
    id: 'soc-02',
    question: "The future of global supply chains in an era of deglobalization and trade protectionism.",
    category: 'Society',
    difficulty: 'Hard',
    hint: "Analyze 'friendshoring', nearshoring resilience, and consumer inflation pressures."
  },
  {
    id: 'soc-03',
    question: "Cashless economy: empowering financial inclusion vs. digital surveillance and exclusion of the poor.",
    category: 'Society',
    difficulty: 'Medium',
    hint: "Address formal credit access for street vendors versus internet outages and state tracking."
  },
  {
    id: 'soc-04',
    question: "Are Electric Vehicles (EVs) genuinely zero-emission when accounting for battery lifecycle and coal grids?",
    category: 'Society',
    difficulty: 'Medium',
    hint: "Examine lithium mining, battery recycling mandates, and grid energy source evolution."
  },
  {
    id: 'soc-05',
    question: "Can continuous exponential GDP growth coexist with aggressive climate conservation targets?",
    category: 'Society',
    difficulty: 'Hard',
    hint: "Debate circular economy decoupling vs. degrowth philosophies in developing economies."
  },
  {
    id: 'soc-06',
    question: "The gig economy: empowering micro-entrepreneurship or exploiting unprotected contractual labor?",
    category: 'Society',
    difficulty: 'Medium',
    hint: "Discuss flexibility for delivery partners versus lack of pensions, healthcare, and safety nets."
  },
  {
    id: 'soc-07',
    question: "Should lifesaving pharmaceutical patents be suspended during international health emergencies?",
    category: 'Society',
    difficulty: 'Hard',
    hint: "Balance immediate moral humanitarian access against incentivizing multi-billion dollar drug R&D."
  },
  {
    id: 'soc-08',
    question: "Mega-city urban concentration vs. rural smart village development: where should investment flow?",
    category: 'Society',
    difficulty: 'Medium',
    hint: "Analyze infrastructure strain, pollution, and slums versus decentralizing economic prosperity."
  },
  {
    id: 'soc-09',
    question: "The devastating environmental and ethical price of ultra-cheap fast fashion.",
    category: 'Society',
    difficulty: 'Easy',
    hint: "Highlight microplastic textile pollution, sweatshop labor, and the illusion of consumer affordability."
  },
  {
    id: 'soc-10',
    question: "Brain drain from developing countries: individual career freedom vs. national economic loss.",
    category: 'Society',
    difficulty: 'Hard',
    hint: "Weigh diaspora remittances and international influence against domestic talent and tax deficits."
  },
  {
    id: 'soc-11',
    question: "Universal Basic Income (UBI): necessary safety net for an AI-automated world or economic hazard?",
    category: 'Society',
    difficulty: 'Hard',
    hint: "Discuss preventing extreme poverty during robotic disruption versus inflationary pressures."
  },
  {
    id: 'soc-12',
    question: "Ecotourism in fragile ecological hotspots: economic lifeline or irreversible habitat destruction?",
    category: 'Society',
    difficulty: 'Medium',
    hint: "Examine conservation funding and local jobs versus carbon footprints and plastic pollution."
  },
  {
    id: 'soc-13',
    question: "The role of youth voter turnout and active civic tech in holding public institutions accountable.",
    category: 'Society',
    difficulty: 'Easy',
    hint: "Show how digital transparency portals and voter awareness shift policy focus to education and jobs."
  },
  {
    id: 'soc-14',
    question: "Single-use plastic bans: individual consumer discipline vs. holding corporate FMCG packagers liable.",
    category: 'Society',
    difficulty: 'Medium',
    hint: "Argue for Extended Producer Responsibility (EPR) alongside community behavioral shifts."
  },
  {
    id: 'soc-15',
    question: "Widespread food waste in upscale urban weddings and hotels alongside chronic child malnutrition.",
    category: 'Society',
    difficulty: 'Easy',
    hint: "Propose organized cold-chain donation networks and institutional food wastage penalties."
  },
  {
    id: 'soc-16',
    question: "Financial literacy for rural women as the single most potent lever for family economic upliftment.",
    category: 'Society',
    difficulty: 'Easy',
    hint: "Cite self-help microfinance groups, child education prioritization, and domestic independence."
  },
  {
    id: 'soc-17',
    question: "The ethics of CRISPR gene editing and 'designer babies' in human embryology.",
    category: 'Society',
    difficulty: 'Hard',
    hint: "Distinguish curing congenital genetic diseases from wealthy families purchasing biological enhancements."
  },
  {
    id: 'soc-18',
    question: "Is social media activism ('slacktivism') achieving real legislative change or just performative vanity?",
    category: 'Society',
    difficulty: 'Medium',
    hint: "Evaluate digital hashtags sparking nationwide awareness versus boots-on-the-ground grassroots work."
  },
  {
    id: 'soc-19',
    question: "The future of public transportation: hyperloop and high-speed rail vs. expanding urban metro systems.",
    category: 'Society',
    difficulty: 'Medium',
    hint: "Compare connecting mega-economic corridors with affordable daily commuting for the working class."
  },
  {
    id: 'soc-20',
    question: "Should corporate lobbying and political campaign donations be capped by independent regulators?",
    category: 'Society',
    difficulty: 'Hard',
    hint: "Discuss equal democratic representation versus freedom of corporate speech and political mobilization."
  }
];

// LocalStorage Keys
const STORAGE_KEY_CURRENT_SET = 'jam_master_deck_current_set_v2';
const STORAGE_KEY_HISTORY = 'jam_master_deck_history_v2';

/**
 * Reads user prompt history from localStorage.
 */
export function getPromptHistory(): Record<string, PromptUserHistory> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to read master deck history:", e);
    return {};
  }
}

/**
 * Saves user prompt history to localStorage.
 */
export function savePromptHistory(history: Record<string, PromptUserHistory>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save master deck history:", e);
  }
}

/**
 * Smart Rotation Algorithm:
 * Selects 10 fresh, balanced questions from the Master Question Bank based on user history.
 * 
 * Priorities:
 * 1. 🟢 Never seen (highest priority, target ~40-50% of the set)
 * 2. 🟡 Practiced but scored poorly / weak areas (< 7.0 score, bring back for review, target ~20%)
 * 3. 🔵 Seen a long time ago (oldest lastShownAt / lowest timesShown)
 * 4. 🔴 Excludes current set and deprioritizes recently practiced with high score (>= 8.0)
 */
export function selectSmartMasterDeckSet(excludeIds: string[] = []): MasterPrompt[] {
  const history = getPromptHistory();
  const pool = MASTER_QUESTION_BANK;

  // Filter out questions currently in the visible set to guarantee freshness
  const candidatePool = pool.filter(p => !excludeIds.includes(p.id));

  // Buckets
  const neverSeen: MasterPrompt[] = [];
  const weakAreas: MasterPrompt[] = [];
  const seenOlder: MasterPrompt[] = [];
  const recentlyHighScoring: MasterPrompt[] = [];

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (const item of candidatePool) {
    const record = history[item.id];
    if (!record || record.timesShown === 0) {
      neverSeen.push(item);
    } else if (record.bestScore !== null && record.bestScore < 7.0) {
      weakAreas.push(item);
    } else if (record.lastPracticedAt && (now - record.lastPracticedAt < ONE_DAY_MS * 2) && (record.bestScore ?? 0) >= 8.0) {
      recentlyHighScoring.push(item);
    } else {
      seenOlder.push(item);
    }
  }

  // Shuffle helper
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const shuffledNeverSeen = shuffle(neverSeen);
  const shuffledWeak = shuffle(weakAreas);
  // Sort seenOlder by oldest shown or least shown
  const sortedOlder = [...seenOlder].sort((a, b) => {
    const recA = history[a.id];
    const recB = history[b.id];
    const shownA = recA?.lastShownAt || 0;
    const shownB = recB?.lastShownAt || 0;
    return shownA - shownB;
  });

  const selected: MasterPrompt[] = [];

  // 1. Take up to 4 never-seen prompts (40%)
  const neverPickCount = Math.min(shuffledNeverSeen.length, 4);
  selected.push(...shuffledNeverSeen.slice(0, neverPickCount));

  // 2. Take up to 2 weak area prompts (20%)
  const weakPickCount = Math.min(shuffledWeak.length, 2);
  selected.push(...shuffledWeak.slice(0, weakPickCount));

  // 3. Fill up to 10 from older seen prompts
  for (const item of sortedOlder) {
    if (selected.length >= 10) break;
    if (!selected.some(s => s.id === item.id)) {
      selected.push(item);
    }
  }

  // 4. If still under 10, fill from remaining never-seen
  for (const item of shuffledNeverSeen.slice(neverPickCount)) {
    if (selected.length >= 10) break;
    if (!selected.some(s => s.id === item.id)) {
      selected.push(item);
    }
  }

  // 5. If still under 10, fill from remaining weak areas
  for (const item of shuffledWeak.slice(weakPickCount)) {
    if (selected.length >= 10) break;
    if (!selected.some(s => s.id === item.id)) {
      selected.push(item);
    }
  }

  // 6. Last resort: fill from deprioritized recentlyHighScoring or the original pool
  if (selected.length < 10) {
    for (const item of shuffle(recentlyHighScoring)) {
      if (selected.length >= 10) break;
      if (!selected.some(s => s.id === item.id)) {
        selected.push(item);
      }
    }
  }

  if (selected.length < 10) {
    for (const item of pool) {
      if (selected.length >= 10) break;
      if (!selected.some(s => s.id === item.id)) {
        selected.push(item);
      }
    }
  }

  // Update timesShown & lastShownAt for the selected 10
  const updatedHistory = { ...history };
  const currentTimestamp = Date.now();

  for (const item of selected) {
    const existing = updatedHistory[item.id] || {
      timesShown: 0,
      timesPracticed: 0,
      lastShownAt: null,
      lastPracticedAt: null,
      attempts: 0,
      bestScore: null,
      lastScore: null
    };
    updatedHistory[item.id] = {
      ...existing,
      timesShown: existing.timesShown + 1,
      lastShownAt: currentTimestamp
    };
  }

  savePromptHistory(updatedHistory);

  // Persist the current 10 into localStorage so page refresh doesn't change them
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_SET, JSON.stringify(selected.map(s => s.id)));
    } catch (e) {}
  }

  return selected;
}

/**
 * Retrieves the currently active 10 prompts.
 * On browser reload, keeps the existing 10 unless none exist or a completed session flagged for rotation,
 * in which case it generates a fresh set.
 */
export function getCurrentMasterDeckSet(): MasterPrompt[] {
  if (typeof window === 'undefined') {
    return MASTER_QUESTION_BANK.slice(0, 10);
  }

  try {
    const needsRotation = localStorage.getItem('jam_master_deck_needs_rotation') === 'true';
    if (needsRotation) {
      localStorage.removeItem('jam_master_deck_needs_rotation');
      return selectSmartMasterDeckSet();
    }

    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_SET);
    if (raw) {
      const ids: string[] = JSON.parse(raw);
      if (Array.isArray(ids) && ids.length > 0) {
        const matching = ids
          .map(id => MASTER_QUESTION_BANK.find(p => p.id === id))
          .filter(Boolean) as MasterPrompt[];
        if (matching.length === 10) {
          return matching;
        }
      }
    }
  } catch (e) {
    console.error("Failed reading active master deck set:", e);
  }

  // If no saved set or invalid length, select a fresh set
  return selectSmartMasterDeckSet();
}

/**
 * Records when a user picks a prompt to begin practice.
 */
export function markPromptPracticed(promptText: string, score?: number) {
  if (typeof window === 'undefined') return;

  // Match by question text or ID
  const matched = MASTER_QUESTION_BANK.find(
    p => p.question.trim().toLowerCase() === promptText.trim().toLowerCase() ||
         promptText.trim().toLowerCase().includes(p.question.trim().toLowerCase().slice(0, 30))
  );

  if (!matched) return;

  const history = getPromptHistory();
  const existing = history[matched.id] || {
    timesShown: 1,
    timesPracticed: 0,
    lastShownAt: Date.now(),
    lastPracticedAt: null,
    attempts: 0,
    bestScore: null,
    lastScore: null
  };

  const newAttempts = existing.attempts + (score !== undefined ? 1 : 0);
  const newTimesPracticed = existing.timesPracticed + 1;
  const newBestScore = score !== undefined 
    ? Math.max(existing.bestScore ?? 0, score)
    : existing.bestScore;

  history[matched.id] = {
    ...existing,
    timesPracticed: newTimesPracticed,
    attempts: newAttempts,
    lastPracticedAt: Date.now(),
    lastScore: score !== undefined ? score : existing.lastScore,
    bestScore: newBestScore
  };

  savePromptHistory(history);
}

/**
 * When a JAM session evaluation completes, this records the score for the topic
 * and ensures the smart rotation knows this prompt has been completed.
 */
export function recordMasterDeckScore(topicText: string, score: number) {
  markPromptPracticed(topicText, score);
  if (typeof window !== 'undefined') {
    localStorage.setItem('jam_master_deck_needs_rotation', 'true');
  }
}
