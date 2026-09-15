'use client';
import React, { useState, useEffect } from 'react';
import { getGeminiApiKey } from '@/lib/geminiKey';
import { 
  GraduationCap, 
  Cpu, 
  Brain, 
  User, 
  Sparkles, 
  BookOpen, 
  Edit3, 
  Shuffle, 
  Lock, 
  Check, 
  ArrowRight,
  HelpCircle,
  Lightbulb,
  RotateCw
} from 'lucide-react';
import {
  MasterPrompt,
  MASTER_QUESTION_BANK,
  getCurrentMasterDeckSet,
  selectSmartMasterDeckSet,
  markPromptPracticed,
  getPromptHistory,
  PromptUserHistory
} from '@/lib/masterDeckManager';

export interface ChallengeTrack {
  id: string;
  label: string;
  shortLabel: string;
  icon: any;
  description: string;
  color: string;
  accentBg: string;
  borderActive: string;
}

export const CHALLENGE_TRACKS: ChallengeTrack[] = [
  {
    id: 'Campus',
    label: 'Campus',
    shortLabel: 'Campus',
    icon: GraduationCap,
    description: 'Placement & college topics',
    color: 'text-blue-600',
    accentBg: 'bg-blue-50/70',
    borderActive: 'border-blue-500 ring-1 ring-blue-500/30'
  },
  {
    id: 'Tech',
    label: 'Tech & Innovation',
    shortLabel: 'Tech',
    icon: Cpu,
    description: 'Technology, startups & AI',
    color: 'text-indigo-600',
    accentBg: 'bg-indigo-50/70',
    borderActive: 'border-indigo-500 ring-1 ring-indigo-500/30'
  },
  {
    id: 'Logic',
    label: 'Abstract & Logic',
    shortLabel: 'Logic',
    icon: Brain,
    description: 'Think, reason & defend',
    color: 'text-emerald-600',
    accentBg: 'bg-emerald-50/70',
    borderActive: 'border-emerald-500 ring-1 ring-emerald-500/30'
  },
  {
    id: 'Personal',
    label: 'Personal & Behavioral',
    shortLabel: 'Personal',
    icon: User,
    description: 'Opinions, experiences & situations',
    color: 'text-amber-600',
    accentBg: 'bg-amber-50/70',
    borderActive: 'border-amber-500 ring-1 ring-amber-500/30'
  }
];

export const DIFFICULTY_LEVELS = [
  {
    id: 'Easy' as const,
    label: 'EASY',
    description: 'Clear question, familiar topic'
  },
  {
    id: 'Medium' as const,
    label: 'MEDIUM',
    description: 'Requires reasoning + examples'
  },
  {
    id: 'Hard' as const,
    label: 'HARD',
    description: 'Ambiguous topic + opposing viewpoints'
  }
];

// Rich curated question pool across tracks and difficulties
export const CURATED_TRACK_TOPICS: Record<string, Record<'Easy' | 'Medium' | 'Hard', string[]>> = {
  Campus: {
    Easy: [
      "The role of college clubs and societies in building career skills.",
      "Is class attendance a true measure of academic learning?",
      "The value of completing internships before final year.",
      "How to prepare effectively for campus placement drives."
    ],
    Medium: [
      "Should college students prioritize internships over academic grades?",
      "Campus placements vs. pursuing higher studies abroad.",
      "Should attendance criteria be completely abolished in universities?",
      "The importance of cross-disciplinary knowledge for fresh graduates."
    ],
    Hard: [
      "Are university degrees losing relevance in the age of self-taught skills?",
      "Standardized campus examinations vs. portfolio-based recruiting.",
      "The impact of elite college pedigree on long-term career trajectories.",
      "Economic impact of brain drain on developing tech ecosystems."
    ]
  },
  Tech: {
    Easy: [
      "Will smartphones ever replace laptops entirely for daily work?",
      "The benefits and drawbacks of social media for college students.",
      "How online education platforms transformed modern learning.",
      "The importance of cyber hygiene in everyday internet browsing."
    ],
    Medium: [
      "Is artificial intelligence more likely to create jobs than eliminate them?",
      "Should AI be allowed to make hiring and recruitment decisions?",
      "Data privacy vs. personalized digital experiences: where is the line?",
      "The future of electric vehicles in public transit infrastructure."
    ],
    Hard: [
      "Open source AI models vs. closed proprietary systems in enterprise safety.",
      "The environmental and energy cost of training giant foundation models.",
      "Autonomous vehicles and the ethical dilemma of accident liability.",
      "Cryptocurrency regulations: financial liberation or systemic risk?"
    ]
  },
  Logic: {
    Easy: [
      "Can silence sometimes be more powerful than persuasive words?",
      "Is failure a necessary prerequisite for meaningful success?",
      "Quality vs. quantity in personal and professional achievements.",
      "Why listening is more difficult than speaking in negotiations."
    ],
    Medium: [
      "Does technology make humans more connected or more isolated?",
      "Is competition or collaboration the primary driver of human innovation?",
      "Can intuition ever be more reliable than empirical data in leadership?",
      "Is patience still a virtue in an on-demand, fast-paced world?"
    ],
    Hard: [
      "Is absolute freedom of speech possible in the digital era?",
      "If ignorance is bliss, what is the true ethical obligation to seek wisdom?",
      "Does the end ever justify the means in high-stakes corporate strategy?",
      "Can a machine ever truly possess creativity, or only synthesize it?"
    ]
  },
  Personal: {
    Easy: [
      "A personal habit that significantly improved your daily focus.",
      "How you handle constructive feedback from mentors or peers.",
      "What true work-life balance means to a young professional.",
      "The single most important soft skill for career longevity."
    ],
    Medium: [
      "How to navigate working with a team member who has opposing opinions.",
      "The hardest decision you had to make independently and what it taught you.",
      "How you stay motivated and disciplined during repetitive tasks.",
      "Overcoming the fear of public speaking and stage fright."
    ],
    Hard: [
      "A situation where you had to stand alone for an unpopular ethical stance.",
      "Sacrificing short-term career comfort for long-term uncertain vision.",
      "Balancing authentic empathy with uncompromising accountability as a leader.",
      "How to rebuild professional trust after making a critical mistake."
    ]
  }
};

import {
  generateDynamicJamChallenge,
  JAM_SELECTED_TRACK_STORAGE_KEY,
  JAM_SELECTED_DIFF_STORAGE_KEY,
  addRecentJamQuestion
} from '@/lib/jamChallengeGenerator';

export const MASTER_DECK = MASTER_QUESTION_BANK.map(p => p.question);

interface JamTopicSelectorProps {
  onTopicSelect: (topic: string, details?: { track: string; difficulty: string; hint?: string }) => void;
  apiKey?: string | null;
  selectedTopic?: string;
}

export default function JamTopicSelector({ onTopicSelect, apiKey, selectedTopic }: JamTopicSelectorProps) {
  const [activeMode, setActiveMode] = useState<'ai' | 'deck' | 'custom'>('ai');
  const [selectedTrack, setSelectedTrack] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(JAM_SELECTED_TRACK_STORAGE_KEY);
      if (stored) return stored;
    }
    return 'Campus';
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(JAM_SELECTED_DIFF_STORAGE_KEY);
      if (stored === 'Easy' || stored === 'Medium' || stored === 'Hard') return stored;
    }
    return 'Medium';
  });
  const [customInput, setCustomInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Dynamic Master Deck State (persisted per session, rotated intelligently)
  const [deckPrompts, setDeckPrompts] = useState<MasterPrompt[]>(() => MASTER_QUESTION_BANK.slice(0, 10));
  const [promptHistory, setPromptHistory] = useState<Record<string, PromptUserHistory>>({});

  useEffect(() => {
    setDeckPrompts(getCurrentMasterDeckSet());
    setPromptHistory(getPromptHistory());
  }, []);

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrack(trackId);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(JAM_SELECTED_TRACK_STORAGE_KEY, trackId);
    }
  };

  const handleSelectDifficulty = (diff: 'Easy' | 'Medium' | 'Hard') => {
    setSelectedDifficulty(diff);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(JAM_SELECTED_DIFF_STORAGE_KEY, diff);
    }
  };

  const handleNewSet = () => {
    const currentIds = deckPrompts.map(p => p.id);
    const freshSet = selectSmartMasterDeckSet(currentIds);
    setDeckPrompts(freshSet);
    setPromptHistory(getPromptHistory());
  };

  const triggerSelect = (topicText: string, hint?: string) => {
    onTopicSelect(topicText, {
      track: selectedTrack,
      difficulty: selectedDifficulty,
      hint: hint || undefined
    });
  };

  const handleGenerateAiTopic = async () => {
    setIsGenerating(true);
    try {
      const result = await generateDynamicJamChallenge({
        track: selectedTrack,
        difficulty: selectedDifficulty,
        apiKey
      });
      triggerSelect(result.topic, result.hint);
    } catch (e) {
      console.error("AI challenge generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDrawMasterDeck = () => {
    const pool = deckPrompts.length > 0 ? deckPrompts : MASTER_QUESTION_BANK;
    const randomPrompt = pool[Math.floor(Math.random() * pool.length)];
    markPromptPracticed(randomPrompt.question);
    addRecentJamQuestion(randomPrompt.question);
    setPromptHistory(getPromptHistory());
    triggerSelect(
      randomPrompt.question,
      randomPrompt.hint || "Universally tested placement topic. Be bold and substantiate your viewpoint."
    );
  };

  const handleLockCustom = () => {
    if (!customInput.trim()) return;
    const clean = customInput.trim();
    addRecentJamQuestion(clean);
    triggerSelect(clean, "Custom topic provided. Deliver a structured 60-second response.");
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6 w-full overflow-hidden">
      {/* 1. Mode Selector: AI Challenge (Primary) | Master Deck | Custom Topic */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Practice Mode
          </span>
          <span className="text-[11px] sm:text-xs text-blue-600 font-semibold">
            AI Challenge Recommended
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-slate-100/90 rounded-xl sm:rounded-2xl border border-slate-200/70">
          <button
            type="button"
            onClick={() => setActiveMode('ai')}
            className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
              activeMode === 'ai'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
            }`}
          >
            <span>AI Challenge</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('deck')}
            className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
              activeMode === 'deck'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Master Deck</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('custom')}
            className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
              activeMode === 'custom'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Custom Topic</span>
          </button>
        </div>
      </div>

      {/* MODE 1: AI CHALLENGE */}
      {activeMode === 'ai' && (
        <div className="space-y-4 sm:space-y-6">
          {/* CHOOSE YOUR CHALLENGE TRACKS (4 CARDS) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Choose Your Challenge
              </label>
              <span className="text-xs font-medium text-slate-400">
                4 Placement Tracks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              {CHALLENGE_TRACKS.map((track) => {
                const IconComponent = track.icon;
                const isSelected = selectedTrack === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(track.id)}
                    className={`p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? `${track.accentBg} ${track.borderActive} shadow-xs`
                        : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-100'} ${track.color}`}>
                          <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                          {track.label}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ml-1 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-white" strokeWidth={3} />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed pl-0.5">
                      {track.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DIFFICULTY SELECTOR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Challenge Difficulty
              </label>
              <span className="text-[11px] sm:text-xs font-mono text-slate-500">
                {selectedDifficulty === 'Easy' && 'Familiar & direct'}
                {selectedDifficulty === 'Medium' && 'Reasoning + examples'}
                {selectedDifficulty === 'Hard' && 'Opposing views'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              {DIFFICULTY_LEVELS.map((diff) => {
                const isSelected = selectedDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => handleSelectDifficulty(diff.id)}
                    className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 text-blue-900 ring-1 ring-blue-500/30 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-extrabold tracking-wide mb-0.5">
                      {diff.label}
                    </span>
                    <span className="text-[9px] sm:text-[11px] text-slate-500 font-normal leading-tight">
                      {diff.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GENERATE CHALLENGE BUTTON */}
          <button
            type="button"
            onClick={handleGenerateAiTopic}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Generating {selectedTrack} Challenge...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-white/20" />
                <span>Generate Challenge</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* MODE 2: MASTER DECK */}
      {activeMode === 'deck' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Universal Placement Deck
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">10 Prompts</span>
                <button
                  type="button"
                  onClick={handleNewSet}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-all cursor-pointer border border-blue-200/70 shadow-2xs"
                  title="Rotate to a new set of 10 prompts from the Master Question Bank"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>New Set</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Carefully curated questions widely asked in tier-1 campus placement JAM rounds across India.
            </p>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {deckPrompts.map((promptItem) => {
              const isSelected = selectedTopic === promptItem.question;
              const record = promptHistory[promptItem.id];
              const isWeak = record?.bestScore !== null && record?.bestScore !== undefined && record.bestScore < 7.0;

              return (
                <button
                  key={promptItem.id}
                  type="button"
                  onClick={() => {
                    markPromptPracticed(promptItem.question);
                    addRecentJamQuestion(promptItem.question);
                    setPromptHistory(getPromptHistory());
                    triggerSelect(
                      promptItem.question,
                      promptItem.hint || "Universally tested campus prompt. Speak with conviction."
                    );
                  }}
                  className={`w-full p-2.5 sm:p-3 text-left rounded-xl border text-xs font-medium transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isWeak && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                        Revisit
                      </span>
                    )}
                    <span className="leading-snug break-words">{promptItem.question}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ml-1 ${isSelected ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                    {isSelected ? 'Active' : 'Pick'}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleDrawMasterDeck}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Draw Random Master Prompt</span>
          </button>
        </div>
      )}

      {/* MODE 3: CUSTOM TOPIC */}
      {activeMode === 'custom' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1">
              Custom Interview Topic
            </label>
            <p className="text-xs text-slate-500">
              Paste or type a specific topic given by your recruiter or college placement trainer.
            </p>
          </div>

          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. Can social media influencers drive sustainable societal change?"
            className="w-full min-h-[90px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium resize-none shadow-2xs"
          />

          <button
            type="button"
            onClick={handleLockCustom}
            disabled={!customInput.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-500/20"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Custom Topic for JAM</span>
          </button>
        </div>
      )}
    </div>
  );
}
