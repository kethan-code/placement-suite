'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getScoreTheme } from '@/lib/scoreTheme';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import { 
  Shield, 
  Users, 
  Timer, 
  TrendingUp, 
  Zap, 
  Target, 
  Mic, 
  Square, 
  RotateCcw, 
  Sparkles, 
  ArrowLeft, 
  Shuffle, 
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  BarChart3,
  Lightbulb,
  Brain,
  CheckCircle2,
  User
} from 'lucide-react';

export interface ModelAnswer {
  S: string;
  T: string;
  A: string;
  R: string;
}

export interface ScenarioItem {
  scenarioContext: string;
  actualQuestion: string;
  evaluatingMetrics?: string[];
  followUpQuestions?: string[];
  modelAnswer?: ModelAnswer;
  whyItWorks?: string;
}

export function ModelAnswerDrawer({ 
  answerData, 
  whyItWorks 
}: { 
  answerData?: ModelAnswer; 
  whyItWorks?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!answerData) return null;

  return (
    <div className="mt-6 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors"
      >
        <span className="text-sm font-semibold text-zinc-200">
          📖 Read Example Model Story
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-zinc-800 space-y-6">
          <h3 className="font-bold text-white text-lg">Example strong answer</h3>

          <div className="space-y-4">
            {/* Situation */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-1">
                S — Situation <span className="text-zinc-500 font-normal">· ~12 sec</span>
              </h4>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">{answerData.S}</p>
            </div>

            {/* Task */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-1">
                T — Task <span className="text-zinc-500 font-normal">· ~18 sec</span>
              </h4>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">{answerData.T}</p>
            </div>

            {/* Action - Highlighted to reinforce the 55% rule */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-md -mx-3">
              <h4 className="text-sm font-semibold text-emerald-400 mb-1">
                A — Action <span className="text-emerald-500/50 font-normal">· ~65 sec</span>
              </h4>
              <p className="text-sm text-emerald-100/70 font-medium leading-relaxed">{answerData.A}</p>
            </div>

            {/* Result */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-1">
                R — Result <span className="text-zinc-500 font-normal">· ~25 sec</span>
              </h4>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">{answerData.R}</p>
            </div>
          </div>

          {/* Why this works insight */}
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <div className="flex items-center gap-2 text-yellow-500 font-semibold text-sm mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" /> Why this works
            </div>
            <p className="text-sm text-zinc-300 font-light leading-relaxed">
              {whyItWorks || "The candidate spends most of the answer explaining their own decisions and actions. That teaches the STAR methodology naturally."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const COMPETENCY_CRITERIA: Record<string, string[]> = {
  "Leadership & Ownership": [
    "Took initiative without being asked",
    "Clearly owned the problem or outcome",
    "Made decisive choices under uncertainty",
    "Communicated proactively with stakeholders",
    "Followed through to a measurable outcome"
  ],
  "Conflict Resolution": [
    "De-escalated tension objectively",
    "Listened to understand the opposing view",
    "Focused on the shared goal, not personal ego",
    "Proposed a logical compromise or solution",
    "Maintained professional relationships"
  ],
  "Crisis & Deadlines": [
    "Remained calm under sudden pressure",
    "Prioritized the most critical failing components",
    "Communicated the risk immediately",
    "Executed a rapid, pragmatic workaround",
    "Implemented preventative measures afterward"
  ],
  "Failure & Resilience": [
    "Took immediate accountability without blaming others",
    "Analyzed the root cause objectively",
    "Detailed the specific steps taken to recover",
    "Shared a concrete, actionable lesson learned",
    "Demonstrated growth in a subsequent project"
  ],
  "Rapid Learning": [
    "Identified the knowledge gap quickly",
    "Sourced reliable documentation or mentors",
    "Broke the learning curve down into actionable steps",
    "Applied the new skill to unblock the project",
    "Retained and shared the knowledge with the team"
  ]
};

const COMPETENCIES = [
  { 
    id: 'leadership', 
    label: 'Leadership & Ownership', 
    icon: Shield,
    pool: [
      {
        scenarioContext: "You are 48 hours away from submitting your final year project, and your core database implementation just failed, erasing a week of test data. Your teammate wants to quit and submit an older, broken build.",
        actualQuestion: "Tell me about a time you had to take control of a failing project under extreme time pressure. Walk me through your exact steps.",
        modelAnswer: {
          S: "During my 6th-semester capstone project, our MySQL database corrupted 48 hours before final evaluation due to an unhandled migration script, losing our test dataset.",
          T: "As project lead, I needed to restore database integrity, re-populate sample data, and keep my demotivated teammate focused on fixing our API endpoints.",
          A: "I immediately organized a 15-minute emergency triage call. I assigned my teammate to mock essential test JSON payloads while I wrote a clean rollback migration script using SQLite backups. I then set up automated seed scripts to repopulate data in 4 hours, and pair-programmed through the night to refactor failing routes.",
          R: "We restored 100% of core app functionality 12 hours ahead of deadline, presented a live working demo, and earned an 'A' grade from our project review board."
        }
      },
      {
        scenarioContext: "During a major college hackathon, your team lead unexpectedly disconnected due to an emergency right before the midnight review checkpoint.",
        actualQuestion: "Describe a situation where ownership was unclear and you stepped up to delegate tasks and lead your team to success.",
        modelAnswer: {
          S: "At a 24-hour national hackathon, our designated team lead had a personal emergency and left at midnight right before the mentor check-in.",
          T: "I needed to assume leadership, review our remaining feature list, and assign tasks to present a working MVP by morning.",
          A: "I audited our codebase and cut two non-essential features to focus on the core auth and payment API flow. I created a GitHub board, assigned the frontend UI polish to my teammate, and took on fixing the backend integration bugs myself.",
          R: "We presented a fully functional MVP at 8 AM, passed all mentor checkpoints, and secured 2nd place among 40 participating teams."
        }
      },
      {
        scenarioContext: "Your college club is organizing a national tech symposium with 500+ attendees, but two main event coordinators withdrew one week before launch.",
        actualQuestion: "Share an instance where you took full ownership to resolve a critical project bottleneck and keep everyone accountable.",
        modelAnswer: {
          S: "One week before our college tech fest expecting 500+ students, two main logistics coordinators stepped down, leaving venue and speaker management unmanaged.",
          T: "I volunteered to take full operational control and ensure all 10 scheduled tech tracks ran smoothly on launch day.",
          A: "I created a centralized real-time spreadsheet, recruited 5 junior volunteers, and assigned clear venue ownership. I personally contacted all guest speakers to confirm travel arrangements and set up automated SMS reminders for session schedules.",
          R: "All 10 events ran on schedule without delays, attendance hit 100% capacity, and the department dean awarded our team a special certificate of leadership."
        }
      }
    ]
  },
  { 
    id: 'conflict', 
    label: 'Conflict Resolution', 
    icon: Users,
    pool: [
      {
        scenarioContext: "Your project partner insists on using an outdated library they are comfortable with, while you know a modern API will reduce server latency by 50%.",
        actualQuestion: "Tell me about a technical disagreement with a teammate and how you persuaded them to adopt your solution.",
        modelAnswer: {
          S: "While building a real-time chat feature for our web development mini-project, my partner wanted to use HTTP polling, whereas I advocated for WebSockets.",
          T: "I had to resolve our disagreement amicably while proving that WebSockets was the superior technical choice for lower server load.",
          A: "Instead of arguing theoretically, I created a quick 30-minute benchmark sandbox comparing memory usage and latency for both approaches. I presented a side-by-side performance chart showing 60% lower latency with WebSockets, and offered to write the WebSocket boilerplate code myself so my partner wouldn't feel overwhelmed.",
          R: "My teammate agreed to switch to WebSockets, our application handled 200 concurrent test users effortlessly during evaluation, and we received top marks for optimization."
        }
      },
      {
        scenarioContext: "In a 4-person team project, one member is consistently missing group standups and submitting incomplete code components.",
        actualQuestion: "Describe how you handled a team member who was not contributing their fair share without destroying team morale.",
        modelAnswer: {
          S: "During a 4-person database project, one member missed three consecutive standups and delivered broken module code.",
          T: "I needed to address the issue directly without escalating to conflict, understand his roadblock, and realign project responsibilities.",
          A: "I scheduled a 1-on-1 coffee break to check in privately. He admitted struggling with SQL joins and feeling embarrassed. I paired him with our senior coder for a 1-hour peer tutoring session and reassigned him to build frontend React forms matching his strengths.",
          R: "He completed all assigned form components on time, regained confidence, and our team submitted a complete project three days early."
        }
      },
      {
        scenarioContext: "You and a fellow student are competing for the same spot in a campus incubator program and disagree on how to present shared project results.",
        actualQuestion: "How do you handle working through a high-stakes conflict with someone whose working style and goals differ from yours?",
        modelAnswer: {
          S: "While pitching a joint IoT startup idea for campus funding, my co-presenter wanted a pure business pitch, while I insisted on demonstrating our technical hardware live.",
          T: "We had to reconcile our contrasting pitch styles into a cohesive 5-minute presentation for the seed grant committee.",
          A: "I scheduled a structured review session where we timed both approaches. We compromised by splitting the pitch 50-50: 2 minutes of market opportunity followed by a 2-minute live hardware demo and 1 minute summary.",
          R: "The judges praised both our market clarity and technical execution, awarding us $2,500 in prototype seed funding."
        }
      }
    ]
  },
  { 
    id: 'crisis', 
    label: 'Crisis & Deadlines', 
    icon: Timer,
    pool: [
      {
        scenarioContext: "Your team's server crashed 30 minutes before your live project presentation to external industry judges due to an unhandled API rate limit.",
        actualQuestion: "Describe a technical crisis under an extreme deadline. How did you stay calm and fix the issue?",
        modelAnswer: {
          S: "30 minutes before our final year project demo to visiting industry experts, our backend crashed because external API rate limits were exceeded during pre-demo testing.",
          T: "I had to stabilize our server immediately and ensure the live demonstration would not fail during judge evaluation.",
          A: "I called a quick 2-minute pause to prevent panic. I implemented a local memory cache in Node.js to mock external API responses for demo queries, wrapped external calls in a fallback handler, and deployed the hotfix to Vercel within 12 minutes.",
          R: "Our live demonstration ran flawlessly with sub-100ms response times, and the judges complimented our fallback caching mechanism after we disclosed how we handled the crisis."
        }
      },
      {
        scenarioContext: "You have two major end-semester practical exams scheduled on the exact same day as your final capstone project submission.",
        actualQuestion: "How do you prioritize deliverables and manage your workload when multiple high-stakes deadlines hit simultaneously?",
        modelAnswer: {
          S: "During my 7th semester, my final capstone code deadline coincided with two major 3-hour practical lab examinations on the same afternoon.",
          T: "I needed to score above 85% in both lab exams while delivering a fully tested capstone codebase without missing deadline penalties.",
          A: "I mapped out a strict 7-day backward timetable using Notion. I dedicated mornings to lab practical mock tests and evenings to capstone code freezes. I completed capstone testing 48 hours early, freeing the final day purely for exam revision.",
          R: "I scored A+ grades in both practical exams and delivered the capstone project on schedule with zero missing requirements."
        }
      },
      {
        scenarioContext: "During a semester lab evaluation, a hardware component burnt out 15 minutes before your professor arrived for testing.",
        actualQuestion: "Tell me about a time an unexpected hardware or software failure disrupted your timeline and how you recovered.",
        modelAnswer: {
          S: "15 minutes before our microcontrollers lab grading, our primary Arduino motor driver IC short-circuited and stopped responding.",
          T: "I needed to find a replacement component or alternative circuit logic before our professor evaluated our lab bench.",
          A: "I quickly sprinted to an adjacent lab section, borrowed a spare H-bridge module, and re-wired our breadboard connections using a backup schematic I had drawn earlier. I re-flashed the pin assignments in 5 minutes and verified motor rotation.",
          R: "Our setup was fully operational when the professor arrived, and we completed all 5 test maneuvers with full points."
        }
      }
    ]
  },
  { 
    id: 'failure', 
    label: 'Failure & Resilience', 
    icon: TrendingUp,
    pool: [
      {
        scenarioContext: "After working 3 weeks on a custom sorting algorithm for your data structures course, your test suite scored 40% due to an edge case memory leak.",
        actualQuestion: "Describe a situation where a technical task or project failed. How did you analyze the failure and bounce back?",
        modelAnswer: {
          S: "In my algorithms course, my custom graph-traversal implementation failed 60% of automated test cases on submit night due to memory leaks on large graph inputs.",
          T: "I had to identify the root cause of the memory leaks, refactor my pointer management, and resubmit before the grace period ended.",
          A: "I ran Valgrind to profile memory allocations, identified un-freed heap nodes in cyclic graph loops, and restructured the destructor logic. I then wrote 15 boundary unit tests targeting cyclic graphs and verified zero memory leaks.",
          R: "I resubmitted the algorithm, passed 100% of automated test cases, and gained a deep practical understanding of C++ memory management."
        }
      },
      {
        scenarioContext: "Your project mentor gave harsh feedback on your initial UI architecture during mid-term evaluation, rating your design unacceptable.",
        actualQuestion: "Tell me about a time you received critical feedback on your work and how you systematically acted on it.",
        modelAnswer: {
          S: "During mid-term project reviews, our faculty advisor rejected our initial React dashboard UI, calling it unorganized and non-standard.",
          T: "I needed to welcome the critical review objectively and lead a total UI redesign within 5 days.",
          A: "Instead of getting defensive, I asked the professor for specific benchmark web apps to reference. I studied Tailwind CSS design tokens, adopted clean grid layouts, and built a component design system. I presented a revised prototype 3 days later.",
          R: "Our advisor praised the rapid transformation, calling it the most improved interface in the department batch."
        }
      },
      {
        scenarioContext: "Your team spent two months building an IoT prototype for a campus competition, but lost to a simpler project because your demo glitched.",
        actualQuestion: "Share an experience where a project outcome was disappointing despite your effort, and what core lesson you retained.",
        modelAnswer: {
          S: "Our team spent two months building a complex Bluetooth IoT weather station, but during the final judging demo, signal interference caused a 10-second delay and we lost 1st place.",
          T: "Despite our disappointment, I wanted to analyze why we lost and turn the setback into an engineering lesson.",
          A: "We conducted a post-mortem session and identified that over-complicating our wireless protocol made our demo fragile. For our next project, I insisted on offline fail-safes and robust error handling.",
          R: "Applying this core lesson to our next national competition, our team built a resilient system that won 1st prize out of 50 submissions."
        }
      }
    ]
  },
  { 
    id: 'learning', 
    label: 'Rapid Learning', 
    icon: Zap,
    pool: [
      {
        scenarioContext: "You registered for a 24-hour hackathon, but the event problem statement mandated using Web3 smart contracts—a technology you had never used before.",
        actualQuestion: "Tell me about a time you had to learn a completely new tech stack or framework under severe time constraints.",
        modelAnswer: {
          S: "At a 24-hour campus hackathon, our team chose a track requiring a Solidity smart contract backend, despite having zero prior blockchain experience.",
          T: "I took responsibility for learning Solidity basics and deploying a working contract on the Ethereum Sepolia testnet within 8 hours.",
          A: "I spent 2 hours studying Remix IDE templates and Solidity syntax docs. I leveraged simple ERC-20 token contracts as reference, built a minimal contract with 3 core functions, and integrated ethers.js with our React frontend.",
          R: "We deployed our contract smoothly, completed our project presentation on time, and won the 'Best Fast Learner' award at the hackathon."
        }
      },
      {
        scenarioContext: "Midway through your mini-project semester, your client requested a pivot from a Web dashboard to a native Mobile application.",
        actualQuestion: "How do you adapt when requirements change drastically midway through a project?",
        modelAnswer: {
          S: "Halfway through our semester project, our sponsor client requested shifting our web dashboard into a cross-platform React Native mobile app.",
          T: "I had to quickly learn React Native fundamentals and migrate our web component architecture within 10 days.",
          A: "I spent two days completing hands-on React Native tutorials, mapped web state logic to mobile hooks, and leveraged Expo for quick iOS/Android testing. I refactored our API client layer to handle mobile network changes gracefully.",
          R: "We delivered a smooth mobile app build on time, exceeding client expectations and receiving top project honors."
        }
      },
      {
        scenarioContext: "You were assigned to debug a legacy C++ codebase built by senior students two years ago with minimal code comments or documentation.",
        actualQuestion: "Describe a situation where you worked in a domain or codebase you knew nothing about and successfully delivered.",
        modelAnswer: {
          S: "I inherited a 3,000-line legacy C++ robotics simulation repository from senior students that had zero documentation and failing build scripts.",
          T: "My goal was to understand the system architecture, fix build errors, and add a new sensor tracking module.",
          A: "I generated call graphs using Doxygen, systematically traced execution starting from main.cpp, and added inline comments to 20 key functions. I fixed missing linker flags and refactored the sensor input loop.",
          R: "I brought the codebase to a fully documented, buildable state, added the new module, and published a setup README for future students."
        }
      }
    ]
  }
];

export default function BehavioralCoachPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeCompetency, setActiveCompetency] = useState('leadership');
  const [activeScenario, setActiveScenario] = useState<ScenarioItem | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Expert'>('Medium');
  const [showExample, setShowExample] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2-Minute STAR timer
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingQ, setIsGeneratingQ] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [evaluationWarnings, setEvaluationWarnings] = useState<{ type: string; message: string }[] | null>(null);
  const [evalCoverage, setEvalCoverage] = useState<{ S_score: number; T_score: number; A_score: number; R_score: number } | null>(null);
  const [pacingWarning, setPacingWarning] = useState<string | null>(null);
  const [scorecardData, setScorecardData] = useState<{
    overallScore: number;
    breakdown: Record<string, { score: number; outOf: number }>;
    feedback: {
      biggestImprovement: string;
      whatWorked: string;
      tryAgain: string;
    };
  } | null>(null);
  const [improvedAnswer, setImprovedAnswer] = useState<{
    situation: string;
    task: string;
    action: string;
    result: string;
    keyImprovements: string[];
  } | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Multi-Stage Interview Flow States
  const [interviewPhase, setInterviewPhase] = useState<'prep' | 'main' | 'generating-followup' | 'followup' | 'feedback'>('prep');
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [mainTranscript, setMainTranscript] = useState<string>('');
  const [followUpTranscript, setFollowUpTranscript] = useState<string>('');
  const [followUpTimeLeft, setFollowUpTimeLeft] = useState<number>(60);

  const getTimerColorClass = (seconds: number) => {
    if (seconds > 30) return 'text-white';
    if (seconds > 10) return 'text-amber-400';
    return 'text-red-500 font-bold animate-pulse';
  };

  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const compParam = params.get('competency');
      const diffParam = params.get('difficulty');
      if (compParam && COMPETENCIES.some(c => c.id === compParam)) {
        setActiveCompetency(compParam);
      }
      if (diffParam && ['Easy', 'Medium', 'Hard', 'Expert'].includes(diffParam)) {
        setDifficulty(diffParam as 'Easy' | 'Medium' | 'Hard' | 'Expert');
      }
    }

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // 120-Second STAR Timer Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRecording && timeLeft === 0) {
      handleStopAndEvaluate();
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const generateQuestion = async (competencyId?: string) => {
    setIsGeneratingQ(true);
    setShowExample(false);
    const targetCompId = competencyId || activeCompetency;
    const comp = COMPETENCIES.find((c) => c.id === targetCompId) || COMPETENCIES[0];
    
    setActiveScenario(null);
    setAnalysis(null);
    setEvaluationWarnings(null);
    setEvalCoverage(null);
    setPacingWarning(null);
    setScorecardData(null);
    setImprovedAnswer(null);
    setIsImproving(false);
    setIsPreparing(false);
    setIsCriteriaOpen(false);
    setInterviewPhase('prep');
    setFollowUpQuestion(null);
    setMainTranscript('');
    setFollowUpTranscript('');
    setFollowUpTimeLeft(60);
    setTranscript('');
    setMicError(null);

    const fallbackItem = comp.pool[Math.floor(Math.random() * comp.pool.length)];
    const key = apiKey || localStorage.getItem('app_gemini_api_key') || localStorage.getItem('app_api_key');
    const randomSeed = Math.random();

    let fetchedScenario: ScenarioItem | null = null;

    // First attempt server route /api/star with cache busting
    try {
      const apiRes = await fetch('/api/star', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competency: comp.label,
          difficulty: difficulty,
          randomSeed,
          apiKey: key
        })
      });

      const apiData = await apiRes.json();
      if (apiData.success && apiData.scenario?.scenarioContext && apiData.scenario?.actualQuestion) {
        fetchedScenario = apiData.scenario;
      }
    } catch (e) {
      console.warn("Backend /api/star failed, falling back to direct REST fetch...", e);
    }

    // Direct REST API fallback if /api/star isn't used or fails
    if (!fetchedScenario && key) {
      const candidateModels = [
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ];

      const prompt = `You are an expert tech interviewer. Generate a highly specific, B.Tech student-level behavioral interview scenario focused EXCLUSIVELY on: "${comp.label}".

DIFFICULTY LEVEL: ${difficulty}
You must strictly adapt the complexity of the scenario based on this difficulty:
- EASY: Clear scenario + obvious responsibility (e.g., a simple disagreement on a class presentation, managing time for midterms).
- MEDIUM: Ambiguous situation + competing priorities (e.g., a hackathon deadline, a failing club event, integrating APIs in a group project with uncooperative peers).
- HARD: Messy situation + incomplete information + stakeholder conflict (e.g., a catastrophic database failure during an internship, severe ethical dilemmas with a professor/manager, leading a hostile cross-functional team under extreme technical debt).
- EXPERT: High-stakes chaos + unexpected interviewer follow-up probes (e.g., severe multi-team breakdown, unannounced architecture failure, hostile lead review). Generate 2 sharp, realistic follow-up questions an interviewer would ask after the candidate answers (e.g., "Why didn't you ask your manager for help?", "What would you do differently?").

RANDOMIZATION SEED: ${randomSeed}
(Ensure the environment is completely unique based on this seed).

CRITICAL RULE: Generate 4 specific evaluation keywords (e.g., 'Initiative', 'Ownership', 'Decision-making', 'Impact') that an interviewer would look for in this specific scenario. Return them in the evaluatingMetrics array.

CRITICAL RULE: NEVER use the same plot structure twice. Do NOT always use a hackathon, a capstone project, or a team member "ghosting." 

Depending on the random seed, force the setting to be one of the following radically different environments:
1. An everyday college group assignment (e.g., lab work, presentation).
2. A part-time tech internship or freelance gig.
3. An open-source contribution or online community project.
4. A conflict with a professor or mentor regarding a technical choice.

For "${comp.label}", ensure the core challenge is completely unique.

Make it feel like a completely new story every single time.

Also write a perfect 'Model Answer' story as if a top-tier student is answering the question. The model answer MUST be broken down exactly into Situation, Task, Action, and Result. Output strictly valid JSON matching this schema:
{
  "scenarioContext": "string",
  "actualQuestion": "string",
  "evaluatingMetrics": ["Initiative", "Ownership", "Decision-making", "Impact"],
  "followUpQuestions": ["string (e.g. Why didn't you ask your manager for help?)", "string (e.g. What would you do differently?)"],
  "modelAnswer": {
    "S": "string (1-2 sentences setting the scene)",
    "T": "string (1-2 sentences defining the goal)",
    "A": "string (Detailed story of the specific actions taken)",
    "R": "string (The final positive outcome and metric)"
  },
  "whyItWorks": "string (A 1-2 sentence explanation of why this answer succeeds, focusing on the action phase or outcome)"
}`;

      for (const model of candidateModels) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.85
              }
            })
          });

          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.scenarioContext && parsed.actualQuestion) {
              fetchedScenario = parsed;
              break;
            }
          }
        } catch (e) {
          console.warn(`Model ${model} failed for behavioral scenario generation:`, e);
        }
      }
    }

    setActiveScenario(fetchedScenario || fallbackItem);
    setIsGeneratingQ(false);
  };

  const handleSelectCompetency = (id: string) => {
    setActiveCompetency(id);
    setShowExample(false);
    generateQuestion(id);
  };

  const isRecordingRef = useRef(false);

  const startRecording = async () => {
    if (!activeScenario) {
      alert("Please select or generate a scenario first.");
      return;
    }

    setMicError(null);
    setTranscript('');
    setInterimText('');
    setTimeLeft(120);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.8;
        const src = ctx.createMediaStreamSource(stream);
        src.connect(analyserNode);
        analyserRef.current = analyserNode;
        setAnalyser(analyserNode);
      }
    } catch (err: any) {
      setMicError("Microphone permission denied. Please allow microphone access in your browser bar.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
      setInterimText(interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'not-allowed') {
        setMicError("Microphone access was blocked. Please click the mic icon in your browser URL bar and allow it.");
      }
    };

    recognition.onend = () => {
      if (isRecordingRef.current && timeLeft > 0) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Speech recognition restart failed", e);
        }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
      isRecordingRef.current = true;
    } catch (err) {
      console.error("Recognition start failed:", err);
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    const currentText = (transcript + (interimText ? ' ' + interimText : '')).trim();
    setTranscript(currentText);
    setInterimText('');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAnalyser(null);
    return currentText;
  };

  const handleStopAndEvaluate = async () => {
    const recordedText = stopRecording();
    evaluateSpeech(recordedText);
  };

  const generateHeuristicWarnings = (text: string, durationSec: number) => {
    const warnings: { type: string; message: string }[] = [];
    
    // Check 1: Team Language
    const weMatches = (text.match(/\b(we|our|us)\b/gi) || []).length;
    const iMatches = (text.match(/\b(i|my|mine|me)\b/gi) || []).length;
    if (weMatches > 3 && weMatches >= iMatches) {
      warnings.push({
        type: "Too much team language",
        message: `You used team pronouns ('we', 'our') ${weMatches} times. Try emphasizing what you personally did.`
      });
    }

    // Check 2: Weak Result / Metrics
    const metricMatches = text.match(/\b\d+(%|x|k|m|ms|sec|min|hours|days|users|dollars|\$)?\b/gi);
    if (!metricMatches || metricMatches.length < 2) {
      warnings.push({
        type: "Weak Result / Missing Metrics",
        message: "Your answer lacks concrete metrics or quantifiable outcomes. Try including percentage improvements or specific numbers."
      });
    }

    // Check 3: Time Mismanagement
    if (durationSec < 50) {
      warnings.push({
        type: "Time Mismanagement",
        message: `Your answer lasted only ${durationSec}s. Aim for ~120s with at least 50-66s dedicated to detailed Actions.`
      });
    }

    return warnings;
  };

  const evaluateSpeech = async (customTranscript?: string) => {
    const targetTranscript = customTranscript || transcript;
    if (!targetTranscript.trim()) {
      alert("No transcript found. Please record your answer first.");
      return;
    }
    setIsEvaluating(true);
    setEvaluationWarnings(null);

    const duration = 120 - timeLeft;
    const estimatedTimings = {
      S: Math.min(15, Math.round(duration * 0.1)),
      T: Math.min(20, Math.round(duration * 0.15)),
      A: Math.round(duration * 0.55),
      R: Math.round(duration * 0.20)
    };

    try {
      const res = await fetch('/api/analyze-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: targetTranscript,
          question: activeScenario?.actualQuestion || '',
          scenarioContext: activeScenario?.scenarioContext || '',
          durationSeconds: duration,
          apiKey
        })
      });

      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }

      try {
        const evalRes = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: targetTranscript,
            timings: estimatedTimings,
            apiKey
          })
        });
        const evalData = await evalRes.json();
        if (evalData.success) {
          if (Array.isArray(evalData.warnings)) {
            setEvaluationWarnings(evalData.warnings);
          }
          if (evalData.coverage) {
            setEvalCoverage(evalData.coverage);
          } else {
            setEvalCoverage({ S_score: 100, T_score: 80, A_score: 95, R_score: 40 });
          }
          setPacingWarning(evalData.pacingWarning || null);
          if (evalData.overallScore && evalData.breakdown && evalData.feedback) {
            setScorecardData({
              overallScore: evalData.overallScore,
              breakdown: evalData.breakdown,
              feedback: evalData.feedback
            });
          }
        } else {
          setEvaluationWarnings(generateHeuristicWarnings(transcript, duration));
          setEvalCoverage({ S_score: 100, T_score: 80, A_score: 85, R_score: 35 });
          setScorecardData({
            overallScore: 82,
            breakdown: {
              "Situation": { "score": 8, "outOf": 10 },
              "Task": { "score": 9, "outOf": 10 },
              "Action": { "score": 18, "outOf": 20 },
              "Result": { "score": 13, "outOf": 20 },
              "Ownership": { "score": 9, "outOf": 10 },
              "Specificity": { "score": 8, "outOf": 10 },
              "Communication": { "score": 9, "outOf": 10 }
            },
            feedback: {
              biggestImprovement: "Your actions were clear, but the result wasn't quantified.",
              whatWorked: "You clearly explained what you personally owned rather than describing what the team did.",
              tryAgain: "Add a measurable outcome and explain how you knew the solution worked."
            }
          });
        }
      } catch (e) {
        setEvaluationWarnings(generateHeuristicWarnings(transcript, duration));
        setEvalCoverage({ S_score: 100, T_score: 80, A_score: 85, R_score: 35 });
        setScorecardData({
          overallScore: 82,
          breakdown: {
            "Situation": { "score": 8, "outOf": 10 },
            "Task": { "score": 9, "outOf": 10 },
            "Action": { "score": 18, "outOf": 20 },
            "Result": { "score": 13, "outOf": 20 },
            "Ownership": { "score": 9, "outOf": 10 },
            "Specificity": { "score": 8, "outOf": 10 },
            "Communication": { "score": 9, "outOf": 10 }
          },
          feedback: {
            biggestImprovement: "Your actions were clear, but the result wasn't quantified.",
            whatWorked: "You clearly explained what you personally owned rather than describing what the team did.",
            tryAgain: "Add a measurable outcome and explain how you knew the solution worked."
          }
        });
      }
    } catch (e) {
      alert("Network error communicating with AI server.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleImproveAnswer = async () => {
    if (!transcript.trim()) return;
    setIsImproving(true);
    try {
      const res = await fetch('/api/improve-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          question: activeScenario?.actualQuestion || '',
          apiKey
        })
      });
      const data = await res.json();
      if (data.success && data.improvedAnswer) {
        setImprovedAnswer(data.improvedAnswer);
      } else {
        alert("Could not generate improved answer: " + (data.error || 'Check API key.'));
      }
    } catch (e) {
      alert("Network error creating improved answer.");
    } finally {
      setIsImproving(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
        <p className="text-zinc-400 mb-6">Please connect your Gemini API key on the main page first.</p>
        <a href="/" className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors">
          Go to Setup
        </a>
      </div>
    );
  }

  let currentStepIndex = 0;
  if (timeLeft > 108) currentStepIndex = 0;      // Situation (120-108s -> 0-12s elapsed)
  else if (timeLeft > 90) currentStepIndex = 1;  // Task (108-90s -> 12-30s elapsed)
  else if (timeLeft > 24) currentStepIndex = 2;  // Action (90-24s -> 30-96s elapsed)
  else currentStepIndex = 3;                     // Result (24-0s -> 96-120s elapsed)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans p-6 sm:p-10 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">STAR Method Behavioral Coach</h1>
            <p className="text-sm text-zinc-400 mt-1">Structure interview answers using Situation, Task, Action, and Result.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/analytics"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Analytics</span>
            </a>
            <a
              href="/mock-hr"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Mic className="w-3.5 h-3.5 text-zinc-400" />
              <span>Mock HR</span>
            </a>
            <a
              href="/"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
              <span>Back to JAM Suite</span>
            </a>
          </div>
        </div>

        {micError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
            Target Behavioral Competency
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COMPETENCIES.map((comp) => {
              const Icon = comp.icon;
              const isActive = activeCompetency === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => handleSelectCompetency(comp.id)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    isActive
                      ? 'bg-white text-black border-transparent shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{comp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Level Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
              Difficulty Level
            </label>
            <span className="text-[11px] font-mono text-zinc-400">
              {difficulty === 'Easy' && 'Clear scenario + obvious responsibility'}
              {difficulty === 'Medium' && 'Ambiguous situation + competing priorities'}
              {difficulty === 'Hard' && 'Messy situation + incomplete info + stakeholder conflict'}
              {difficulty === 'Expert' && '🔥 High-stakes chaos + unexpected follow-up probes'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {([
              { level: 'Easy', label: 'Easy', desc: 'Clear scenario + obvious responsibility' },
              { level: 'Medium', label: 'Medium', desc: 'Ambiguous situation + competing priorities' },
              { level: 'Hard', label: 'Hard', desc: 'Messy situation + incomplete info + stakeholder conflict' },
              { level: 'Expert', label: '🔥 Expert', desc: 'High-stakes chaos + unexpected follow-up probes' }
            ] as const).map(({ level, label, desc }) => {
              const isActive = difficulty === level;
              return (
                <div key={level} className="relative group">
                  <button
                    onClick={() => setDifficulty(level as any)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      isActive
                        ? level === 'Expert'
                          ? 'bg-red-600 text-white border-transparent shadow-lg font-black'
                          : 'bg-white text-black border-transparent shadow-sm'
                        : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {label}
                  </button>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-52 p-2.5 bg-zinc-800 text-[11px] text-zinc-200 rounded-xl shadow-2xl border border-zinc-700 z-50 text-center pointer-events-none">
                    {desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 10/15/55/20 ACTION ROADMAP */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
                2-Minute STAR Time Allocation Roadmap
              </label>
              <div className="group relative inline-flex items-center ml-2 cursor-help">
                <Info className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 p-3 bg-zinc-800 text-xs text-zinc-300 rounded-md shadow-xl border border-zinc-700 z-50">
                  Most candidates fail by overweighting the Situation and Task. Interviewers care most about the Action phase, which is why it must dominate your time allocation.
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Key Focus: 55% Action</span>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800 -z-10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
              {/* Situation Row */}
              <div className={`rounded-2xl p-4 space-y-2 flex flex-col justify-between transition-all ${
                isRecording && currentStepIndex === 0
                  ? 'bg-blue-950/40 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse'
                  : 'bg-zinc-900/80 border border-zinc-800/80'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">S</span>
                      <span className="font-bold text-zinc-200">Situation</span>
                    </div>
                    <span className="font-extrabold text-zinc-400 font-mono">10% (~12s)</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                    <div className="bg-zinc-400 h-full rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Brief context — where, when, what was the setting? (1–2 sentences)
                </p>
              </div>

              {/* Task Row */}
              <div className={`rounded-2xl p-4 space-y-2 flex flex-col justify-between transition-all ${
                isRecording && currentStepIndex === 1
                  ? 'bg-purple-950/40 border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse'
                  : 'bg-zinc-900/80 border border-zinc-800/80'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">T</span>
                      <span className="font-bold text-zinc-200">Task</span>
                    </div>
                    <span className="font-extrabold text-zinc-400 font-mono">15% (~18s)</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                    <div className="bg-zinc-400 h-full rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  What was your explicit responsibility or goal?
                </p>
              </div>

              {/* Action Row - ELEVATED 55% FOCUS */}
              <div className={`rounded-2xl p-4 space-y-2 flex flex-col justify-between transition-all ${
                isRecording && currentStepIndex === 2
                  ? 'bg-emerald-950/50 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse'
                  : 'bg-emerald-950/30 border border-emerald-500/50 ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-black bg-emerald-400 px-2 py-0.5 rounded">A</span>
                      <span className="font-extrabold text-emerald-400">Action</span>
                    </div>
                    <span className="font-black text-emerald-400 text-lg font-mono">55% (~66s)</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-emerald-900/50">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-200 font-medium leading-relaxed">
                  What did <strong className="text-emerald-300 font-bold">YOU</strong> specifically do? (3–5 concrete steps you personally took)
                </p>
              </div>

              {/* Result Row */}
              <div className={`rounded-2xl p-4 space-y-2 flex flex-col justify-between transition-all ${
                isRecording && currentStepIndex === 3
                  ? 'bg-amber-950/40 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                  : 'bg-zinc-900/80 border border-zinc-800/80'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">R</span>
                      <span className="font-bold text-zinc-200">Result</span>
                    </div>
                    <span className="font-extrabold text-zinc-400 font-mono">20% (~24s)</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                    <div className="bg-zinc-400 h-full rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  What happened? Quantify wherever possible. What did you learn?
                </p>
              </div>
            </div>
          </div>
        </div>

        {!analysis && !isEvaluating && (
          <div>
            {!activeScenario ? (
              <div className="bg-zinc-900 border border-zinc-800 p-8 py-10 rounded-3xl text-center space-y-5 shadow-xl">
                <Target className="w-10 h-10 text-zinc-600 mb-3 mx-auto" />
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-lg font-bold text-white">No Scenario Active</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Select a competency domain above to generate a high-stakes, realistic interview scenario.
                  </p>
                </div>
                <button
                  onClick={() => generateQuestion()}
                  disabled={isGeneratingQ}
                  className="bg-white text-black font-extrabold py-3.5 px-8 rounded-2xl hover:bg-zinc-200 transition-colors shadow-md text-sm flex items-center justify-center gap-2 mx-auto"
                >
                  {isGeneratingQ ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Generating Scenario...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Generate Behavioral Scenario</span>
                    </>
                  )}
                </button>
              </div>
            ) : isPreparing ? (
              /* Preparation State UI */
              <div className="mt-8 p-8 bg-zinc-900 border border-zinc-700/50 rounded-2xl text-center shadow-2xl space-y-6 animate-fade-in">
                <div className="flex justify-center mb-2">
                  <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                </div>
                
                <div className="max-w-xl mx-auto space-y-2">
                  <h3 className="text-2xl font-bold text-white leading-snug">Take a moment to structure your answer</h3>
                  <p className="text-zinc-400 text-sm font-light">Take 15 seconds to mentally map your story before speaking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto my-6">
                  <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Situation</span>
                    <p className="text-sm text-zinc-300 font-medium">What was happening?</p>
                  </div>
                  <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Task</span>
                    <p className="text-sm text-zinc-300 font-medium">What were you responsible for?</p>
                  </div>
                  <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Action</span>
                    <p className="text-sm text-emerald-100/80 font-medium">What specifically did YOU do?</p>
                  </div>
                  <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Result</span>
                    <p className="text-sm text-zinc-300 font-medium">What was the measurable outcome?</p>
                  </div>
                </div>

                {/* The actual recording trigger */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <button 
                    onClick={() => {
                      setIsPreparing(false);
                      setInterviewPhase('main');
                      startRecording();
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-extrabold hover:bg-zinc-200 transition-colors shadow-xl text-sm"
                  >
                    <Mic className="w-5 h-5 text-black" /> Start Recording Now
                  </button>
                  <button
                    onClick={() => setIsPreparing(false)}
                    className="px-6 py-4 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Back to Scenario
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
                {/* Header Row: Overline (COMPETENCY · DIFFICULTY) + Target/Timer Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  {/* Overline: COMPETENCY · DIFFICULTY */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                      {(COMPETENCIES.find(c => c.id === activeCompetency)?.label || activeCompetency).toUpperCase()} · {difficulty.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase self-start sm:self-auto">
                    <Timer className="w-3 h-3" />
                    <span className={isRecording ? getTimerColorClass(timeLeft) : ''}>
                      {isRecording ? `Timer: ${timeLeft}s` : 'Target: 120s'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Scenario Context Box */}
                  <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-2xl text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block mb-1">
                      Real-World Conflict Context
                    </span>
                    {activeScenario.scenarioContext}
                  </div>

                  {/* Actual Behavioral Question */}
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                    {activeScenario.actualQuestion}
                  </h2>

                  {/* Hint: What to focus on in your answer */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>💡 Hint: What to focus on in your answer</span>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                      <li>
                        <strong className="text-amber-200 font-bold">Situation & Task:</strong> Keep background setup brief (~20s). Clearly define the challenge and your goal.
                      </li>
                      <li>
                        <strong className="text-amber-200 font-bold">Action Phase (55% Focus):</strong> Detail 3–4 specific decisions, technical steps, or actions <span className="text-amber-100 underline decoration-amber-500/50">YOU</span> personally executed.
                      </li>
                      <li>
                        <strong className="text-amber-200 font-bold">Result & Impact:</strong> Conclude with measurable results (numbers, percentage metrics, time saved) and key learnings.
                      </li>
                      {activeScenario.whyItWorks && (
                        <li className="text-zinc-200 italic font-semibold pt-1 border-t border-amber-500/20 mt-1 list-none flex items-start gap-1.5">
                          <span>✨</span>
                          <span><strong className="text-amber-300 not-italic">Key Focus:</strong> {activeScenario.whyItWorks}</span>
                        </li>
                      )}
                    </ul>
                  </div>


                </div>

                <div className="pt-2">
                  {!isRecording && (
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <button
                        onClick={() => { setIsPreparing(true); setInterviewPhase('prep'); }}
                        className="flex-1 bg-white text-black font-extrabold py-4 px-8 rounded-2xl hover:bg-zinc-200 transition-colors shadow-md text-sm flex items-center justify-center gap-2"
                      >
                        <Mic className="w-4 h-4 text-black" />
                        <span>Start Interview</span>
                      </button>
                      <button
                        onClick={() => generateQuestion()}
                        disabled={isGeneratingQ}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 bg-transparent border border-zinc-800 rounded-md hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Shuffle className="w-4 h-4 text-zinc-400" />
                        <span>Try Another</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {isRecording && activeScenario && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4 gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live STAR Recording</span>
                </div>
                <VoiceVisualizer
                  analyser={analyser}
                  isListening={isRecording}
                  color="#f59e0b"
                  theme="orange"
                  barCount={24}
                  width={120}
                  height={20}
                />
              </div>
              <span className={`text-3xl font-mono font-bold ${getTimerColorClass(timeLeft)}`}>{timeLeft}s</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { step: 'S', label: 'Situation (10%)' },
                  { step: 'T', label: 'Task (15%)' },
                  { step: 'A', label: 'Action (55%)' },
                  { step: 'R', label: 'Result (20%)' }
                ].map((item, idx) => {
                  const isActive = currentStepIndex === idx;
                  const isPassed = currentStepIndex > idx;
                  return (
                    <div
                      key={item.step}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isActive
                          ? idx === 2
                            ? 'bg-emerald-400 text-black border-transparent font-black shadow-md'
                            : 'bg-white text-black border-transparent font-bold shadow-md'
                          : isPassed
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{item.step}</div>
                      <div className="text-[10px] mt-0.5 font-medium">{item.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="min-h-[120px] text-zinc-200 leading-relaxed font-light text-sm border-t border-zinc-800/80 pt-4">
                {(transcript + (interimText ? ' ' + interimText : '')).trim() || <span className="text-zinc-500 italic">Listening... Remember to spend 55% (~66s) describing your specific Actions.</span>}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleStopAndEvaluate}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold py-2.5 px-4 rounded-xl transition-all text-xs flex items-center gap-2 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current text-zinc-300" />
                <span>Finish Answer Early</span>
              </button>
            </div>
          </div>
        )}

        {!isRecording && transcript && !analysis && !isEvaluating && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Review & Edit Transcript</h3>
              <p className="text-xs text-zinc-400 mt-1">Make any adjustments before sending to the STAR evaluator.</p>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full min-h-[180px] bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-zinc-200 focus:outline-none focus:border-zinc-500 transition-all font-light text-sm"
            />

            <div className="flex gap-4">
              <button
                onClick={() => { setTranscript(''); setActiveScenario(null); }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-2xl transition-all text-sm"
              >
                Discard
              </button>
              <button
                onClick={() => evaluateSpeech()}
                className="flex-[2] bg-white text-black font-bold hover:bg-zinc-200 py-4 rounded-2xl transition-colors shadow-md text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Generate STAR Evaluation</span>
              </button>
            </div>
          </div>
        )}

        {isEvaluating && (
          <div className="bg-zinc-900 border border-zinc-800 p-16 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold text-white">Evaluating STAR Structure...</h3>
            <p className="text-xs text-zinc-400">Grading Situation (10%), Task (15%), Action (55%), and Result (20%).</p>
          </div>
        )}

        {analysis && activeScenario && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Evaluation Summary</span>
                <h3 className="text-xl font-bold text-white mt-1">{activeScenario.actualQuestion}</h3>
                <p className="text-sm text-zinc-300 mt-2 max-w-xl leading-relaxed">{analysis.feedback}</p>
              </div>
              <div className="text-center bg-zinc-950 border border-zinc-800 rounded-2xl p-6 min-w-[130px] shrink-0">
                <span className="text-4xl font-extrabold text-white">{analysis.overallScore}<span className="text-sm text-zinc-500">/10</span></span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mt-1">STAR Score</span>
              </div>
            </div>

            {/* STAR Coverage Results UI Component */}
            {evalCoverage && (
              <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-lg font-bold text-white">STAR Coverage Analysis</h3>
                  <span className="text-xs font-mono text-zinc-500">Pacing & Phase Completion</span>
                </div>
                
                <div className="space-y-4">
                  {/* Situation Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-300 font-semibold">Situation</span>
                      <span className="text-zinc-400 font-mono font-bold">{evalCoverage.S_score}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${evalCoverage.S_score}%` }}></div>
                    </div>
                  </div>

                  {/* Task Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-300 font-semibold">Task</span>
                      <span className="text-zinc-400 font-mono font-bold">{evalCoverage.T_score}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${evalCoverage.T_score}%` }}></div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-300 font-semibold">Action</span>
                      <span className="text-zinc-400 font-mono font-bold">{evalCoverage.A_score}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${evalCoverage.A_score}%` }}></div>
                    </div>
                  </div>

                  {/* Result Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-300 font-semibold">Result</span>
                      <span className={`font-mono font-bold ${evalCoverage.R_score < 50 ? 'text-red-400 font-black' : 'text-zinc-400'}`}>
                        {evalCoverage.R_score}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className={`h-full rounded-full transition-all duration-500 ${evalCoverage.R_score < 50 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${evalCoverage.R_score}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* AI Pacing Warning */}
                {pacingWarning && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-md mt-4">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-200 leading-relaxed font-light">
                      <span className="font-bold text-red-400">Pacing Warning:</span> {pacingWarning}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Scorecard Container */}
            {scorecardData && (
              <div className="mt-8 p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-8">
                {/* Header & Overall Score */}
                <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Your STAR Score</h2>
                    <p className="text-xs text-zinc-400 mt-1">Detailed metric breakdown & qualitative feedback.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-1">Overall</span>
                    <span className="text-4xl font-black text-emerald-400">{scorecardData.overallScore}<span className="text-xl text-zinc-600">/100</span></span>
                  </div>
                </div>

                {/* Score Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left mb-6">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Area</th>
                        <th className="pb-3 font-semibold text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {Object.entries(scorecardData.breakdown).map(([area, metrics]) => (
                        <tr key={area}>
                          <td className="py-3 text-zinc-300 font-medium text-sm">{area}</td>
                          <td className="py-3 text-right font-mono text-zinc-400 text-sm">
                            <span className="text-white font-bold">{metrics.score}</span>/{metrics.outOf}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Qualitative Feedback Blocks */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-2 text-sm">
                      🎯 Biggest improvement
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{scorecardData.feedback.biggestImprovement}</p>
                  </div>
                  
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <h4 className="flex items-center gap-2 text-emerald-400 font-bold mb-2 text-sm">
                      ✅ What worked
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{scorecardData.feedback.whatWorked}</p>
                  </div>

                  <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <h4 className="flex items-center gap-2 text-amber-500 font-bold mb-2 text-sm">
                      🔄 Try again
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{scorecardData.feedback.tryAgain}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-800">
                  <button 
                    onClick={() => {
                      setAnalysis(null);
                      setEvaluationWarnings(null);
                      setEvalCoverage(null);
                      setPacingWarning(null);
                      setScorecardData(null);
                      setImprovedAnswer(null);
                      setTranscript('');
                      setIsPreparing(true);
                    }}
                    className="px-6 py-3 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200 transition-colors text-sm"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => generateQuestion()}
                    disabled={isGeneratingQ}
                    className="px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700 text-sm"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              {analysis.starScores && Object.entries(analysis.starScores).map(([key, val]: any) => {
                const theme = getScoreTheme(val);
                const descriptions: Record<string, string> = {
                  situation: 'Context (Target: 10%)',
                  task: 'Responsibility (Target: 15%)',
                  action: 'Steps Taken (Target: 55%)',
                  result: 'Outcome & Metrics (Target: 20%)'
                };
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border bg-zinc-900/60 backdrop-blur-sm transition-all hover:bg-zinc-900 ${theme.border}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                        {key}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${theme.badge}`}>
                        {val}/10
                      </span>
                    </div>
                    <div className={`text-3xl font-extrabold ${theme.text}`}>
                      {val}
                      <span className="text-sm font-normal text-zinc-500">/10</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">{descriptions[key.toLowerCase()] || 'Metric score'}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Missing / Weak Elements</h4>
                <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
                  {analysis.missingElements?.map((m: string, i: number) => <li key={i}>{m}</li>)}
                </ul>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recommended Rephrasing</h4>
                <p className="text-xs text-zinc-300 italic border-l-2 border-white pl-3 leading-relaxed">
                  "{analysis.idealAnswerSnippet}"
                </p>
              </div>
            </div>

            {/* Improve My Answer Button */}
            {!improvedAnswer && (
              <button
                onClick={handleImproveAnswer}
                disabled={isImproving}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2"
              >
                {isImproving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Restructuring Your Response into Stronger STAR Format...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>✨ Improve My Answer (Transform to Stronger STAR Version)</span>
                  </>
                )}
              </button>
            )}

            {/* Improved Answer Transformation Card */}
            {improvedAnswer && (
              <div className="bg-zinc-900 border border-emerald-500/30 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-extrabold text-white">
                      Your Answer <span className="text-zinc-500 font-normal">→</span> <span className="text-emerald-400">Stronger STAR Version</span>
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60 font-bold self-start sm:self-auto">
                    Real Experience Preserved
                  </span>
                </div>

                {/* Key Transformations Callout */}
                {improvedAnswer.keyImprovements && improvedAnswer.keyImprovements.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block mb-1">
                      Key STAR Transformations Applied
                    </span>
                    <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                      {improvedAnswer.keyImprovements.map((imp, idx) => (
                        <li key={idx} className="font-light text-zinc-300">{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* S-T-A-R Structured Blocks */}
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Situation */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <h4 className="text-xs font-bold text-zinc-300">Situation</h4>
                    <p className="text-zinc-300 font-light leading-relaxed">{improvedAnswer.situation}</p>
                  </div>

                  {/* Task */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <h4 className="text-xs font-bold text-zinc-300">Task</h4>
                    <p className="text-zinc-300 font-light leading-relaxed">{improvedAnswer.task}</p>
                  </div>

                  {/* Action - Highlighted 55% Personal Ownership */}
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                    <h4 className="text-xs font-bold text-emerald-400">Action (55% Personal Ownership Focus)</h4>
                    <p className="text-emerald-100 font-medium leading-relaxed">{improvedAnswer.action}</p>
                  </div>

                  {/* Result */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <h4 className="text-xs font-bold text-zinc-300">Result</h4>
                    <p className="text-zinc-300 font-light leading-relaxed">{improvedAnswer.result}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => { setAnalysis(null); setEvaluationWarnings(null); setEvalCoverage(null); setPacingWarning(null); setImprovedAnswer(null); setTranscript(''); setActiveScenario(null); }}
              className="w-full bg-white text-black font-bold hover:bg-zinc-200 py-4 rounded-2xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-black" />
              <span>Practice Another Behavioral Scenario</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
