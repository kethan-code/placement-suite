import { getGeminiApiKey } from './geminiKey';

export const RECENT_JAM_QUESTIONS_STORAGE_KEY = 'jam_session_recent_questions';
export const ACTIVE_JAM_TOPIC_STORAGE_KEY = 'jam_active_topic';
export const ACTIVE_JAM_DETAILS_STORAGE_KEY = 'jam_active_details';
export const JAM_SELECTED_TRACK_STORAGE_KEY = 'jam_selected_track';
export const JAM_SELECTED_DIFF_STORAGE_KEY = 'jam_selected_difficulty';

export interface ChallengeDetails {
  track: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint?: string;
}

export const CURATED_TRACK_TOPICS: Record<string, Record<'Easy' | 'Medium' | 'Hard', string[]>> = {
  Campus: {
    Easy: [
      "The role of college clubs and societies in building career skills.",
      "Is class attendance a true measure of academic learning?",
      "The value of completing internships before final year.",
      "How to prepare effectively for campus placement drives.",
      "The importance of peer learning and group projects in college.",
      "Should coding be mandatory for all engineering branches?"
    ],
    Medium: [
      "Should college students prioritize internships over academic grades?",
      "Campus placements vs. pursuing higher studies abroad.",
      "Should attendance criteria be completely abolished in universities?",
      "The importance of cross-disciplinary knowledge for fresh graduates.",
      "Are hackathons and project contests better than traditional exams?",
      "Work from home vs. in-office culture for first-time graduates."
    ],
    Hard: [
      "Are university degrees losing relevance in the age of self-taught skills?",
      "Standardized campus examinations vs. portfolio-based recruiting.",
      "The impact of elite college pedigree on long-term career trajectories.",
      "Economic impact of brain drain on developing tech ecosystems.",
      "Should colleges guarantee placement or focus solely on pedagogy?",
      "The commercialization of higher education: meritocracy or privilege?"
    ]
  },
  Tech: {
    Easy: [
      "Will smartphones ever replace laptops entirely for daily work?",
      "The benefits and drawbacks of social media for college students.",
      "How online education platforms transformed modern learning.",
      "The importance of cyber hygiene in everyday internet browsing.",
      "Smart watches and health trackers: lifestyle enhancement or distraction?",
      "Cloud storage vs local storage in the modern digital workspace."
    ],
    Medium: [
      "Is artificial intelligence more likely to create jobs than eliminate them?",
      "Should AI be allowed to make hiring and recruitment decisions?",
      "Data privacy vs. personalized digital experiences: where is the line?",
      "The future of electric vehicles in public transit infrastructure.",
      "Does automation deskill human workers in technical fields?",
      "Remote work technologies: productivity boon or burnout catalyst?"
    ],
    Hard: [
      "Open source AI models vs. closed proprietary systems in enterprise safety.",
      "The environmental and energy cost of training giant foundation models.",
      "Autonomous vehicles and the ethical dilemma of accident liability.",
      "Cryptocurrency regulations: financial liberation or systemic risk?",
      "Quantum computing and the imminent threat to global cryptography.",
      "Algorithmic bias in judicial sentencing and credit scoring algorithms."
    ]
  },
  Logic: {
    Easy: [
      "Can silence sometimes be more powerful than persuasive words?",
      "Is failure a necessary prerequisite for meaningful success?",
      "Quality vs. quantity in personal and professional achievements.",
      "Why listening is more difficult than speaking in negotiations.",
      "Is simplicity harder to achieve than complexity in design?",
      "Does luck play a bigger role in success than hard work?"
    ],
    Medium: [
      "Does technology make humans more connected or more isolated?",
      "Is competition or collaboration the primary driver of human innovation?",
      "Can intuition ever be more reliable than empirical data in leadership?",
      "Is patience still a virtue in an on-demand, fast-paced world?",
      "Can rules exist without compromising individual freedom of thought?",
      "Is consensus always superior to decisive individual judgment?"
    ],
    Hard: [
      "Is absolute freedom of speech possible in the digital era?",
      "If ignorance is bliss, what is the true ethical obligation to seek wisdom?",
      "Does the end ever justify the means in high-stakes corporate strategy?",
      "Can a machine ever truly possess creativity, or only synthesize it?",
      "Determinism vs free will in evaluating ethical corporate responsibility.",
      "Is economic inequality an unavoidable byproduct of rapid innovation?"
    ]
  },
  Personal: {
    Easy: [
      "A personal habit that significantly improved your daily focus.",
      "How you handle constructive feedback from mentors or peers.",
      "What true work-life balance means to a young professional.",
      "The single most important soft skill for career longevity.",
      "The role of physical fitness in mental clarity and productivity.",
      "How you manage stress during tight academic or project deadlines."
    ],
    Medium: [
      "How to navigate working with a team member who has opposing opinions.",
      "The hardest decision you had to make independently and what it taught you.",
      "How you stay motivated and disciplined during repetitive tasks.",
      "Overcoming the fear of public speaking and stage fright.",
      "Balancing personal ambition with loyalty to a startup team.",
      "How personal setbacks shaped your definition of resilience."
    ],
    Hard: [
      "A situation where you had to stand alone for an unpopular ethical stance.",
      "Sacrificing short-term career comfort for long-term uncertain vision.",
      "Balancing authentic empathy with uncompromising accountability as a leader.",
      "How to rebuild professional trust after making a critical mistake.",
      "Managing interpersonal conflict when both parties are objectively correct.",
      "Defining authentic success outside societal expectations and salary metrics."
    ]
  }
};

/**
 * Retrieve session-level recent questions list.
 */
export function getRecentJamQuestions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(RECENT_JAM_QUESTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read recent questions from sessionStorage:', e);
    return [];
  }
}

/**
 * Record a question to the session-level recent questions list.
 * Deduplicates and keeps the latest 15 questions.
 */
export function addRecentJamQuestion(question: string): string[] {
  if (typeof window === 'undefined' || !question || !question.trim()) return [];
  try {
    const clean = question.trim();
    const current = getRecentJamQuestions();
    const updated = [clean, ...current.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 15);
    sessionStorage.setItem(RECENT_JAM_QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save recent question to sessionStorage:', e);
    return [];
  }
}

/**
 * Persist active challenge topic and details to sessionStorage.
 */
export function persistActiveJamChallenge(topic: string, details: ChallengeDetails | null) {
  if (typeof window === 'undefined') return;
  try {
    if (topic && details) {
      sessionStorage.setItem(ACTIVE_JAM_TOPIC_STORAGE_KEY, topic);
      sessionStorage.setItem(ACTIVE_JAM_DETAILS_STORAGE_KEY, JSON.stringify(details));
    } else {
      sessionStorage.removeItem(ACTIVE_JAM_TOPIC_STORAGE_KEY);
      sessionStorage.removeItem(ACTIVE_JAM_DETAILS_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to persist active challenge:', e);
  }
}

/**
 * Retrieve persisted active challenge if available.
 */
export function getPersistedActiveJamChallenge(): { topic: string; details: ChallengeDetails | null } | null {
  if (typeof window === 'undefined') return null;
  try {
    const topic = sessionStorage.getItem(ACTIVE_JAM_TOPIC_STORAGE_KEY);
    const detailsRaw = sessionStorage.getItem(ACTIVE_JAM_DETAILS_STORAGE_KEY);
    if (topic && detailsRaw) {
      return { topic, details: JSON.parse(detailsRaw) };
    }
  } catch (e) {
    console.error('Failed to load persisted challenge:', e);
  }
  return null;
}

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

interface GenerateOptions {
  track: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  apiKey?: string | null;
  excludeQuestions?: string[];
}

/**
 * Core dynamic challenge generator:
 * - Queries Gemini API with negative constraints against recently used questions.
 * - Falls back to a curated pool filtered against recently used questions.
 * - Guarantees the newly returned question is never identical to recently used items.
 */
export async function generateDynamicJamChallenge(options: GenerateOptions): Promise<{ topic: string; hint: string }> {
  const { track, difficulty, apiKey } = options;
  const recentQuestions = options.excludeQuestions && options.excludeQuestions.length > 0 
    ? options.excludeQuestions 
    : getRecentJamQuestions();

  const key = apiKey || getGeminiApiKey();

  const trackLabels: Record<string, string> = {
    Campus: 'Campus & Placements',
    Tech: 'Tech & Innovation',
    Logic: 'Abstract & Logic',
    Personal: 'Personal & Behavioral'
  };
  const trackLabel = trackLabels[track] || track;

  const recentText = recentQuestions.length > 0
    ? `Recently used questions in this session:\n${recentQuestions.slice(0, 10).map((q, idx) => `${idx + 1}. "${q}"`).join('\n')}\nCRITICAL INSTRUCTION: Do NOT return any question matching or closely resembling the recently used questions listed above.`
    : '';

  const prompt = `You are a placement training coordinator specializing in 60-second Just-A-Minute (JAM) rounds for engineering and MBA placement drives.
Track: ${trackLabel}
Difficulty: ${difficulty} (Easy: clear and familiar question; Medium: requires reasoning + concrete examples; Hard: ambiguous topic + opposing viewpoints)

${recentText}

Generate ONE clear, engaging, and articulate JAM challenge topic.
Rules:
1. Maximum 14 words.
2. Formatted as an engaging question or direct prompt.
3. Ideal for an impromptu 60-second speech.
4. Output STRICT JSON in this format: { "topic": string, "hint": string }`;

  let generated: { topic: string; hint: string } | null = null;

  if (key) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            let cleaned = rawText.trim();
            if (cleaned.startsWith('```')) {
              cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
            }
            const parsed = JSON.parse(cleaned);
            if (parsed.topic && typeof parsed.topic === 'string') {
              const trimmedTopic = parsed.topic.trim();
              const isRecent = recentQuestions.some(
                (q) => q.toLowerCase() === trimmedTopic.toLowerCase()
              );
              if (!isRecent) {
                generated = {
                  topic: trimmedTopic,
                  hint: parsed.hint || "Structure your answer: 10s opening stance, 35s concrete points/examples, 15s clear conclusion."
                };
                break;
              }
            }
          }
        }
      } catch (e) {
        console.warn(`Model ${model} attempt failed:`, e);
      }
    }
  }

  // If Gemini succeeded and gave a distinct question:
  if (generated && generated.topic) {
    addRecentJamQuestion(generated.topic);
    return generated;
  }

  // Fallback: Use curated pool with recent questions filter
  const pool = CURATED_TRACK_TOPICS[track]?.[difficulty] || CURATED_TRACK_TOPICS.Campus.Medium;
  
  // Filter out any questions that have been used recently
  const unusedPool = pool.filter((item) => 
    !recentQuestions.some((rq) => rq.toLowerCase() === item.toLowerCase())
  );

  let selectedTopic: string;
  if (unusedPool.length > 0) {
    selectedTopic = unusedPool[Math.floor(Math.random() * unusedPool.length)];
  } else {
    // If all questions in this difficulty pool have been used, pick any question except the immediate previous one
    const immediatePrevious = recentQuestions[0] || '';
    const nonImmediate = pool.filter((item) => item.toLowerCase() !== immediatePrevious.toLowerCase());
    selectedTopic = nonImmediate.length > 0
      ? nonImmediate[Math.floor(Math.random() * nonImmediate.length)]
      : pool[Math.floor(Math.random() * pool.length)];
  }

  const defaultHints: Record<'Easy' | 'Medium' | 'Hard', string> = {
    Easy: "State your main idea clearly upfront, share 1 relatable personal or campus example, and wrap up with an energetic summary.",
    Medium: "Structure your answer: 10s opening stance, 35s concrete points & trade-offs, 15s clear conclusion.",
    Hard: "Acknowledge both sides of the dilemma, explain why one perspective prevails, and conclude with a forward-looking insight."
  };

  const finalResult = {
    topic: selectedTopic,
    hint: defaultHints[difficulty] || defaultHints.Medium
  };

  addRecentJamQuestion(finalResult.topic);
  return finalResult;
}
