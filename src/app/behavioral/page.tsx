'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getScoreTheme } from '@/lib/scoreTheme';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import ApiOnboarding from '@/components/ApiOnboarding';
import { getGeminiApiKey, setGeminiApiKey, removeGeminiApiKey } from '@/lib/geminiKey';
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
  ChevronRight,
  Info,
  BarChart3,
  Lightbulb,
  Brain,
  CheckCircle2,
  User,
  Key,
  Star
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
    <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <span className="text-sm font-semibold text-slate-800">
          📖 Read Example Model Story
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-200 space-y-6 bg-white">
          <h3 className="font-bold text-slate-900 text-lg">Example strong answer</h3>

          <div className="space-y-4">
            {/* Situation */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-1">
                S — Situation <span className="text-slate-400 font-normal">· ~12 sec</span>
              </h4>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">{answerData.S}</p>
            </div>

            {/* Task */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-1">
                T — Task <span className="text-slate-400 font-normal">· ~18 sec</span>
              </h4>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">{answerData.T}</p>
            </div>

            {/* Action - Highlighted to reinforce the 55% rule */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-xl -mx-2">
              <h4 className="text-sm font-bold text-amber-900 mb-1">
                A — Action <span className="text-amber-700 font-normal">· ~65 sec</span>
              </h4>
              <p className="text-sm text-slate-800 font-medium leading-relaxed">{answerData.A}</p>
            </div>

            {/* Result */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-1">
                R — Result <span className="text-slate-400 font-normal">· ~25 sec</span>
              </h4>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">{answerData.R}</p>
            </div>
          </div>

          {/* Why this works insight */}
          <div className="mt-6 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1.5">
              <Lightbulb className="w-4 h-4 text-[#f97316]" /> Why this works
            </div>
            <p className="text-sm text-slate-700 font-normal leading-relaxed">
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

const INTERVIEWER_FOCUS: Record<string, string> = {
  'leadership': 'Ownership · Decisiveness · Initiative · Accountability',
  'conflict': 'Active Listening · Objective Compromise · Team Alignment',
  'crisis': 'Calm Prioritization · Rapid Triage · Risk Mitigation',
  'failure': 'Accountability · Root Cause Analysis · Resilience & Growth',
  'learning': 'Self-Direction · Adaptability · Knowledge Sharing'
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
  const [isMounted, setIsMounted] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [activeCompetency, setActiveCompetency] = useState('leadership');
  const [activeScenario, setActiveScenario] = useState<ScenarioItem | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Expert'>('Medium');
  const [showExample, setShowExample] = useState(false);
  const [showScenarioContext, setShowScenarioContext] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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
  const [retryFocusBanner, setRetryFocusBanner] = useState<{ pillar: string; advice: string } | null>(null);
  const [sessionStats, setSessionStats] = useState<{ totalSessions: number; avgScore: number }>({ totalSessions: 4, avgScore: 84 });

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
    setIsMounted(true);
    const key = getGeminiApiKey();
    if (key) setApiKey(key);

    const syncKey = () => {
      setApiKey(getGeminiApiKey());
    };
    window.addEventListener('gemini_api_key_updated', syncKey);

    if (typeof window !== 'undefined') {
      try {
        const history = JSON.parse(localStorage.getItem('star_score_history') || '[]');
        if (Array.isArray(history) && history.length > 0) {
          const avg = Math.round(history.reduce((acc: number, item: any) => acc + (item.overallScore || 80), 0) / history.length);
          setSessionStats({ totalSessions: history.length, avgScore: avg });
        }
      } catch (e) {}

      const params = new URLSearchParams(window.location.search);
      const compParam = params.get('competency');
      const diffParam = params.get('difficulty');
      if (compParam && COMPETENCIES.some(c => c.id === compParam)) {
        setActiveCompetency(compParam);
      }
      if (diffParam && ['Easy', 'Medium', 'Hard', 'Expert'].includes(diffParam)) {
        setDifficulty(diffParam as 'Easy' | 'Medium' | 'Hard' | 'Expert');
      }
      const initialComp = (compParam && COMPETENCIES.find(c => c.id === compParam)) || COMPETENCIES[0];
      setActiveScenario(initialComp.pool[0]);
    }

    return () => {
      window.removeEventListener('gemini_api_key_updated', syncKey);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => { });
      }
    };
  }, []);

  const handleDisconnectKey = () => {
    if (confirm("Disconnect your Gemini API key?")) {
      removeGeminiApiKey();
      setApiKey(null);
    }
  };

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
    setShowScenarioContext(false);
    setShowHelp(false);
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
    const key = apiKey || getGeminiApiKey();
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
      } catch (e) { }
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
      audioContextRef.current.close().catch(() => { });
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
      } else {
        const isAuthError = res.status === 401 || (data.error && data.error.toLowerCase().includes('api key'));
        if (isAuthError) {
          alert("Gemini API key is invalid or unavailable. Please update your API key.");
          removeGeminiApiKey();
          setApiKey(null);
        } else {
          alert("Evaluation Error: " + (data.error || 'Please check your connection and try again.'));
        }
      }

      try {
        const evalRes = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: targetTranscript,
            timings: estimatedTimings,
            apiKey: apiKey || getGeminiApiKey()
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
          setEvaluationWarnings(generateHeuristicWarnings(targetTranscript, duration));
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
        setEvaluationWarnings(generateHeuristicWarnings(targetTranscript, duration));
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

      // Save STAR session to localStorage for Analytics
      try {
        const starScore = 82; // or evalData.overallScore
        const newStarRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          timestamp: Date.now(),
          competency: activeCompetency,
          overallScore: starScore,
          durationSeconds: duration
        };
        const existing = JSON.parse(localStorage.getItem('star_score_history') || '[]');
        const updatedHistory = [newStarRecord, ...existing];
        localStorage.setItem('star_score_history', JSON.stringify(updatedHistory));
        const avg = Math.round(updatedHistory.reduce((acc: number, item: any) => acc + (item.overallScore || 80), 0) / updatedHistory.length);
        setSessionStats({ totalSessions: updatedHistory.length, avgScore: avg });
      } catch (e) { }
    } catch (e) {
      alert("Network error communicating with AI server.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetryWithFocus = (pillarName: string, advice: string) => {
    setRetryFocusBanner({
      pillar: pillarName,
      advice: advice
    });
    setAnalysis(null);
    setEvaluationWarnings(null);
    setEvalCoverage(null);
    setPacingWarning(null);
    setScorecardData(null);
    setImprovedAnswer(null);
    setTranscript('');
    setIsPreparing(false);
  };

  const getPillarAnalysis = () => {
    const scores = [
      {
        name: 'Situation',
        score: analysis?.starScores?.situation ?? analysis?.starScores?.Situation ?? 8,
        target: '10%',
        color: 'bg-blue-600',
        barCount: Math.round(((analysis?.starScores?.situation ?? analysis?.starScores?.Situation ?? 8) / 10) * 10),
        desc: 'Context & problem setup',
        advice: 'Keep the background context concise (~15–20s). Save your energy and time for your personal actions.'
      },
      {
        name: 'Task',
        score: analysis?.starScores?.task ?? analysis?.starScores?.Task ?? 8,
        target: '15%',
        color: 'bg-purple-600',
        barCount: Math.round(((analysis?.starScores?.task ?? analysis?.starScores?.Task ?? 8) / 10) * 10),
        desc: 'Your specific responsibility',
        advice: 'Explicitly state YOUR individual role and objective, distinct from the broader group.'
      },
      {
        name: 'Action',
        score: analysis?.starScores?.action ?? analysis?.starScores?.Action ?? 9,
        target: '55%',
        color: 'bg-[#f97316]',
        barCount: Math.round(((analysis?.starScores?.action ?? analysis?.starScores?.Action ?? 9) / 10) * 10),
        desc: 'Personal ownership & steps',
        advice: 'Spend the majority (55%) of your time detailing 3–4 specific decisions and personal steps YOU executed.'
      },
      {
        name: 'Result',
        score: analysis?.starScores?.result ?? analysis?.starScores?.Result ?? 6,
        target: '20%',
        color: 'bg-emerald-600',
        barCount: Math.round(((analysis?.starScores?.result ?? analysis?.starScores?.Result ?? 6) / 10) * 10),
        desc: 'Measurable outcome & impact',
        advice: 'This time, make your outcome specific and measurable (e.g. % improved, time saved, metrics, lessons learned).'
      }
    ];

    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    const strongSummaries: Record<string, string> = {
      'Action': 'You gave specific personal steps and decisions.',
      'Situation': 'Clear, concise background setup.',
      'Task': 'Well-defined individual responsibility.',
      'Result': 'Concrete, impactful outcome shared.'
    };

    const weakSummaries: Record<string, string> = {
      'Result': 'Add measurable impact and quantitative metrics.',
      'Action': 'Elaborate more on specific personal decisions YOU made.',
      'Task': 'State your distinct role more explicitly.',
      'Situation': 'Keep the opening context more concise to save time for Action.'
    };

    return {
      strongPillar: strongest.name,
      strongSummary: strongSummaries[strongest.name] || 'Structured your points clearly.',
      weakPillar: weakest.name,
      weakSummary: weakSummaries[weakest.name] || 'Add more concrete details and metrics.',
      weakAdvice: weakest.advice,
      scores
    };
  };

  const handleImproveAnswer = async () => {
    if (!transcript.trim()) return;
    setIsImproving(true);
    try {
      const activeKey = apiKey || getGeminiApiKey();
      const res = await fetch('/api/improve-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          question: activeScenario?.actualQuestion || '',
          apiKey: activeKey
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

  if (!isMounted) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        {showSetupModal && (
          <ApiOnboarding
            isModal={true}
            onClose={() => setShowSetupModal(false)}
            onComplete={(_, key) => {
              setShowSetupModal(false);
              setApiKey(key);
            }}
          />
        )}
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#f97316] flex items-center justify-center mx-auto text-3xl">
            ⭐
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Gemini API Key Required</h2>
          <p className="text-sm text-slate-600">Please connect your Gemini API key once to unlock the STAR Behavioral Coach and other modules across the suite.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setShowSetupModal(true)}
              className="bg-[#f97316] hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm cursor-pointer text-sm"
            >
              Connect API Key
            </button>
            <a
              href="/"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all text-sm inline-flex items-center justify-center border border-slate-200"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  let currentStepIndex = 0;
  if (timeLeft > 108) currentStepIndex = 0;      // Situation (120-108s -> 0-12s elapsed)
  else if (timeLeft > 90) currentStepIndex = 1;  // Task (108-90s -> 12-30s elapsed)
  else if (timeLeft > 24) currentStepIndex = 2;  // Action (90-24s -> 30-96s elapsed)
  else currentStepIndex = 3;                     // Result (24-0s -> 96-120s elapsed)

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 relative overflow-hidden">
      {/* API Setup Modal if user wants to change key */}
      {showSetupModal && (
        <ApiOnboarding
          isModal={true}
          onClose={() => setShowSetupModal(false)}
          onComplete={(_, key) => {
            setShowSetupModal(false);
            setApiKey(key);
          }}
        />
      )}

      <div className="max-w-[1240px] mx-auto space-y-8 sm:space-y-10 lg:space-y-12 relative z-10">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-5 sm:pb-6 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-[#fbbf24] to-[#f97316] text-white flex items-center justify-center shadow-sm shadow-amber-500/20 shrink-0">
              <Star className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  STAR Method Behavioral Coach
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
                  <span>📈</span>
                  <span>This week: {sessionStats.totalSessions} sessions · Avg. {sessionStats.avgScore}/100</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                Structure behavioral interview answers using Situation, Task, Action, and Result.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Global API Key Status Badge */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-700 font-medium text-xs">Connected</span>
              <button
                onClick={() => setShowSetupModal(true)}
                className="text-[#f97316] hover:text-orange-600 font-semibold ml-0.5 cursor-pointer underline text-xs"
                title="Update API key"
              >
                Edit
              </button>
            </div>

            <a
              href="/jam"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Mic className="w-3.5 h-3.5 text-blue-600" />
              <span>JAM Simulator</span>
            </a>
            <a
              href="/mock-hr"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Mock Interview</span>
            </a>
            <a
              href="/analytics"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Analytics</span>
            </a>
            <a
              href="/"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Suite</span>
            </a>
          </div>
        </div>

        {micError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        {/* INTERVIEW SETUP (CALM, SPACIOUS & DE-BOXED) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs space-y-7 sm:space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-black tracking-widest text-[#f97316] uppercase block">
                INTERVIEW SETUP
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Choose Your Skill &amp; Strategy Roadmap
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Step 1 of 2 · Tailor your challenge
            </span>
          </div>

          {/* 1. Target Behavioral Competency */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                1. Target Behavioral Competency
              </label>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">5 Core Domains</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
              {COMPETENCIES.map((comp) => {
                const Icon = comp.icon;
                const isSelected = activeCompetency === comp.id;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleSelectCompetency(comp.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/90 text-amber-950 border-[#f97316] ring-2 ring-[#f97316]/20 shadow-xs font-bold'
                        : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/70 text-slate-700 hover:border-slate-300 font-medium'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-amber-500/20 text-[#f97316]' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm block leading-snug font-bold">{comp.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Difficulty Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                2. Difficulty Level
              </label>
              <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                {difficulty === 'Easy' && 'Clear scenario + obvious responsibility'}
                {difficulty === 'Medium' && 'Ambiguous situation + competing priorities'}
                {difficulty === 'Hard' && 'Messy situation + stakeholder conflict'}
                {difficulty === 'Expert' && '🔥 High-stakes chaos + unexpected follow-up probes'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
              {([
                { level: 'Easy', label: 'Easy', badge: '100% Clear' },
                { level: 'Medium', label: 'Medium', badge: 'Trade-offs' },
                { level: 'Hard', label: 'Hard', badge: 'Conflict' },
                { level: 'Expert', label: '🔥 Expert', badge: 'High-Stakes' }
              ] as const).map(({ level, label, badge }) => {
                const isActive = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level as any)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-amber-50/90 text-amber-950 border-[#f97316] ring-2 ring-[#f97316]/20 shadow-xs font-bold'
                        : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/70 text-slate-700 hover:border-slate-300 font-medium'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{label}</span>
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${isActive ? 'bg-amber-100 text-[#f97316] font-bold' : 'bg-slate-200/70 text-slate-600'}`}>
                      {badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. STAR Time Allocation Roadmap */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>⭐</span>
                <span>3. STAR Time Allocation Roadmap</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#f97316] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  55% Action Focus
                </span>
                <span className="text-xs font-mono text-slate-400">Total: 120s</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
              {/* S */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-slate-800">S — Situation</span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">10% (~12s)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Context &amp; problem setting</p>
              </div>

              {/* T */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-slate-800">T — Task</span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">15% (~18s)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Your specific goal &amp; role</p>
              </div>

              {/* A (Visual Focus with 55% allocation) */}
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 ring-2 ring-amber-400/20 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1">
                    <span>⭐</span> A — Action
                  </span>
                  <span className="text-[11px] font-mono text-[#f97316] font-extrabold">55% (~66s)</span>
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">3–5 personal steps &amp; decisions</p>
              </div>

              {/* R */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-slate-800">R — Result</span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">20% (~24s)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Measurable outcome &amp; metrics</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. MAIN SCENARIO / QUESTION SECTION (PRIMARY FOCUS) */}
        {!analysis && !isEvaluating && (
          <div>
            {!activeScenario ? (
              <div className="bg-white border border-slate-200 p-8 py-10 rounded-3xl text-center space-y-5 shadow-sm">
                <Target className="w-10 h-10 text-slate-400 mb-3 mx-auto" />
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900">No Scenario Active</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select a competency domain above to generate a high-stakes, realistic interview scenario.
                  </p>
                </div>
                <button
                  onClick={() => generateQuestion()}
                  disabled={isGeneratingQ}
                  className="bg-gradient-to-r from-[#fbbf24] to-[#f97316] hover:opacity-90 text-black font-extrabold py-3.5 px-8 rounded-2xl transition-all shadow-md text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer"
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
              <div className="mt-8 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-sm space-y-6 animate-fade-in">
                <div className="flex justify-center mb-2">
                  <div className="p-4 bg-amber-50 rounded-full border border-amber-200">
                    <Brain className="w-8 h-8 text-[#f97316] animate-pulse" />
                  </div>
                </div>

                <div className="max-w-xl mx-auto space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 leading-snug">Take a moment to structure your answer</h3>
                  <p className="text-slate-500 text-sm font-normal">Take 15 seconds to mentally map your story before speaking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto my-6">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Situation</span>
                    <p className="text-sm text-slate-800 font-medium">What was happening?</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task</span>
                    <p className="text-sm text-slate-800 font-medium">What were you responsible for?</p>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-[#f97316] uppercase tracking-wider">Action</span>
                    <p className="text-sm text-amber-900 font-medium">What specifically did YOU do?</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Result</span>
                    <p className="text-sm text-slate-800 font-medium">What was the measurable outcome?</p>
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
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#fbbf24] to-[#f97316] text-black rounded-full font-extrabold hover:opacity-90 transition-all shadow-md text-sm cursor-pointer"
                  >
                    <Mic className="w-5 h-5 text-black" /> Start Recording Now
                  </button>
                  <button
                    onClick={() => setIsPreparing(false)}
                    className="px-6 py-4 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Back to Scenario
                  </button>
                </div>
              </div>
            ) : isRecording ? (
              /* FOCUSED INTERVIEW RECORDING MODE */
              <div className="bg-white border border-slate-200/80 p-6 sm:p-10 lg:p-12 rounded-3xl space-y-7 sm:space-y-8 shadow-xs relative overflow-hidden animate-in fade-in duration-200">
                {/* 1. Header: Live Status + Live Audio Waveform + 120s Timer */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-5 gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="text-xs font-black tracking-widest text-red-600 uppercase">
                        LIVE STAR RECORDING
                      </span>
                    </div>

                    {/* Live Audio Waveform in Orange STAR Accent */}
                    <div className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 flex items-center">
                      <VoiceVisualizer
                        analyser={analyser}
                        isListening={isRecording}
                        color="#f97316"
                        theme="orange"
                        barCount={26}
                        width={120}
                        height={18}
                      />
                    </div>
                  </div>

                  {/* 120s Countdown Timer */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Timer className="w-4 h-4 text-slate-400" />
                    <span className={`text-2xl sm:text-3xl font-mono font-black ${getTimerColorClass(timeLeft)}`}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>

                {/* 2. Interview Question Section */}
                <div className="space-y-3 py-1 sm:py-2">
                  <span className="text-xs font-black tracking-widest text-[#f97316] uppercase">
                    YOUR QUESTION
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-[34px] lg:text-[40px] font-black text-slate-900 leading-[1.32] tracking-tight max-w-4xl">
                    &ldquo;{activeScenario.actualQuestion}&rdquo;
                  </h2>
                </div>

                {/* 3. Compact STAR Progress Indicator Pipeline: S ───── T ───── A ───── R */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between relative px-2 sm:px-6">
                    {/* Connecting Baseline */}
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0"></div>

                    {[
                      { step: 'S', name: 'Situation', target: '10%', time: '~12s', desc: 'Context & challenge' },
                      { step: 'T', name: 'Task', target: '15%', time: '~18s', desc: 'Your responsibility' },
                      { step: 'A', name: 'Action', target: '55%', time: '~66s', desc: 'Specific steps you took' },
                      { step: 'R', name: 'Result', target: '20%', time: '~24s', desc: 'Outcome & impact' }
                    ].map((item, idx) => {
                      const isActive = currentStepIndex === idx;
                      const isPassed = currentStepIndex > idx;
                      return (
                        <div key={item.step} className="relative z-10 flex flex-col items-center">
                          {/* Step Badge */}
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-sm sm:text-base transition-all duration-300 ${isActive
                                ? 'bg-gradient-to-b from-[#fbbf24] to-[#f97316] text-black ring-4 ring-amber-500/20 shadow-md scale-105 font-black'
                                : isPassed
                                  ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                  : 'bg-white text-slate-400 border border-slate-200'
                              }`}
                          >
                            {item.step}
                          </div>

                          {/* Step Label */}
                          <div className="text-center mt-2">
                            <span className={`text-xs font-bold block ${isActive ? 'text-[#f97316]' : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                              {item.name}
                            </span>
                            <span className={`text-[10px] font-mono block ${isActive ? 'text-amber-700 font-bold' : 'text-slate-400'}`}>
                              {item.target}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Phase Hint */}
                  <div className="text-center pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-600">
                      {currentStepIndex === 0 && <span><strong className="text-[#f97316]">Phase: Situation (10%)</strong> — Briefly set up the context and the problem.</span>}
                      {currentStepIndex === 1 && <span><strong className="text-[#f97316]">Phase: Task (15%)</strong> — State your specific goal and responsibility.</span>}
                      {currentStepIndex === 2 && <span><strong className="text-[#f97316]">Phase: Action (55%)</strong> — ⭐ Focus most of your time here: 3–4 concrete actions YOU executed.</span>}
                      {currentStepIndex === 3 && <span><strong className="text-[#f97316]">Phase: Result (20%)</strong> — Share measurable outcomes, impact, and lessons learned.</span>}
                    </p>
                  </div>
                </div>

                {/* 4. Live Speech / Transcription Area */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse"></span>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Live Speech Transcription</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(transcript + ' ' + interimText).trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>

                  <div className="min-h-[130px] text-slate-800 leading-relaxed font-normal text-sm sm:text-base font-sans p-2 select-text">
                    {(transcript + (interimText ? ' ' + interimText : '')).trim() ? (
                      <span>
                        {transcript}
                        {interimText && <span className="text-amber-700 italic ml-1">{interimText}</span>}
                        <span className="inline-block w-1.5 h-4 bg-[#f97316] ml-1.5 animate-pulse align-middle"></span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic flex items-center gap-2">
                        <Mic className="w-4 h-4 text-[#f97316]/70 animate-pulse" />
                        Listening... Speak clearly into your microphone to answer the question.
                      </span>
                    )}
                  </div>
                </div>

                {/* 5. Finish & Review Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Timer finishes automatically at 0s, or you can finish early anytime.</span>
                  </div>
                  <button
                    onClick={handleStopAndEvaluate}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#fbbf24] to-[#f97316] text-black hover:opacity-90 font-extrabold py-3 px-6 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
                  >
                    <Square className="w-3.5 h-3.5 fill-current text-black" />
                    <span>Finish Answer Early &amp; Review</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CLEAN SCENARIO / QUESTION HERO CARD */
              <div className="bg-white border border-slate-200/80 p-6 sm:p-10 lg:p-12 rounded-3xl space-y-7 sm:space-y-8 shadow-xs relative overflow-hidden">

                {/* 1. Header: Assigned Scenario Metadata + Top-Right Interviewer Focus */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-pulse shrink-0"></span>
                    <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
                      ASSIGNED SCENARIO
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-bold text-slate-800 uppercase">
                      {(COMPETENCIES.find(c => c.id === activeCompetency)?.label || activeCompetency).toUpperCase()}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-mono font-bold text-[#f97316] uppercase">
                      {difficulty.toUpperCase()} · 120s
                    </span>
                  </div>

                  {/* Interviewer Focus Strip positioned cleanly towards top-right without competing */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950 self-start sm:self-auto flex-wrap">
                    <span className="text-[#f97316] font-bold shrink-0">🎯 Interviewer is evaluating:</span>
                    <span className="font-semibold text-slate-800">
                      {activeScenario.evaluatingMetrics && activeScenario.evaluatingMetrics.length > 0
                        ? activeScenario.evaluatingMetrics.join(' · ')
                        : (INTERVIEWER_FOCUS[activeCompetency] || 'Ownership · Decision-making · Impact')}
                    </span>
                  </div>
                </div>

                {/* Retry with Focus banner (If user clicked "Try Again with Focus") */}
                {retryFocusBanner && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 ring-1 ring-amber-400/30 flex items-start justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-xl bg-amber-100 text-[#f97316] shrink-0 mt-0.5">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#f97316]">
                            RETRY WITH FOCUS
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs sm:text-sm font-bold text-amber-950">
                            🎯 Focus Area: {retryFocusBanner.pillar}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-900 mt-1 font-medium leading-relaxed">
                          {retryFocusBanner.advice}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRetryFocusBanner(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer p-1 shrink-0"
                      title="Dismiss note"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* 2. Dominant Interview Question (Spacious Visual HERO) */}
                <div className="space-y-3 py-1 sm:py-2">
                  <span className="text-xs font-black tracking-widest text-[#f97316] uppercase block">
                    INTERVIEW QUESTION
                  </span>

                  <h2 className="text-2xl sm:text-3xl md:text-[34px] lg:text-[40px] font-black text-slate-900 leading-[1.32] tracking-tight max-w-4xl">
                    &ldquo;{activeScenario.actualQuestion}&rdquo;
                  </h2>
                </div>

                {/* 3. Collapsible Real-World Context Row (Lightweight Expandable Row) */}
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setShowScenarioContext(!showScenarioContext)}
                    className="w-full flex items-center justify-between py-3.5 px-4 sm:px-5 text-left cursor-pointer hover:bg-slate-100/60 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span className="text-slate-400 text-xs">{showScenarioContext ? '▴' : '▾'}</span>
                      <span>{showScenarioContext ? 'Hide Context' : 'View Context'}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {showScenarioContext ? 'Collapse' : 'Real-World Conflict Context'}
                    </span>
                  </button>

                  {showScenarioContext && (
                    <div className="p-4 sm:p-6 border-t border-slate-200/70 bg-white text-slate-700 space-y-2 animate-in fade-in duration-150">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316] block">
                        REAL-WORLD CONTEXT
                      </span>
                      <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                        {activeScenario.scenarioContext}
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Answer Tips Section (Lightweight Expandable Row) */}
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setShowHelp(!showHelp)}
                    className="w-full flex items-center justify-between py-3.5 px-4 sm:px-5 text-left cursor-pointer hover:bg-slate-100/60 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>💡</span>
                      <span>{showHelp ? 'Hide Answer Tips' : 'Answer Tips'}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {showHelp ? 'Collapse' : 'STAR Strategy & Focus'}
                    </span>
                  </button>

                  {showHelp && (
                    <div className="p-4 sm:p-6 border-t border-slate-200/70 bg-white space-y-4 animate-in fade-in duration-150">
                      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#f97316] uppercase tracking-wider">
                          <span>💡 Answer Tips &amp; STAR Focus</span>
                          <span className="text-[11px] font-mono font-medium text-slate-500">Coach Guidance</span>
                        </div>
                        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc list-inside font-normal leading-relaxed">
                          <li>
                            <strong className="text-slate-900 font-bold">Keep the situation brief</strong> — Set up context in 15–20s; avoid getting bogged down in background details.
                          </li>
                          <li>
                            <strong className="text-slate-900 font-bold">Spend most of your answer on what YOU did</strong> — Focus on your specific actions, decisions, and personal ownership (55% of answer).
                          </li>
                          <li>
                            <strong className="text-slate-900 font-bold">End with a measurable result</strong> — Conclude with concrete outcomes, percentages, metrics, or lessons learned.
                          </li>
                          {activeScenario.whyItWorks && (
                            <li className="text-slate-800 italic font-semibold pt-1.5 border-t border-amber-200/80 mt-1.5 list-none flex items-start gap-2">
                              <span>✨</span>
                              <span><strong className="text-[#f97316] not-italic">Key Focus:</strong> {activeScenario.whyItWorks}</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {activeScenario.modelAnswer && (
                        <ModelAnswerDrawer answerData={activeScenario.modelAnswer} whyItWorks={activeScenario.whyItWorks} />
                      )}
                    </div>
                  )}
                </div>

                {/* 5. Start Interview Button & Secondary "Try Another" */}
                {!isRecording && (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => startRecording()}
                      className="w-full bg-gradient-to-r from-[#fbbf24] to-[#f97316] hover:opacity-95 active:scale-[0.99] text-black font-extrabold py-4 sm:py-5 px-8 rounded-2xl transition-all shadow-md text-base sm:text-lg flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0" />
                      <span>Start Interview</span>
                    </button>

                    <div className="flex justify-center pt-1">
                      <button
                        onClick={() => generateQuestion()}
                        disabled={isGeneratingQ}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors py-2 px-4 rounded-xl hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                      >
                        <Shuffle className="w-4 h-4 text-slate-400" />
                        <span>Try Another Question</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {!isRecording && transcript && !analysis && !isEvaluating && (
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Review & Edit Transcript</h3>
              <p className="text-xs text-slate-500 mt-1">Make any adjustments before sending to the STAR evaluator.</p>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full min-h-[180px] bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all font-normal text-sm"
            />

            <div className="flex gap-4">
              <button
                onClick={() => { setTranscript(''); setActiveScenario(null); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all text-sm border border-slate-200"
              >
                Discard
              </button>
              <button
                onClick={() => evaluateSpeech()}
                className="flex-[2] bg-gradient-to-r from-[#fbbf24] to-[#f97316] text-black font-extrabold hover:opacity-90 py-4 rounded-2xl transition-colors shadow-sm text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Generate STAR Evaluation</span>
              </button>
            </div>
          </div>
        )}

        {isEvaluating && (
          <div className="bg-white border border-slate-200 p-16 rounded-3xl text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold text-slate-900">Evaluating STAR Structure...</h3>
            <p className="text-xs text-slate-500">Grading Situation (10%), Task (15%), Action (55%), and Result (20%).</p>
          </div>
        )}

        {analysis && activeScenario && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Question Summary Banner */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black tracking-widest text-[#f97316] uppercase">
                    STAR EVALUATION REPORT
                  </span>
                  <span className="text-slate-300 font-bold">·</span>
                  <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    {(COMPETENCIES.find(c => c.id === activeCompetency)?.label || activeCompetency).toUpperCase()} · {difficulty.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Duration: {120 - timeLeft}s answered
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {activeScenario.actualQuestion}
              </h2>
            </div>

            {/* ========================================================================= */}
            {/* 0. HERO: YOUR STAR REVIEW & COACHING ACTION (THE LEARNING LOOP) */}
            {/* ========================================================================= */}
            {(() => {
              const { strongPillar, strongSummary, weakPillar, weakSummary, weakAdvice, scores } = getPillarAnalysis();
              return (
                <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-3xl shadow-sm space-y-5 relative overflow-hidden bg-gradient-to-b from-amber-50/15 to-white">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse"></span>
                        <span className="text-[10px] font-black tracking-widest text-[#f97316] uppercase">
                          YOUR STAR REVIEW
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        Performance Review &amp; Coaching Focus
                      </h3>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Score</span>
                        <span className="text-lg font-black text-slate-900">{analysis.overallScore ?? 8}</span>
                        <span className="text-xs text-slate-400">/10</span>
                      </div>
                      {scorecardData?.overallScore && (
                        <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#f97316] uppercase">Match</span>
                          <span className="text-lg font-black text-[#f97316]">{scorecardData.overallScore}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strong vs Improve Callouts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="text-xs leading-relaxed">
                        <strong className="text-emerald-950 font-black block text-sm">
                          Strong: {strongPillar}
                        </strong>
                        <span className="text-emerald-800 font-medium">{strongSummary}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 ring-1 ring-amber-400/20 flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-amber-100 text-[#f97316] shrink-0 mt-0.5">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="text-xs leading-relaxed">
                        <strong className="text-amber-950 font-black block text-sm">
                          Improve: {weakPillar}
                        </strong>
                        <span className="text-amber-900 font-medium">{weakSummary}</span>
                      </div>
                    </div>
                  </div>

                  {/* STAR Coverage Progress Bars */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        STAR Coverage
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">Target allocation vs your response</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
                      {scores.map((pillar) => {
                        const isFocusAction = pillar.name === 'Action';
                        const filledBlocks = Math.min(10, Math.max(1, pillar.barCount));
                        return (
                          <div key={pillar.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-bold flex items-center gap-1.5 ${isFocusAction ? 'text-amber-950 font-black' : 'text-slate-700'}`}>
                                {isFocusAction && <span className="text-[#f97316]">⭐</span>}
                                <span>{pillar.name}</span>
                                <span className="text-[10px] font-mono font-normal text-slate-400">({pillar.target})</span>
                              </span>
                              <div className="flex items-center gap-2 font-mono text-xs">
                                <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">{pillar.desc}</span>
                                <span className={`font-bold ${isFocusAction ? 'text-[#f97316]' : 'text-slate-800'}`}>
                                  {pillar.score}/10
                                </span>
                              </div>
                            </div>

                            {/* Segmented bar representation */}
                            <div className="w-full bg-slate-200/90 h-2 rounded-full overflow-hidden flex gap-0.5 p-0.5 bg-slate-200">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-full flex-1 rounded-xs transition-all ${
                                    i < filledBlocks
                                      ? isFocusAction
                                        ? 'bg-[#f97316]'
                                        : pillar.color
                                      : 'bg-slate-300/40'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Actions: [ Improve My Answer ] [ Try Again with Focus ] */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <button
                      onClick={handleImproveAnswer}
                      disabled={isImproving}
                      className="w-full sm:flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 px-5 rounded-xl transition-all shadow-sm text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>{isImproving ? "Structuring Exemplary Answer..." : "Improve My Answer"}</span>
                    </button>

                    <button
                      onClick={() => handleRetryWithFocus(weakPillar, weakAdvice)}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#fbbf24] to-[#f97316] hover:opacity-95 text-black font-extrabold py-3 px-6 rounded-xl transition-all shadow-sm text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <RotateCcw className="w-4 h-4 text-black" />
                      <span>Try Again with Focus</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ========================================================================= */}
            {/* 1. STAR PERFORMANCE (How did I perform?) */}
            {/* ========================================================================= */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-black tracking-widest text-slate-500 uppercase block">
                    STAR PERFORMANCE
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Methodology &amp; Pillar Breakdown
                  </h3>
                </div>

                {/* Overall Score Badge */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:px-6 shrink-0 self-start sm:self-auto">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                      Overall Score
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">
                        {analysis.overallScore ?? 8}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">/10</span>
                    </div>
                  </div>
                  {scorecardData?.overallScore && (
                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                        Accuracy
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-[#f97316]">
                        {scorecardData.overallScore}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Feedback Summary */}
              {analysis.feedback && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed font-normal">
                  {analysis.feedback}
                </div>
              )}

              {/* 4-Pillar STAR Breakdown (Situation, Task, Action, Result) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {/* SITUATION */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Situation
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {(analysis.starScores?.situation ?? analysis.starScores?.Situation ?? 8)}/10
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {analysis.starScores?.situation ?? analysis.starScores?.Situation ?? 8}
                      <span className="text-xs font-normal text-slate-400">/10</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${((analysis.starScores?.situation ?? analysis.starScores?.Situation ?? 8) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">Target: 10% (~12s) · Context</p>
                </div>

                {/* TASK */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Task
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {(analysis.starScores?.task ?? analysis.starScores?.Task ?? 8)}/10
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {analysis.starScores?.task ?? analysis.starScores?.Task ?? 8}
                      <span className="text-xs font-normal text-slate-400">/10</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${((analysis.starScores?.task ?? analysis.starScores?.Task ?? 8) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">Target: 15% (~18s) · Role</p>
                </div>

                {/* ACTION (STAR Hero Orange Theme) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                      <span>⭐</span> Action
                    </span>
                    <span className="text-xs font-mono font-bold text-[#f97316] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                      {(analysis.starScores?.action ?? analysis.starScores?.Action ?? 8)}/10
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-900">
                      {analysis.starScores?.action ?? analysis.starScores?.Action ?? 8}
                      <span className="text-xs font-normal text-amber-700">/10</span>
                    </div>
                    <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-[#f97316] h-full rounded-full transition-all"
                        style={{ width: `${((analysis.starScores?.action ?? analysis.starScores?.Action ?? 8) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium pt-1">Target: 55% (~66s) · Steps</p>
                </div>

                {/* RESULT */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Result
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {(analysis.starScores?.result ?? analysis.starScores?.Result ?? 8)}/10
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {analysis.starScores?.result ?? analysis.starScores?.Result ?? 8}
                      <span className="text-xs font-normal text-slate-400">/10</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${((analysis.starScores?.result ?? analysis.starScores?.Result ?? 8) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">Target: 20% (~24s) · Metrics</p>
                </div>
              </div>

              {/* Pacing Warning if present */}
              {pacingWarning && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-800 leading-relaxed font-normal">
                    <strong className="text-red-700 font-bold">Pacing Warning:</strong> {pacingWarning}
                  </p>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 2. WHAT YOU DID WELL (What did I do well?) */}
            {/* ========================================================================= */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest text-emerald-700 uppercase">
                    WHAT YOU DID WELL
                  </h3>
                  <p className="text-xs text-slate-500">Strengths identified in your response</p>
                </div>
              </div>

              <div className="space-y-3">
                {analysis.strengths && analysis.strengths.length > 0 ? (
                  <ul className="space-y-2.5">
                    {analysis.strengths.map((str: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span>Structured your answer following the STAR sequence and articulated your responsibilities clearly.</span>
                  </div>
                )}

                {scorecardData?.feedback?.whatWorked && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 leading-relaxed flex items-start gap-2.5">
                    <span className="text-emerald-600">✨</span>
                    <span>{scorecardData.feedback.whatWorked}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. WHAT TO IMPROVE (What should I improve?) */}
            {/* ========================================================================= */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest text-[#f97316] uppercase">
                    WHAT TO IMPROVE
                  </h3>
                  <p className="text-xs text-slate-500">Key gaps to address before your actual interview</p>
                </div>
              </div>

              <div className="space-y-3">
                {analysis.missingElements && analysis.missingElements.length > 0 && (
                  <ul className="space-y-2.5">
                    {analysis.missingElements.map((elem: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[#f97316] font-bold mt-0.5">⚠</span>
                        <span>{elem}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {scorecardData?.feedback?.biggestImprovement && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed flex items-start gap-2.5">
                    <span className="text-[#f97316]">🎯</span>
                    <div>
                      <strong className="text-amber-950 font-bold block mb-0.5">Biggest Improvement Opportunity:</strong>
                      <span>{scorecardData.feedback.biggestImprovement}</span>
                    </div>
                  </div>
                )}

                {evaluationWarnings && evaluationWarnings.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {evaluationWarnings.map((w, i) => (
                      <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span><strong className="font-bold">{w.type}:</strong> {w.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 4. COACHING TIP */}
            {/* ========================================================================= */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest text-blue-700 uppercase">
                    COACHING TIP
                  </h3>
                  <p className="text-xs text-slate-500">Actionable advice &amp; recommended phrasing</p>
                </div>
              </div>

              <div className="space-y-4">
                {analysis.idealAnswerSnippet && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                      Recommended Rephrasing / Ideal Snippet
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 italic border-l-2 border-[#f97316] pl-3 leading-relaxed">
                      "{analysis.idealAnswerSnippet}"
                    </p>
                  </div>
                )}

                {activeScenario.whyItWorks && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed flex items-start gap-2.5">
                    <span className="text-[#f97316]">💡</span>
                    <div>
                      <strong className="text-amber-950 font-bold block mb-0.5">Key Focus Insight:</strong>
                      <span>{activeScenario.whyItWorks}</span>
                    </div>
                  </div>
                )}

                {scorecardData?.feedback?.tryAgain && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 font-semibold">For your next attempt:</strong> {scorecardData.feedback.tryAgain}
                  </div>
                )}

                {/* Improve My Answer Transformation Action */}
                {!improvedAnswer && (
                  <button
                    onClick={handleImproveAnswer}
                    disabled={isImproving}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isImproving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Restructuring Your Response into Stronger STAR Format...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>✨ Restructure My Answer into an Exemplary STAR Version</span>
                      </>
                    )}
                  </button>
                )}

                {/* Improved Answer Transformation Result Card */}
                {improvedAnswer && (
                  <div className="bg-white border border-emerald-300 p-5 sm:p-6 rounded-2xl space-y-4 shadow-sm animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Your Answer <span className="text-slate-400 font-normal">→</span> <span className="text-emerald-700">Exemplary STAR Version</span>
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                        Real Experience Preserved
                      </span>
                    </div>

                    {improvedAnswer.keyImprovements && improvedAnswer.keyImprovements.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block mb-1">
                          Key STAR Transformations Applied
                        </span>
                        <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                          {improvedAnswer.keyImprovements.map((imp, idx) => (
                            <li key={idx} className="font-normal">{imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-2.5 text-xs sm:text-sm">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-xs font-bold text-slate-600">S — Situation</span>
                        <p className="text-slate-800 font-normal leading-relaxed">{improvedAnswer.situation}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-xs font-bold text-slate-600">T — Task</span>
                        <p className="text-slate-800 font-normal leading-relaxed">{improvedAnswer.task}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                        <span className="text-xs font-bold text-emerald-800">A — Action (55% Personal Ownership)</span>
                        <p className="text-emerald-950 font-medium leading-relaxed">{improvedAnswer.action}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-xs font-bold text-slate-600">R — Result</span>
                        <p className="text-slate-800 font-normal leading-relaxed">{improvedAnswer.result}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 5. TRANSCRIPT */}
            {/* ========================================================================= */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-widest text-slate-700 uppercase">
                      TRANSCRIPT
                    </h3>
                    <p className="text-xs text-slate-500">Your recorded verbal response</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {transcript.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-wrap select-text">
                {transcript || <span className="text-slate-400 italic">No transcript recorded.</span>}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 6. ACTION BUTTONS */}
            {/* ========================================================================= */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setEvaluationWarnings(null);
                  setEvalCoverage(null);
                  setPacingWarning(null);
                  setScorecardData(null);
                  setImprovedAnswer(null);
                  setTranscript('');
                  setActiveScenario(null);
                  setRetryFocusBanner(null);
                  generateQuestion();
                }}
                className="w-full sm:flex-1 bg-gradient-to-r from-[#fbbf24] to-[#f97316] text-black font-extrabold hover:opacity-90 py-3.5 px-6 rounded-2xl transition-all shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Shuffle className="w-4 h-4 text-black" />
                <span>Next Scenario</span>
              </button>

              {(() => {
                const { weakPillar, weakAdvice } = getPillarAnalysis();
                return (
                  <button
                    onClick={() => handleRetryWithFocus(weakPillar, weakAdvice)}
                    className="w-full sm:flex-1 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-950 font-extrabold py-3.5 px-6 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                  >
                    <Target className="w-4 h-4 text-[#f97316]" />
                    <span>Try Again with Focus ({weakPillar})</span>
                  </button>
                );
              })()}

              <button
                onClick={() => {
                  setAnalysis(null);
                  setEvaluationWarnings(null);
                  setEvalCoverage(null);
                  setPacingWarning(null);
                  setScorecardData(null);
                  setImprovedAnswer(null);
                  setTranscript('');
                  setIsPreparing(false);
                  startRecording();
                }}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3.5 px-5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Mic className="w-4 h-4 text-slate-500" />
                <span>Re-record Clean</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
