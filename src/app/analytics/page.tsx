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
  Calendar,
  Trash2
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
  answerValidation?: string;
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
  answerValidation?: string;
}

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // Raw Module Histories
  const [jamHistory, setJamHistory] = useState<JamHistoryRecord[]>([]);
  const [starHistory, setStarHistory] = useState<StarHistoryRecord[]>([]);
  const [mockHistory, setMockHistory] = useState<MockHrHistoryRecord[]>([]);

  const handleClearRecords = () => {
    try {
      localStorage.removeItem('app_score_history');
      localStorage.removeItem('star_score_history');
      localStorage.removeItem('mock_hr_score_history');
      localStorage.removeItem('jam_master_deck_history_v2');
      localStorage.removeItem('jam_master_deck_needs_rotation');
      window.dispatchEvent(new CustomEvent('jam_score_history_cleared'));
      window.dispatchEvent(new CustomEvent('practice_history_cleared'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to clear session histories from localStorage:', e);
    }
    setJamHistory([]);
    setStarHistory([]);
    setMockHistory([]);
    setShowClearModal(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showClearModal) {
        setShowClearModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showClearModal]);

  useEffect(() => {
    setIsMounted(true);
    const syncAllHistories = () => {
      if (typeof window === 'undefined') return;
      try {
        const jamStored = localStorage.getItem('app_score_history');
        setJamHistory(jamStored ? JSON.parse(jamStored) : []);
      } catch (e) {
        setJamHistory([]);
      }

      try {
        const starStored = localStorage.getItem('star_score_history');
        setStarHistory(starStored ? JSON.parse(starStored) : []);
      } catch (e) {
        setStarHistory([]);
      }

      try {
        const mockStored = localStorage.getItem('mock_hr_score_history');
        setMockHistory(mockStored ? JSON.parse(mockStored) : []);
      } catch (e) {
        setMockHistory([]);
      }
    };

    syncAllHistories();

    window.addEventListener('storage', syncAllHistories);
    window.addEventListener('focus', syncAllHistories);
    window.addEventListener('practice_history_cleared', syncAllHistories);
    window.addEventListener('jam_score_history_cleared', syncAllHistories);

    return () => {
      window.removeEventListener('storage', syncAllHistories);
      window.removeEventListener('focus', syncAllHistories);
      window.removeEventListener('practice_history_cleared', syncAllHistories);
      window.removeEventListener('jam_score_history_cleared', syncAllHistories);
    };
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
    if (latest > prev) return { label: 'Improving', symbol: '↑', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (latest < prev) return { label: 'Needs Focus', symbol: '↓', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Stable', symbol: '→', color: 'text-slate-600 bg-slate-100 border-slate-200' };
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
      timestamp: m.timestamp || 0,
      answerValidation: m.answerValidation
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Dynamic modules used count
  const activeModulesCount = [jamCount > 0, starCount > 0, mockCount > 0].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-6 sm:p-10 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-10 relative z-10">

        {/* 1. TOP NAVBAR & PAGE TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">
              PLACEMENT PERFORMANCE
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Track your preparation journey across JAM, STAR Coach, and AI Mock Interviews.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/jam"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>JAM</span>
            </a>
            <a
              href="/behavioral"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>STAR Coach</span>
            </a>
            <a
              href="/mock-hr"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Mock Interview</span>
            </a>
            <a
              href="/"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Suite Home</span>
            </a>
          </div>
        </div>

        {/* 2. PREPARATION OVERVIEW (COMPACT 4-METRIC TOP SECTION) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Sessions Completed */}
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sessions Completed</span>
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalSessionsCompleted > 0 ? totalSessionsCompleted : '0'}
            </div>
            <p className="text-[11px] text-slate-500">
              {activeModulesCount > 0 ? `Across ${activeModulesCount} active module${activeModulesCount > 1 ? 's' : ''}` : 'No completed drills'}
            </p>
          </div>

          {/* Practice Time */}
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Practice Time</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formattedPracticeTime}
            </div>
            <p className="text-[11px] text-slate-500">
              {totalSessionsCompleted > 0 ? 'Total speech & Q&A time' : 'No recorded sessions'}
            </p>
          </div>

          {/* Average Score */}
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Average Score</span>
              <Award className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {overallAverageScore !== null ? (
                <span className="text-emerald-600 font-mono">{overallAverageScore}<span className="text-base font-normal text-slate-400">/100</span></span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {overallAverageScore !== null ? 'From evaluated drills' : 'Requires 1+ session'}
            </p>
          </div>

          {/* Current Streak */}
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Current Streak</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentStreak}
            </div>
            <p className="text-[11px] text-slate-500">
              {totalSessionsCompleted > 0 ? 'Consistent practice' : 'Start first drill today'}
            </p>
          </div>
        </div>

        {/* 4. OVERALL PERFORMANCE BANNER (ADAPTIVE - NEVER ASSUMES UNUSED MODULES ARE 0) */}
        <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-3xl shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  PREPARATION PERFORMANCE
                </span>
                {activeModulesCount > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeModulesCount} of 3 Modules Practiced
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900">
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
              <div className="flex items-center gap-4 bg-slate-50/80 border border-slate-200/80 p-3.5 px-6 rounded-2xl shrink-0">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adaptive Index</div>
                  <div className="text-3xl font-black text-emerald-600 font-mono">{overallAverageScore}</div>
                </div>
                <div className="text-right border-l border-slate-200 pl-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Evaluations</div>
                  <div className="text-sm font-bold text-slate-700">{totalEvaluatedCount} drills</div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                <span>— Insufficient session data</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
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
            <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block">
              Module Performance
            </h2>
            <span className="text-xs text-slate-400 font-mono">Actual Evaluated Data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* CARD 1: 🎙 JAM SIMULATOR (Blue Identity) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-blue-300 hover:shadow-sm transition-all shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                      <Mic className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">JAM SIMULATOR</h3>
                  </div>
                  {jamTrend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${jamTrend.color}`}>
                      {jamTrend.symbol} {jamTrend.label}
                    </span>
                  )}
                </div>

                {jamCount > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">Sessions completed</span>
                      <span className="text-sm font-bold text-slate-900">{jamCount} {jamCount === 1 ? 'Session' : 'Sessions'}</span>
                    </div>

                    <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">Average score</span>
                      <span className="text-sm font-bold font-mono text-blue-600">{jamAvg} / 100</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Latest score</span>
                      <span className="text-sm font-bold font-mono text-slate-700">{jamLatest} / 100</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-1">
                    <p className="text-sm font-medium text-slate-600">Not attempted yet</p>
                    <p className="text-xs text-slate-400">60-second spontaneous speech training</p>
                  </div>
                )}
              </div>

              <div>
                <a
                  href="/jam"
                  className="w-full bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{jamCount > 0 ? 'Practice JAM Again →' : 'Start Practice →'}</span>
                </a>
              </div>
            </div>

            {/* CARD 2: ⭐ STAR COACH (Orange Identity) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-amber-300 hover:shadow-sm transition-all shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">STAR COACH</h3>
                  </div>
                  {starTrend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${starTrend.color}`}>
                      {starTrend.symbol} {starTrend.label}
                    </span>
                  )}
                </div>

                {starCount > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">Sessions completed</span>
                      <span className="text-sm font-bold text-slate-900">{starCount} {starCount === 1 ? 'Session' : 'Sessions'}</span>
                    </div>

                    <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">Average score</span>
                      <span className="text-sm font-bold font-mono text-amber-600">{starAvg} / 100</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Latest score</span>
                      <span className="text-sm font-bold font-mono text-slate-700">{starLatest} / 100</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-1">
                    <p className="text-sm font-medium text-slate-600">Not attempted yet</p>
                    <p className="text-xs text-slate-400">Behavioral & structural interview coaching</p>
                  </div>
                )}
              </div>

              <div>
                <a
                  href="/behavioral"
                  className="w-full bg-amber-50 hover:bg-amber-100/80 text-amber-700 border border-amber-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{starCount > 0 ? 'Practice STAR Again →' : 'Start Practice →'}</span>
                </a>
              </div>
            </div>

            {/* CARD 3: 👤 AI MOCK INTERVIEW (Purple Identity) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-purple-300 hover:shadow-sm transition-all shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">AI MOCK INTERVIEW</h3>
                  </div>
                  {mockTrend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mockTrend.color}`}>
                      {mockTrend.symbol} {mockTrend.label}
                    </span>
                  )}
                </div>

                {mockCount > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">Sessions completed</span>
                      <span className="text-sm font-bold text-slate-900">{mockCount} {mockCount === 1 ? 'Session' : 'Sessions'}</span>
                    </div>

                    <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">Average score</span>
                      <span className="text-sm font-bold font-mono text-purple-600">{mockAvg} / 100</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Latest score</span>
                      <span className="text-sm font-bold font-mono text-slate-700">{mockLatest} / 100</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-1">
                    <p className="text-sm font-medium text-slate-600">Not attempted yet</p>
                    <p className="text-xs text-slate-400">2-Way conversational diagnostic interview</p>
                  </div>
                )}
              </div>

              <div>
                <a
                  href="/mock-hr"
                  className="w-full bg-purple-50 hover:bg-purple-100/80 text-purple-700 border border-purple-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{mockCount > 0 ? 'Start Mock Interview Again →' : 'Start Practice →'}</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* 5. UNIFIED RECENT SESSIONS HISTORY TABLE */}
        <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-3xl space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block">
                Practice Session History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological record of completed evaluations</p>
            </div>
            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
              <span className="text-xs text-slate-400 font-mono">
                {unifiedHistory.length} Record{unifiedHistory.length === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                disabled={unifiedHistory.length === 0}
                onClick={() => setShowClearModal(true)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  unifiedHistory.length === 0
                    ? 'text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed opacity-60'
                    : 'text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50/70 border border-rose-200 hover:border-rose-300 shadow-2xs cursor-pointer'
                }`}
                title={unifiedHistory.length === 0 ? 'No records to clear' : 'Clear all practice session records'}
              >
                <Trash2 className={`w-3.5 h-3.5 ${unifiedHistory.length === 0 ? 'text-slate-400' : 'text-rose-500'}`} />
                <span>Clear Records</span>
              </button>
            </div>
          </div>

          {unifiedHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                    <th className="py-2.5 font-semibold">Module</th>
                    <th className="py-2.5 font-semibold">Topic / Focus</th>
                    <th className="py-2.5 font-semibold">Score</th>
                    <th className="py-2.5 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {unifiedHistory.map((item) => {
                    let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (item.module === 'star') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    if (item.module === 'mock') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';

                    let scoreColor = 'text-emerald-600';
                    if (item.score < 50) scoreColor = 'text-red-600';
                    else if (item.score < 80) scoreColor = 'text-amber-600';

                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="py-3">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                            {item.moduleTitle}
                          </span>
                        </td>
                        <td className="py-3 text-slate-800 font-medium text-xs sm:text-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{item.activityName}</span>
                            {item.answerValidation && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                item.answerValidation === 'PARROT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                item.answerValidation === 'IRRELEVANT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                item.answerValidation === 'PARTIAL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {item.answerValidation}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`py-3 font-mono font-bold text-xs sm:text-sm ${scoreColor}`}>
                          {item.score}/100
                        </td>
                        <td className="py-3 text-slate-400 text-xs">
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
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto text-xl">
                📊
              </div>
              <h4 className="text-sm font-bold text-slate-900">No practice sessions yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complete a JAM, STAR, or AI Mock Interview to see your results here.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href="/jam"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
                >
                  Start JAM Drills
                </a>
                <a
                  href="/behavioral"
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Practice STAR
                </a>
              </div>
            </div>
          )}
        </div>

        {/* CONFIRMATION MODAL FOR CLEAR RECORDS */}
        {showClearModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-dialog-title"
            onClick={() => setShowClearModal(false)}
          >
            <div 
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div className="space-y-1">
                  <h3 id="clear-dialog-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                    Clear practice records?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    This will remove all completed session history and reset your analytics data.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearRecords}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl transition-all shadow-xs shadow-rose-600/20 cursor-pointer"
                >
                  Clear Records
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
