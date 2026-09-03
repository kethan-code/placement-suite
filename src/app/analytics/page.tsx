'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ArrowRight, 
  Shield, 
  Users, 
  Timer, 
  TrendingUp, 
  Zap, 
  Target, 
  ArrowLeft,
  Sparkles,
  BarChart3,
  Award
} from 'lucide-react';

export interface CompetencyScore {
  id: string;
  name: string;
  category: 'competency' | 'starPhase';
  score: number;
  description: string;
  icon: any;
}

export interface SessionHistoryItem {
  id: string;
  competency: string;
  score: number;
  date: string;
}

export interface ProgressDeltaItem {
  competency: string;
  previousScore: number;
  currentScore: number;
}

const INITIAL_SCORES: CompetencyScore[] = [
  {
    id: 'leadership',
    name: 'Leadership & Ownership',
    category: 'competency',
    score: 85,
    description: 'Strong ability to step up, delegate, and maintain team accountability.',
    icon: Shield
  },
  {
    id: 'learning',
    name: 'Rapid Learning',
    category: 'competency',
    score: 88,
    description: 'Excellent speed in adopting new frameworks under severe time bounds.',
    icon: Zap
  },
  {
    id: 'action',
    name: 'Action Phase (55% Focus)',
    category: 'starPhase',
    score: 90,
    description: 'Consistently spends >50% of response detailing specific personal steps.',
    icon: Target
  },
  {
    id: 'crisis',
    name: 'Crisis & Deadlines',
    category: 'competency',
    score: 78,
    description: 'Good triage calm under extreme pressure and unexpected crashes.',
    icon: Timer
  },
  {
    id: 'situation',
    name: 'Situation Context',
    category: 'starPhase',
    score: 72,
    description: 'Adequate scene setting without over-explaining background context.',
    icon: BarChart3
  },
  {
    id: 'task',
    name: 'Task Clarification',
    category: 'starPhase',
    score: 68,
    description: 'Solid definition of explicit responsibilities and obstacles.',
    icon: BarChart3
  },
  {
    id: 'conflict',
    name: 'Conflict Resolution',
    category: 'competency',
    score: 60,
    description: 'Pivots well in disagreements, but needs data-backed persuasion.',
    icon: Users
  },
  {
    id: 'failure',
    name: 'Failure & Resilience',
    category: 'competency',
    score: 42,
    description: 'Needs clearer post-mortem analysis and concrete lessons retained.',
    icon: TrendingUp
  },
  {
    id: 'result',
    name: 'Quantifying Results',
    category: 'starPhase',
    score: 40,
    description: 'Struggles to provide explicit metrics, percentages, or final outcomes.',
    icon: Award
  }
];

const MOCK_SESSION_HISTORY: SessionHistoryItem[] = [
  { id: '1', competency: 'Leadership & Ownership', score: 85, date: 'Today' },
  { id: '2', competency: 'Rapid Learning', score: 88, date: 'Yesterday' },
  { id: '3', competency: 'Crisis & Deadlines', score: 78, date: '2 days ago' },
  { id: '4', competency: 'Conflict Resolution', score: 60, date: '3 days ago' },
  { id: '5', competency: 'Failure & Resilience', score: 42, date: '4 days ago' }
];

const MOCK_PROGRESS_DELTAS: ProgressDeltaItem[] = [
  { competency: 'Conflict Resolution', previousScore: 60, currentScore: 84 },
  { competency: 'Leadership & Ownership', previousScore: 72, currentScore: 85 },
  { competency: 'Crisis & Deadlines', previousScore: 65, currentScore: 78 },
  { competency: 'Failure & Resilience', previousScore: 30, currentScore: 42 }
];

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [scores] = useState<CompetencyScore[]>(INITIAL_SCORES);
  const [sessionHistory] = useState<SessionHistoryItem[]>(MOCK_SESSION_HISTORY);
  const [progressDeltas] = useState<ProgressDeltaItem[]>(MOCK_PROGRESS_DELTAS);

  // Classify scores into traffic-light buckets
  const strongest = scores.filter((s) => s.score >= 80);
  const developing = scores.filter((s) => s.score >= 50 && s.score < 80);
  const needsPractice = scores.filter((s) => s.score < 50);

  // Weakness Recommendation Engine
  const getRecommendation = () => {
    // Find lowest scoring competency
    const competencyScores = scores.filter((s) => s.category === 'competency');
    const lowestCompetency = [...competencyScores].sort((a, b) => a.score - b.score)[0] || competencyScores[0];
    
    // Find lowest scoring STAR phase
    const phaseScores = scores.filter((s) => s.category === 'starPhase');
    const lowestPhase = [...phaseScores].sort((a, b) => a.score - b.score)[0];

    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Hard';
    if (lowestCompetency.score < 50) {
      difficulty = 'Hard';
    } else if (lowestCompetency.score < 70) {
      difficulty = 'Medium';
    } else {
      difficulty = 'Easy';
    }

    return {
      competencyId: lowestCompetency.id,
      competencyName: lowestCompetency.name,
      difficulty,
      score: lowestCompetency.score,
      lowestPhaseName: lowestPhase?.name || 'Quantifying Results',
      rationale: `Your historical evaluations show a drop in "${lowestCompetency.name}" (${lowestCompetency.score}/100) and "${lowestPhase?.name}". Practicing a high-stakes ${difficulty} scenario will strengthen your response structure.`
    };
  };

  const recommendation = getRecommendation();

  const handleLaunchSession = () => {
    router.push(`/behavioral?competency=${recommendation.competencyId}&difficulty=${recommendation.difficulty}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans p-6 sm:p-10 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Interview Performance Analytics</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Personalized breakdown of behavioral competency scores and STAR structural mastery.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/behavioral"
              className="bg-white text-black font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>STAR Coach</span>
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

        {/* Next Practice Recommendation Card */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Recommended Next Session
              </span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
              <span>Target: {recommendation.competencyName} — {recommendation.difficulty}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              Focus Area: {recommendation.competencyName} ({recommendation.difficulty} Difficulty)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light max-w-3xl">
              {recommendation.rationale}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-xs text-zinc-500 font-mono">
              Suggested Focus: Spend 55% of your time on detailed Actions & clear metric Results.
            </div>
            <button
              onClick={handleLaunchSession}
              className="bg-white text-black font-extrabold px-6 py-3.5 rounded-2xl hover:bg-zinc-200 transition-colors shadow-lg text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <span>Launch Target Session</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {/* Traffic-Light Interview Profile Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
              Interview Competency Profile
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Traffic-Light Breakdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strongest Column (🟢 Green) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Strongest (Score &gt; 80)
                </h3>
                <span className="text-xs text-zinc-500 font-mono ml-auto">({strongest.length})</span>
              </div>

              <div className="space-y-2.5">
                {strongest.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-md p-3 flex items-start gap-3 hover:border-zinc-700 transition-colors"
                    >
                      <CheckCircle2 className="text-emerald-500 w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-zinc-400" />
                            {item.name}
                          </span>
                          <span className="text-xs font-mono font-extrabold text-emerald-400">{item.score}%</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Developing Column (🟡 Yellow) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Developing (50–79)
                </h3>
                <span className="text-xs text-zinc-500 font-mono ml-auto">({developing.length})</span>
              </div>

              <div className="space-y-2.5">
                {developing.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-md p-3 flex items-start gap-3 hover:border-zinc-700 transition-colors"
                    >
                      <AlertCircle className="text-amber-500 w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-zinc-400" />
                            {item.name}
                          </span>
                          <span className="text-xs font-mono font-extrabold text-amber-400">{item.score}%</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Needs Practice Column (🔴 Red) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Needs Practice (&lt; 50)
                </h3>
                <span className="text-xs text-zinc-500 font-mono ml-auto">({needsPractice.length})</span>
              </div>

              <div className="space-y-2.5">
                {needsPractice.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="bg-zinc-900/50 border border-red-950/50 border-zinc-800 rounded-md p-3 flex items-start gap-3 hover:border-red-900/50 transition-colors"
                    >
                      <XCircle className="text-red-500 w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-zinc-400" />
                            {item.name}
                          </span>
                          <span className="text-xs font-mono font-extrabold text-red-400">{item.score}%</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Practice History Table & Progress Delta Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your Practice History Table */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
                  Your Practice History
                </h3>
                <span className="text-xs text-zinc-500 font-mono">Recent Sessions</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-xs tracking-wider">
                      <th className="py-2.5 font-semibold">Competency</th>
                      <th className="py-2.5 font-semibold">Score</th>
                      <th className="py-2.5 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionHistory.map((session) => {
                      let scoreColor = 'text-emerald-400';
                      if (session.score < 50) scoreColor = 'text-red-400';
                      else if (session.score < 80) scoreColor = 'text-amber-400';

                      return (
                        <tr key={session.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 text-zinc-300 font-medium text-xs sm:text-sm">{session.competency}</td>
                          <td className={`py-3 font-mono font-bold text-xs sm:text-sm ${scoreColor}`}>{session.score}</td>
                          <td className="py-3 text-zinc-500 text-xs">{session.date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Your Progress Delta Tracker */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
                  Your Progress
                </h3>
                <span className="text-xs text-zinc-500 font-mono">Score Delta</span>
              </div>

              <div className="space-y-3">
                {progressDeltas.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                  >
                    <span className="text-zinc-300 font-medium text-xs">{item.competency}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-zinc-500 text-xs">{item.previousScore}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-600" />
                      <span className="text-emerald-400 font-bold text-xs">{item.currentScore}</span>
                      <TrendingUp className="w-4 h-4 text-emerald-500 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Competency Scores Progress Grid */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Comprehensive Scoring Rubric Breakdown
            </h3>
            <span className="text-xs text-zinc-500 font-mono">Weighted Scale</span>
          </div>

          <div className="space-y-4">
            {scores.map((item) => {
              let barColor = 'bg-emerald-500';
              if (item.score < 50) barColor = 'bg-red-500';
              else if (item.score < 80) barColor = 'bg-amber-500';

              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200">{item.name}</span>
                    <span className="font-mono font-extrabold text-zinc-400">{item.score}/100</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                    <div className={`${barColor} h-full rounded-full transition-all duration-500`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
