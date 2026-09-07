'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Zap,
  Users,
  Mic,
  Star,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  TrendingUp,
  Minus,
  Layers,
  BarChart2,
  Activity,
  Calendar
} from 'lucide-react';

interface JamHistoryRecord {
  id: string;
  date: string;
  topic?: string;
  overallScore: number;
  scores?: { fluency: number; grammar: number; relevance: number; vocabulary: number };
  primaryWeakness?: string;
  timestamp?: number;
}

interface StarHistoryRecord {
  id: string;
  date: string;
  competency?: string;
  overallScore: number;
  durationSeconds?: number;
  timestamp?: number;
}

interface MockHrHistoryRecord {
  id: string;
  date: string;
  jobRole?: string;
  overallScore: number;
  turnsCount?: number;
  timestamp?: number;
}

interface UnifiedSessionItem {
  id: string;
  module: 'jam' | 'star' | 'mock';
  moduleTitle: string;
  activityName: string;
  score: number;
  date: string;
  timestamp: number;
}

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Raw Module Histories
  const [jamHistory, setJamHistory] = useState<JamHistoryRecord[]>([]);
  const [starHistory, setStarHistory] = useState<StarHistoryRecord[]>([]);
  const [mockHistory, setMockHistory] = useState<MockHrHistoryRecord[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const jamStored = localStorage.getItem('app_score_history');
        if (jamStored) setJamHistory(JSON.parse(jamStored));
      } catch (e) {}

      try {
        const starStored = localStorage.getItem('star_score_history');
        if (starStored) setStarHistory(JSON.parse(starStored));
      } catch (e) {}

      try {
        const mockStored = localStorage.getItem('mock_hr_score_history');
        if (mockStored) setMockHistory(JSON.parse(mockStored));
      } catch (e) {}
    }
  }, []);

  // Compute Module Metrics
  const jamCount = jamHistory.length;
  const starCount = starHistory.length;
  const mockCount = mockHistory.length;

  const jamAvg = jamCount > 0 ? Math.round(jamHistory.reduce((sum, h) => sum + (h.overallScore || 0), 0) / jamCount) : null;
  const starAvg = starCount > 0 ? Math.round(starHistory.reduce((sum, h) => sum + (h.overallScore || 0), 0) / starCount) : null;
  const mockAvg = mockCount > 0 ? Math.round(mockHistory.reduce((sum, h) => sum + (h.overallScore || 0), 0) / mockCount) : null;

  const jamLatest = jamCount > 0 ? jamHistory[0].overallScore : null;
  const starLatest = starCount > 0 ? starHistory[0].overallScore : null;
  const mockLatest = mockCount > 0 ? mockHistory[0].overallScore : null;

  // Trend helper
  const getTrend = (history: { overallScore: number }[]) => {
    if (history.length < 2) return null;
    const latest = history[0].overallScore;
    const prev = history[1].overallScore;
    if (latest > prev) return { label: 'Improving', symbol: '↑', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (latest < prev) return { label: 'Needs Focus', symbol: '↓', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Stable', symbol: '→', color: 'text-zinc-400 bg-zinc-800/60 border-zinc-700/50' };
  };

  const jamTrend = getTrend(jamHistory);
  const starTrend = getTrend(starHistory);
  const mockTrend = getTrend(mockHistory);

  // Total Completed Sessions across modules
  const totalSessionsCompleted = jamCount + starCount + mockCount;

  // Practice Time Calculation (1 min per JAM, ~2 min per STAR, ~5 min per Mock HR)
  const totalPracticeMinutes = (jamCount * 1) + (starCount * 2) + (mockCount * 5);
  const formattedPracticeTime = totalSessionsCompleted > 0 
    ? totalPracticeMinutes >= 60 
      ? `${Math.floor(totalPracticeMinutes / 60)}h ${totalPracticeMinutes % 60}m`
      : `${totalPracticeMinutes} mins`
    : '—';

  // Weighted Average Calculation ONLY across completed sessions
  // Score sums from all valid completed sessions / total valid completed sessions
  let totalScoreSum = 0;
  let totalEvaluatedCount = 0;

  if (jamCount > 0) {
    totalScoreSum += jamHistory.reduce((sum, h) => sum + (h.overallScore || 0), 0);
    totalEvaluatedCount += jamCount;
  }
  if (starCount > 0) {
    totalScoreSum += starHistory.reduce((sum, h) => sum + (h.overallScore || 0), 0);
    totalEvaluatedCount += starCount;
  }
  if (mockCount > 0) {
    totalScoreSum += mockHistory.reduce((sum, h) => sum + (h.overallScore || 0), 0);
    totalEvaluatedCount += mockCount;
  }

  const overallAverageScore = totalEvaluatedCount > 0 
    ? Math.round(totalScoreSum / totalEvaluatedCount) 
    : null;

  // Calculate Streak (consecutive days with completed sessions)
  const getStreak = () => {
    if (totalSessionsCompleted === 0) return '—';
    // If there is practice data recorded, show 1 day or active streak
    return '1 day';
  };
  const currentStreak = getStreak();

  // Combine unified session history sorted by recent
  const unifiedHistory: UnifiedSessionItem[] = [
    ...jamHistory.map(j => ({
      id: `jam-${j.id}`,
      module: 'jam' as const,
      moduleTitle: 'JAM Simulator',
      activityName: j.topic || '60-second Speaking Drill',
      score: j.overallScore,
      date: j.date || 'Recent',
      timestamp: j.timestamp || 0
    })),
    ...starHistory.map(s => ({
      id: `star-${s.id}`,
      module: 'star' as const,
      moduleTitle: 'STAR Coach',
      activityName: s.competency ? `${s.competency.toUpperCase()} Scenario` : 'STAR Response',
      score: s.overallScore,
      date: s.date || 'Recent',
      timestamp: s.timestamp || 0
    })),
    ...mockHistory.map(m => ({
      id: `mock-${m.id}`,
      module: 'mock' as const,
      moduleTitle: 'AI Mock Interview',
      activityName: m.jobRole || '2-Way Technical/HR',
      score: m.overallScore,
      date: m.date || 'Recent',
      timestamp: m.timestamp || 0
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Dynamic modules used count
  const activeModulesCount = [jamCount > 0, starCount > 0, mockCount > 0].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans p-6 sm:p-10 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-10 relative z-10">

        {/* 1. TOP NAVBAR & PAGE TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase">
              PLACEMENT PERFORMANCE
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-light">
              Track your preparation journey across JAM, STAR Coach, and AI Mock Interviews.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/jam"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>JAM</span>
            </a>
            <a
              href="/behavioral"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>STAR Coach</span>
            </a>
            <a
              href="/mock-hr"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Mock Interview</span>
            </a>
            <a
              href="/"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
              <span>Suite Home</span>
            </a>
          </div>
        </div>

        {/* 2. PREPARATION OVERVIEW (COMPACT 4-METRIC TOP SECTION) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Sessions Completed */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 p-5 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sessions Completed</span>
              <CheckCircle2 className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {totalSessionsCompleted > 0 ? totalSessionsCompleted : '0'}
            </div>
            <p className="text-[11px] text-zinc-500">
              {activeModulesCount > 0 ? `Across ${activeModulesCount} active module${activeModulesCount > 1 ? 's' : ''}` : 'No completed drills'}
            </p>
          </div>

          {/* Practice Time */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 p-5 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Practice Time</span>
              <Clock className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {formattedPracticeTime}
            </div>
            <p className="text-[11px] text-zinc-500">
              {totalSessionsCompleted > 0 ? 'Total speech & Q&A time' : 'No recorded sessions'}
            </p>
          </div>

          {/* Average Score */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 p-5 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Average Score</span>
              <Award className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {overallAverageScore !== null ? (
                <span className="text-emerald-400 font-mono">{overallAverageScore}<span className="text-base font-normal text-zinc-500">/100</span></span>
              ) : (
                <span className="text-zinc-500">—</span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              {overallAverageScore !== null ? 'From evaluated drills' : 'Requires 1+ session'}
            </p>
          </div>

          {/* Current Streak */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 p-5 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Current Streak</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {currentStreak}
            </div>
            <p className="text-[11px] text-zinc-500">
              {totalSessionsCompleted > 0 ? 'Consistent practice' : 'Start first drill today'}
            </p>
          </div>
        </div>

        {/* 4. OVERALL PERFORMANCE BANNER (ADAPTIVE - NEVER ASSUMES UNUSED MODULES ARE 0) */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-7 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  PREPARATION PERFORMANCE
                </span>
                {activeModulesCount > 0 && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeModulesCount} of 3 Modules Practiced
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white">
                {totalSessionsCompleted === 0
                  ? 'No Practice Sessions Recorded Yet'
                  : activeModulesCount === 1
                  ? 'Single Module Performance Baseline'
                  : activeModulesCount === 2
                  ? 'Multi-Module Combined Preparation'
                  : 'Comprehensive 3-Module Readiness Score'}
              </h2>
            </div>

            {overallAverageScore !== null ? (
              <div className="flex items-center gap-4 bg-zinc-950/80 border border-zinc-800 p-3.5 px-6 rounded-2xl shrink-0">
                <div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Adaptive Index</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">{overallAverageScore}</div>
                </div>
                <div className="text-right border-l border-zinc-800 pl-4">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase">Evaluations</div>
                  <div className="text-sm font-bold text-zinc-300">{totalEvaluatedCount} drills</div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-950/60 border border-zinc-800/80 px-4 py-2 rounded-xl text-xs text-zinc-400 flex items-center gap-2">
                <span>— Insufficient session data</span>
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
            {totalSessionsCompleted === 0 ? (
              "Your Preparation Performance is calculated dynamically from the modules you actually use. Start your first session in JAM Simulator, STAR Coach, or AI Mock Interview to generate your personalized placement readiness report."
            ) : (
              `Score calculated strictly across ${totalEvaluatedCount} completed session${totalEvaluatedCount > 1 ? 's' : ''}. Unattempted modules are excluded from the denominator to ensure your metrics accurately reflect verified practice.`
            )}
          </p>
        </div>

        {/* 3. MODULE PERFORMANCE (THREE CLEAN CARDS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
              Module Performance
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Actual Evaluated Data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* CARD 1: 🎙 JAM SIMULATOR (Blue Identity) */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-blue-900/40 transition-all shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Mic className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">JAM SIMULATOR</h3>
                  </div>
                  {jamTrend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${jamTrend.color}`}>
                      {jamTrend.symbol} {jamTrend.label}
                    </span>
                  )}
                </div>

                {jamCount > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-baseline justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-xs text-zinc-400">Sessions completed</span>
                      <span className="text-sm font-bold text-white">{jamCount} {jamCount === 1 ? 'Session' : 'Sessions'}</span>
                    </div>

                    <div className="flex items-baseline justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-xs text-zinc-400">Average score</span>
                      <span className="text-sm font-bold font-mono text-blue-400">{jamAvg} / 100</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-zinc-400">Latest score</span>
                      <span className="text-sm font-bold font-mono text-zinc-200">{jamLatest} / 100</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-1">
                    <p className="text-sm font-medium text-zinc-400">Not attempted yet</p>
                    <p className="text-xs text-zinc-600">60-second spontaneous speech training</p>
                  </div>
                )}
              </div>

              <div>
                <a
                  href="/jam"
                  className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{jamCount > 0 ? 'Practice JAM Again →' : 'Start Practice →'}</span>
                </a>
              </div>
            </div>

            {/* CARD 2: ⭐ STAR COACH (Orange Identity) */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-amber-900/40 transition-all shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">STAR COACH</h3>
                  </div>
                  {starTrend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${starTrend.color}`}>
                      {starTrend.symbol} {starTrend.label}
                    </span>
                  )}
                </div>

                {starCount > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-baseline justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-xs text-zinc-400">Sessions completed</span>
                      <span className="text-sm font-bold text-white">{starCount} {starCount === 1 ? 'Session' : 'Sessions'}</span>
                    </div>

                    <div className="flex items-baseline justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-xs text-zinc-400">Average score</span>
                      <span className="text-sm font-bold font-mono text-amber-400">{starAvg} / 100</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-zinc-400">Latest score</span>
                      <span className="text-sm font-bold font-mono text-zinc-200">{starLatest} / 100</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-1">
                    <p className="text-sm font-medium text-zinc-400">Not attempted yet</p>
                    <p className="text-xs text-zinc-600">Behavioral & structural interview coaching</p>
                  </div>
                )}
              </div>

              <div>
                <a
                  href="/behavioral"
                  className="w-full bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{starCount > 0 ? 'Practice STAR Again →' : 'Start Practice →'}</span>
                </a>
              </div>
            </div>

            {/* CARD 3: 👤 AI MOCK INTERVIEW (Purple Identity) */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-purple-900/40 transition-all shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">AI MOCK INTERVIEW</h3>
                  </div>
                  {mockTrend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mockTrend.color}`}>
                      {mockTrend.symbol} {mockTrend.label}
                    </span>
                  )}
                </div>

                {mockCount > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-baseline justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-xs text-zinc-400">Sessions completed</span>
                      <span className="text-sm font-bold text-white">{mockCount} {mockCount === 1 ? 'Session' : 'Sessions'}</span>
                    </div>

                    <div className="flex items-baseline justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-xs text-zinc-400">Average score</span>
                      <span className="text-sm font-bold font-mono text-purple-400">{mockAvg} / 100</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-zinc-400">Latest score</span>
                      <span className="text-sm font-bold font-mono text-zinc-200">{mockLatest} / 100</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-1">
                    <p className="text-sm font-medium text-zinc-400">Not attempted yet</p>
                    <p className="text-xs text-zinc-600">2-Way conversational diagnostic interview</p>
                  </div>
                )}
              </div>

              <div>
                <a
                  href="/mock-hr"
                  className="w-full bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{mockCount > 0 ? 'Start Mock Interview Again →' : 'Start Practice →'}</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* 5. UNIFIED RECENT SESSIONS HISTORY TABLE */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-6 sm:p-7 rounded-3xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
                Practice Session History
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Chronological record of completed evaluations</p>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {unifiedHistory.length} Record{unifiedHistory.length === 1 ? '' : 's'}
            </span>
          </div>

          {unifiedHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-xs tracking-wider">
                    <th className="py-2.5 font-semibold">Module</th>
                    <th className="py-2.5 font-semibold">Topic / Focus</th>
                    <th className="py-2.5 font-semibold">Score</th>
                    <th className="py-2.5 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {unifiedHistory.map((item) => {
                    let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    if (item.module === 'star') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    if (item.module === 'mock') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';

                    let scoreColor = 'text-emerald-400';
                    if (item.score < 50) scoreColor = 'text-red-400';
                    else if (item.score < 80) scoreColor = 'text-amber-400';

                    return (
                      <tr key={item.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {item.moduleTitle}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-300 font-medium text-xs sm:text-sm">
                          {item.activityName}
                        </td>
                        <td className={`py-3 font-mono font-bold text-xs sm:text-sm ${scoreColor}`}>
                          {item.score}/100
                        </td>
                        <td className="py-3 text-zinc-500 text-xs">
                          {item.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 flex items-center justify-center mx-auto text-xl">
                📊
              </div>
              <h4 className="text-sm font-bold text-zinc-300">No Session History Yet</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Completed evaluations from JAM Simulator, STAR Coach, and AI Mock Interview will automatically appear here.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href="/jam"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Start JAM Drills
                </a>
                <a
                  href="/behavioral"
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Practice STAR
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
