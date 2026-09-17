/**
 * Daily JAM Challenge Manager
 * 
 * Provides:
 * 1. Automatic calendar-day question selection across 4 tracks:
 *    - Campus & Placement
 *    - Tech & Innovation
 *    - Abstract & Logic
 *    - Personal & Behavioral
 * 2. Deterministic daily rotation using the user's local timezone.
 * 3. Persistence in localStorage so refreshing / returning on the same day never resets.
 * 4. Automatic refresh when the calendar date changes.
 * 5. Guarantee that consecutive days never repeat questions.
 * 6. Clean separation between official Daily Challenge and temporary Shuffling.
 */

export interface TodayJamChallenge {
  topic: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time: string;
  hint: string;
}

export const OFFICIAL_DAILY_JAM_STORAGE_KEY = 'jam_official_daily_challenge';

interface StoredDailyJam {
  date: string;
  challenge: TodayJamChallenge;
  previousDayTopic?: string;
}

export const DAILY_QUESTION_POOL: Record<
  'Campus' | 'Tech' | 'Logic' | 'Personal',
  Array<{ topic: string; difficulty: 'Easy' | 'Medium' | 'Hard'; hint?: string }>
> = {
  Campus: [
    {
      topic: "Should college students prioritize internships over academic grades?",
      difficulty: "Medium",
      hint: "Weigh practical industry exposure against foundational theoretical GPA in placement cutoffs."
    },
    {
      topic: "Are university degrees losing relevance in the age of self-taught skills?",
      difficulty: "Hard",
      hint: "Contrast institutional networks and pedagogy with direct proof-of-work portfolios."
    },
    {
      topic: "The role of college clubs and societies in building career skills.",
      difficulty: "Easy",
      hint: "Highlight leadership, team collaboration, and real-world project delivery under pressure."
    },
    {
      topic: "Campus placements vs. pursuing higher studies abroad right after graduation.",
      difficulty: "Medium",
      hint: "Analyze risk tolerance, financial commitment, immediate job market stability vs. academic depth."
    },
    {
      topic: "Should attendance criteria be completely abolished in universities?",
      difficulty: "Medium",
      hint: "Debate adult responsibility and self-paced mastery versus pedagogical consistency."
    },
    {
      topic: "The importance of peer learning and group projects in college.",
      difficulty: "Easy",
      hint: "Explain how collaborative struggle simulates engineering team standups and agile delivery."
    },
    {
      topic: "Should coding and computational thinking be mandatory for all branches?",
      difficulty: "Medium",
      hint: "Examine automation across commerce and core engineering versus artificial curriculum pressure."
    },
    {
      topic: "Work from home vs. in-office culture for first-time graduates.",
      difficulty: "Medium",
      hint: "Discuss mentorship density and serendipitous learning in-office vs remote work autonomy."
    },
    {
      topic: "Standardized campus examinations vs. portfolio-based recruiting.",
      difficulty: "Hard",
      hint: "Compare scalability of algorithmic test filters with holistic project evaluation."
    }
  ],
  Tech: [
    {
      topic: "Should AI be allowed to make hiring and placement decisions?",
      difficulty: "Medium",
      hint: "Discuss algorithmic screening efficiency versus ethical blind spots and bias."
    },
    {
      topic: "Will smartphones ever replace laptops entirely for daily professional work?",
      difficulty: "Easy",
      hint: "Compare raw processing power and screen real estate with ubiquitous mobile accessibility."
    },
    {
      topic: "Is artificial intelligence more likely to create jobs than eliminate them?",
      difficulty: "Medium",
      hint: "Examine historical industrial automation waves versus cognitive displacement."
    },
    {
      topic: "Data privacy vs. personalized digital experiences: where is the line?",
      difficulty: "Medium",
      hint: "Weigh convenience and hyper-tailored services against consumer surveillance."
    },
    {
      topic: "Open source AI models vs. closed proprietary systems in enterprise safety.",
      difficulty: "Hard",
      hint: "Discuss democratized transparency and security audits versus containment risks."
    },
    {
      topic: "The environmental and energy cost of training giant foundation models.",
      difficulty: "Hard",
      hint: "Analyze data center electrical strain and water consumption against societal AI utility."
    },
    {
      topic: "The future of electric vehicles in public transit infrastructure.",
      difficulty: "Medium",
      hint: "Evaluate battery supply chain scalability, grid capacity, and carbon offset."
    },
    {
      topic: "Does automation deskill human workers in technical fields?",
      difficulty: "Medium",
      hint: "Address cognitive atrophy when relying on AI assistants vs freeing time for higher-order reasoning."
    },
    {
      topic: "Smart watches and health trackers: lifestyle enhancement or distraction?",
      difficulty: "Easy",
      hint: "Balance proactive preventative wellness data with hyper-notification fatigue."
    }
  ],
  Logic: [
    {
      topic: "Is competition or collaboration the true driver of modern innovation?",
      difficulty: "Hard",
      hint: "Examine whether market survival pressure or open shared research drives breakthroughs."
    },
    {
      topic: "Can silence sometimes be more powerful than persuasive words?",
      difficulty: "Easy",
      hint: "Illustrate strategic restraint in negotiations, emotional listening, and non-verbal poise."
    },
    {
      topic: "Does technology make humans more connected or more isolated?",
      difficulty: "Medium",
      hint: "Compare global digital access with the decline of deep, local community bonds."
    },
    {
      topic: "Is patience still a virtue in an on-demand, fast-paced world?",
      difficulty: "Medium",
      hint: "Contrast instant gratification in daily services with compounding long-term career mastery."
    },
    {
      topic: "Is failure a necessary prerequisite for meaningful success?",
      difficulty: "Easy",
      hint: "Explain iterative learning, calibration of assumptions, and emotional resilience."
    },
    {
      topic: "Can rules exist without compromising individual freedom of thought?",
      difficulty: "Medium",
      hint: "Differentiate between structural guardrails for social order and ideological conformity."
    },
    {
      topic: "Is absolute freedom of speech possible in the digital era?",
      difficulty: "Hard",
      hint: "Analyze algorithmic amplification, public safety, and content moderation trade-offs."
    },
    {
      topic: "Quality vs. quantity in personal and professional achievements.",
      difficulty: "Easy",
      hint: "Argue how enduring, high-impact craft outlasts superficial volume."
    },
    {
      topic: "Does luck play a bigger role in success than hard work?",
      difficulty: "Medium",
      hint: "Explain how relentless preparation positions people to capitalize on random serendipity."
    }
  ],
  Personal: [
    {
      topic: "Can authentic leadership be taught, or is it an innate personality trait?",
      difficulty: "Medium",
      hint: "Distinguish between natural charisma and acquired emotional intelligence & accountability."
    },
    {
      topic: "A personal habit that significantly improved your daily focus.",
      difficulty: "Easy",
      hint: "Share a specific habit, the friction you overcame to form it, and the tangible outcome."
    },
    {
      topic: "How to navigate working with a team member who has opposing opinions.",
      difficulty: "Medium",
      hint: "Focus on de-personalizing conflict, anchoring to shared goals, and active listening."
    },
    {
      topic: "What true work-life balance means to a young professional.",
      difficulty: "Easy",
      hint: "Reframe balance as sustainable energy and mental boundaries rather than strict 50/50 time."
    },
    {
      topic: "How personal setbacks shaped your definition of resilience.",
      difficulty: "Medium",
      hint: "Narrate an honest challenge, the turning point of perspective, and the resulting strength."
    },
    {
      topic: "The single most important soft skill for long-term career longevity.",
      difficulty: "Easy",
      hint: "Select one core attribute (e.g. adaptability, empathy) and substantiate with corporate reality."
    },
    {
      topic: "Balancing personal ambition with loyalty to a startup team.",
      difficulty: "Medium",
      hint: "Analyze ethical alignment, shared equity, and professional growth plateaus."
    },
    {
      topic: "A situation where you had to stand alone for an unpopular ethical stance.",
      difficulty: "Hard",
      hint: "Demonstrate moral courage, professional composure, and resolution without hostility."
    },
    {
      topic: "Overcoming the fear of public speaking and presentation anxiety.",
      difficulty: "Medium",
      hint: "Discuss physiological adrenaline management, systematic rehearsals, and audience empathy."
    }
  ]
};

export const TRACK_METADATA: Record<
  'Campus' | 'Tech' | 'Logic' | 'Personal',
  { category: string; defaultHint: string }
> = {
  Campus: {
    category: "Campus & Placement",
    defaultHint: "Take a clear stance in the first 10 seconds. Support your viewpoint with practical real-world points."
  },
  Tech: {
    category: "Tech & Innovation",
    defaultHint: "Weigh technology pros & cons, give a modern industry example, and offer a practical conclusion."
  },
  Logic: {
    category: "Abstract & Logic",
    defaultHint: "Define your core concept clearly, acknowledge counter-arguments, and present a balanced verdict."
  },
  Personal: {
    category: "Personal & Behavioral",
    defaultHint: "Frame your answer with a relatable situation, key decisions made, and lesson learned."
  }
};

const TRACK_ORDER: Array<'Campus' | 'Tech' | 'Logic' | 'Personal'> = [
  'Campus',
  'Tech',
  'Logic',
  'Personal'
];

/**
 * Returns today's local date string in YYYY-MM-DD format based on user's timezone.
 */
export function getLocalTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates a continuous day counter from a fixed reference epoch.
 */
export function getCalendarDayIndex(dateStr: string): number {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return 0;
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  const origin = new Date(2026, 0, 1); // 2026-01-01
  const diffMs = target.getTime() - origin.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Deterministically computes the Today's JAM challenge for a given calendar date string.
 * Ensures the selected track rotates daily (Campus -> Tech -> Logic -> Personal)
 * so consecutive days NEVER share the same track or the same question.
 */
export function computeDeterministicDailyJam(dateStr: string, excludeTopic?: string): TodayJamChallenge {
  const dayIndex = getCalendarDayIndex(dateStr);
  const trackKey = TRACK_ORDER[((dayIndex % TRACK_ORDER.length) + TRACK_ORDER.length) % TRACK_ORDER.length];
  const trackPool = DAILY_QUESTION_POOL[trackKey];
  const meta = TRACK_METADATA[trackKey];

  // Rotate through questions in this track across repeating track cycles
  const cycleIndex = Math.floor(dayIndex / TRACK_ORDER.length);
  let itemIndex = ((cycleIndex % trackPool.length) + trackPool.length) % trackPool.length;
  let candidate = trackPool[itemIndex];

  // If candidate happens to match excludeTopic, advance to next question
  if (excludeTopic && candidate.topic.toLowerCase() === excludeTopic.toLowerCase() && trackPool.length > 1) {
    itemIndex = (itemIndex + 1) % trackPool.length;
    candidate = trackPool[itemIndex];
  }

  return {
    topic: candidate.topic,
    category: meta.category,
    difficulty: candidate.difficulty,
    time: "60 sec",
    hint: candidate.hint || meta.defaultHint
  };
}

/**
 * Retrieves or initializes the official Today's JAM challenge.
 * - Reads from localStorage first.
 * - If the stored date matches today's local date, returns the stored challenge.
 * - If date changed (or first visit), computes today's question deterministically,
 *   persists it with today's date, and returns it.
 */
export function getOfficialDailyJam(): TodayJamChallenge {
  const todayDateStr = getLocalTodayDateString();

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(OFFICIAL_DAILY_JAM_STORAGE_KEY);
      if (raw) {
        const stored: StoredDailyJam = JSON.parse(raw);
        if (stored && stored.date === todayDateStr && stored.challenge && stored.challenge.topic) {
          return stored.challenge;
        }
      }

      // Date changed or not yet stored: compute new official daily challenge
      const previousTopic = raw ? (JSON.parse(raw)?.challenge?.topic) : undefined;
      const newDaily = computeDeterministicDailyJam(todayDateStr, previousTopic);

      const recordToSave: StoredDailyJam = {
        date: todayDateStr,
        challenge: newDaily,
        previousDayTopic: previousTopic
      };

      localStorage.setItem(OFFICIAL_DAILY_JAM_STORAGE_KEY, JSON.stringify(recordToSave));
      return newDaily;
    } catch (e) {
      console.warn('Failed to access daily challenge in localStorage:', e);
    }
  }

  // Fallback for SSR or localStorage errors
  return computeDeterministicDailyJam(todayDateStr);
}

/**
 * Builds the list of challenges accessible via the "Shuffle Topic" button.
 * The first item is ALWAYS the official Today's JAM challenge.
 * Subsequent items are alternate challenges from the 4 tracks so users can
 * browse options without altering or corrupting the official Daily Question.
 */
export function getDailyShuffleOptions(officialChallenge: TodayJamChallenge): TodayJamChallenge[] {
  const options: TodayJamChallenge[] = [officialChallenge];

  // Pick one prominent alternate from each track that isn't the official topic
  for (const track of TRACK_ORDER) {
    const meta = TRACK_METADATA[track];
    const alternates = DAILY_QUESTION_POOL[track].filter(
      (item) => item.topic.toLowerCase() !== officialChallenge.topic.toLowerCase()
    );
    if (alternates.length > 0) {
      const alt = alternates[0];
      options.push({
        topic: alt.topic,
        category: meta.category,
        difficulty: alt.difficulty,
        time: "60 sec",
        hint: alt.hint || meta.defaultHint
      });
    }
  }

  return options;
}
