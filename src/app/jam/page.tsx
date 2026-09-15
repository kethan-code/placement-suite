'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ApiOnboarding from '@/components/ApiOnboarding';
import JamTopicSelector from '@/components/JamTopicSelector';
import { getScoreTheme } from '@/lib/scoreTheme';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import { getGeminiApiKey, setGeminiApiKey, removeGeminiApiKey } from '@/lib/geminiKey';
import { recordMasterDeckScore } from '@/lib/masterDeckManager';
import { 
  Mic, 
  Square, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  ArrowRight, 
  Shuffle, 
  BarChart3, 
  CheckCircle2, 
  Award, 
  Flame, 
  TrendingUp, 
  Info, 
  Users, 
  Star, 
  Volume2, 
  Layers, 
  Send,
  RefreshCw,
  Lightbulb,
  Radio,
  FileText,
  Check,
  ChevronRight,
  Zap
} from 'lucide-react';

interface ScoreRecord {
  id: string;
  date: string;
  topic: string;
  overallScore: number;
  scores: { fluency: number; grammar: number; relevance: number; vocabulary: number };
  primaryWeakness: string;
  category?: string;
  difficulty?: string;
  durationSeconds?: number;
}

interface AnalysisResult {
  overallScore: number;
  scores: { fluency: number; grammar: number; relevance: number; vocabulary: number };
  feedback: string;
  primaryWeakness: string;
  fillerWordsDetected: string[];
  strengths: string[];
  areasForImprovement: string[];
  improvedSampleSnippet: string;
}

const TODAYS_JAM_POOL = [
  {
    topic: "Should college students prioritize internships over academic grades?",
    category: "Campus & Placement",
    difficulty: "Medium",
    time: "60 sec"
  },
  {
    topic: "Should AI be allowed to make hiring and placement decisions?",
    category: "Tech & Innovation",
    difficulty: "Medium",
    time: "60 sec"
  },
  {
    topic: "Is competition or collaboration the true driver of modern innovation?",
    category: "Abstract & Logic",
    difficulty: "Hard",
    time: "60 sec"
  },
  {
    topic: "Can authentic leadership be taught, or is it an innate personality trait?",
    category: "Personal & Behavioral",
    difficulty: "Medium",
    time: "60 sec"
  }
];

export default function JamSimulatorPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'practice' | 'analytics'>('practice');
  const [topic, setTopic] = useState('');
  const [topicDetails, setTopicDetails] = useState<{ track: string; difficulty: string; hint?: string } | null>(null);
  const [todayIndex, setTodayIndex] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<ScoreRecord[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    const key = getGeminiApiKey();
    if (key) setApiKey(key);

    const storedHistory = localStorage.getItem('app_score_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const syncKey = () => {
      setApiKey(getGeminiApiKey());
    };
    window.addEventListener('gemini_api_key_updated', syncKey);

    return () => {
      window.removeEventListener('gemini_api_key_updated', syncKey);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleKeySetup = (provider: 'gemini', key: string) => {
    setGeminiApiKey(key);
    setApiKey(key);
  };

  const handleDisconnectKey = () => {
    if (confirm("Disconnect your Gemini API key?")) {
      removeGeminiApiKey();
      setApiKey(null);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRecording && timeLeft === 0) {
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyserNode);
      analyserRef.current = analyserNode;
      setAnalyser(analyserNode);

      const buffer = new Uint8Array(analyserNode.frequencyBinCount);
      const updateVolume = () => {
        analyserNode.getByteFrequencyData(buffer);
        const avg = buffer.reduce((a, b) => a + b, 0) / buffer.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.warn("Microphone visualizer unavailable:", e);
    }
  };

  const stopAudio = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    setAudioLevel(0);
    analyserRef.current = null;
    setAnalyser(null);
  };

  const startRecording = async (overrideTopic?: string) => {
    const activeTopic = typeof overrideTopic === 'string' ? overrideTopic : topic;
    if (!activeTopic) return alert("Please select or generate a challenge topic first.");
    if (typeof overrideTopic === 'string') {
      setTopic(overrideTopic);
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
    }

    setTranscript('');
    setInterimText('');
    setTimeLeft(60);
    setIsRecording(true);
    isRecordingRef.current = true;
    setAnalysis(null);
    setIsReviewing(false);

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

    recognition.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
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
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
    await startAudio();
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    stopAudio();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setTranscript((prev) => (prev + (interimText ? ' ' + interimText : '')).trim());
    setInterimText('');
    setIsReviewing(true);
  };

  const submitForEvaluation = async () => {
    if (!transcript.trim()) {
      alert("No transcript found. Please record again or type your response.");
      setIsReviewing(false);
      return;
    }
    setIsEvaluating(true);
    setIsReviewing(false);

    try {
      const res = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, topic, durationSeconds: 60 - timeLeft, apiKey })
      });

      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        const durationTaken = 60 - timeLeft > 0 ? (60 - timeLeft) : 60;
        const newRecord: ScoreRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          topic,
          overallScore: data.analysis.overallScore,
          scores: data.analysis.scores,
          primaryWeakness: data.analysis.primaryWeakness || 'Fluency',
          category: (topicDetails?.track || 'CAMPUS').toUpperCase(),
          difficulty: topicDetails?.difficulty || 'Medium',
          durationSeconds: durationTaken
        };
        const updatedHistory = [newRecord, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('app_score_history', JSON.stringify(updatedHistory));
        recordMasterDeckScore(topic, data.analysis.overallScore);
      } else {
        const isAuthError = res.status === 401 || (data.error && data.error.toLowerCase().includes('api key'));
        if (isAuthError) {
          alert("Gemini API key is invalid or expired. Please update your API key.");
          removeGeminiApiKey();
          setApiKey(null);
        } else {
          alert("Evaluation failed: " + (data.error || 'Please check your connection and try again.'));
        }
        setIsReviewing(true);
      }
    } catch (e) {
      alert("Network error connecting to evaluation service.");
      setIsReviewing(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetryLastJam = (item: ScoreRecord) => {
    setTopic(item.topic);
    setTopicDetails({
      track: item.category || 'Campus',
      difficulty: item.difficulty || 'Medium',
      hint: "Practice this topic again to beat your previous score. Structure your argument clearly."
    });
    setTimeLeft(60);
    setTranscript('');
    setInterimText('');
    setAnalysis(null);
    setIsReviewing(false);
    setIsEvaluating(false);
    startRecording(item.topic);
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  // Circular timer calculations (r=50 -> C = 314.16)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / 60);

  // Performance snapshots calculations
  const totalCompleted = history.length > 0 ? history.length : 0;
  const avgScore = history.length > 0
    ? (history.reduce((sum, h) => sum + h.overallScore, 0) / history.length).toFixed(1)
    : '0.0';
  const bestScore = history.length > 0
    ? Math.max(...history.map((h) => h.overallScore)).toFixed(1)
    : '0.0';

  // Real latest completed JAM session info (null if no previous attempt recorded)
  const lastJam = history.length > 0 ? history[0] : null;

  const currentTodayChallenge = TODAYS_JAM_POOL[todayIndex];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-8 relative overflow-hidden flex flex-col justify-between">
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

      {/* TOP NAVBAR (Matching STAR Coach and Placement Suite) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group focus:outline-none">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-sm mr-2.5 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Placement Suite</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button 
              onClick={() => setActiveTab('practice')} 
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'practice' 
                  ? 'bg-blue-50/80 text-blue-700 border border-blue-200/80 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              JAM Simulator
            </button>
            <Link 
              href="/behavioral" 
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
            >
              STAR Coach
            </Link>
            <Link 
              href="/mock-hr" 
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
            >
              AI Mock Interview
            </Link>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'analytics' 
                  ? 'bg-blue-50/80 text-blue-700 border border-blue-200/80 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              Analytics
            </button>

            {/* API Status Badge */}
            {apiKey ? (
              <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs shadow-2xs ml-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-700 font-medium">API Connected</span>
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="text-blue-600 hover:text-blue-800 font-semibold ml-0.5 cursor-pointer underline"
                  title="Update API key"
                >
                  Edit
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSetupModal(true)}
                className="hidden lg:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer ml-1"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Connect API Key</span>
              </button>
            )}

            <Link
              href="/"
              className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-slate-900 font-semibold text-xs px-3 py-2 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Suite Home</span>
            </Link>

            {apiKey && (
              <button 
                onClick={handleDisconnectKey} 
                title="Disconnect Key" 
                className="text-xs font-semibold text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50/60 rounded-xl px-2.5 py-2 transition-all cursor-pointer"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 relative z-10 flex-1 space-y-8 sm:space-y-10 lg:space-y-12">
        {activeTab === 'practice' && (
          <div className="space-y-8 sm:space-y-10 lg:space-y-12 animate-fade-in">
            {/* MAIN VIEWPORT FLOW */}
            {!isRecording && !isReviewing && !isEvaluating && !analysis && (
              <div className="space-y-8 sm:space-y-10 lg:space-y-12">
                {/* 1. HERO / JAM INTRO */}
                <div className="border-b border-slate-200/80 pb-6 sm:pb-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 shadow-2xs">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        <span>JAM ARENA • 60-SECOND SIMULATOR</span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        READY. SET. JAM.
                      </h1>
                      <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium max-w-2xl">
                        Practice thinking on your feet with realistic campus placement challenges.
                      </p>
                    </div>

                    {/* MINI HOW JAM WORKS STRIP */}
                    <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-3 sm:gap-4 shrink-0 shadow-2xs">
                      <div className="text-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 block">① Pick</span>
                        <span className="text-xs font-semibold text-slate-800">Challenge</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <div className="text-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block">② JAM</span>
                        <span className="text-xs font-semibold text-slate-800">60s Clock</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <div className="text-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 block">③ Improve</span>
                        <span className="text-xs font-semibold text-slate-800">Feedback</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. TODAY'S JAM - WIDE LIGHTWEIGHT CHALLENGE BANNER */}
                <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border border-blue-200/80 rounded-3xl p-5 sm:p-7 shadow-xs hover:border-blue-300 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-blue-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                          <Flame className="w-3.5 h-3.5 fill-white" />
                          TODAY&apos;S JAM
                        </span>
                        <span className="text-xs font-bold text-blue-900 bg-blue-100/70 border border-blue-200/60 px-2.5 py-0.5 rounded-full uppercase">
                          {currentTodayChallenge.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {currentTodayChallenge.difficulty} DIFFICULTY
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-mono text-blue-700 font-bold">
                          {currentTodayChallenge.time}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-snug">
                        &ldquo;{currentTodayChallenge.topic}&rdquo;
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        Take a clear stance in the first 10 seconds. Support your viewpoint with practical real-world points.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setTopic(currentTodayChallenge.topic);
                          setTopicDetails({
                            track: currentTodayChallenge.category,
                            difficulty: currentTodayChallenge.difficulty,
                            hint: "Take a clear stance in the first 10 seconds. Substantiate with 2 practical arguments."
                          });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm py-3 px-5 rounded-2xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Start This Challenge</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTodayIndex((prev) => (prev + 1) % TODAYS_JAM_POOL.length)}
                        title="Shuffle next daily topic"
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-all shadow-2xs cursor-pointer"
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ACTIVE SPOTLIGHT: ⚡ YOUR ACTIVE JAM (When a topic has been selected) */}
                {topic && (
                  <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                    
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold bg-blue-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                            ⚡ ACTIVE JAM TOPIC
                          </span>
                          <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">
                            {topicDetails?.track || 'CAMPUS'}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs font-mono text-slate-300">
                            {topicDetails?.difficulty || 'MEDIUM'} DIFFICULTY
                          </span>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          60 SECONDS
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg lg:text-xl font-black text-white leading-snug">
                        &ldquo;{topic}&rdquo;
                      </h3>

                      {topicDetails?.hint && (
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5">
                          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Structure Tip:</strong> {topicDetails.hint}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => startRecording()}
                          className="bg-blue-500 hover:bg-blue-400 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Start JAM Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTopic('');
                            setTopicDetails(null);
                          }}
                          className="bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm py-2.5 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-white/10"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pick Another</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PRACTICE AREA: CONTROLS | TIMER */}
                {/* On desktop: 7 cols practice controls | 5 cols timer */}
                {/* On mobile: naturally stacked */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                  {/* LEFT 7 COLS: JamTopicSelector */}
                  <div className="lg:col-span-7">
                    <JamTopicSelector 
                      onTopicSelect={(t, details) => {
                        setTopic(t);
                        setTopicDetails(details || null);
                      }} 
                      apiKey={apiKey} 
                      selectedTopic={topic} 
                    />
                  </div>

                  {/* RIGHT 5 COLS: Prominent Timer Card */}
                  <div className="lg:col-span-5 lg:sticky lg:top-24">
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between text-center space-y-6 shadow-xs">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                          JAM ARENA CLOCK
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          JAM TIMER
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                          You&apos;ll have 60 seconds to organize your thoughts and speak with conviction.
                        </p>
                      </div>

                      {/* Circular Progress Ring */}
                      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            strokeWidth="5"
                            className="stroke-slate-100"
                            fill="none"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            strokeWidth="5"
                            className="stroke-blue-600 transition-all duration-1000 ease-linear"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                          />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-mono font-black text-slate-900 tracking-tight">
                            01:00
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">
                            60 SECONDS
                          </span>
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                            <Mic className="w-3 h-3" />
                            <span>{topic ? 'Ready to Start' : 'Select Challenge'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Start Action */}
                      <div className="w-full space-y-2">
                        <button 
                          onClick={() => startRecording()} 
                          disabled={!topic} 
                          className={`w-full font-extrabold py-3.5 sm:py-4 px-6 rounded-2xl transition-all text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer ${
                            topic 
                              ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-sm shadow-blue-500/25' 
                              : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Start JAM Session</span>
                        </button>
                        <p className="text-xs text-slate-500 font-medium">
                          {topic ? 'Ready! Click Start to begin 60-second speech.' : 'Pick a challenge above to unlock the timer.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. PERFORMANCE SNAPSHOT & RECENT ATTEMPTS */}
                {/* Clean whitespace separation: Clear distinction between "Practice now" vs "My previous progress" */}
                <div className="pt-4 sm:pt-6 border-t border-slate-200/80 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">
                        ACTIVITY &amp; STATS
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        My Previous Progress
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Full Analytics</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT 7 COLS: YOUR JAM PROGRESS */}
                    <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                          Placement Readiness Snapshot
                        </h4>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">
                          Evaluated based on your recorded speech fluency and analytical structure.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center border-b border-slate-100 pb-4">
                        <div className="p-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">JAMs Completed</span>
                          <span className="text-3xl font-black text-slate-900 mt-1 block">{totalCompleted}</span>
                        </div>
                        <div className="p-2 border-x border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Avg. Score</span>
                          <span className="text-3xl font-black text-blue-600 mt-1 block">{avgScore}</span>
                        </div>
                        <div className="p-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Best Score</span>
                          <span className="text-3xl font-black text-emerald-600 mt-1 block">{bestScore}</span>
                        </div>
                      </div>

                      {/* SKILL PROGRESS BARS */}
                      <div className="space-y-3 pt-1">
                        {[
                          { label: 'Speaking & Fluency', pct: 82, color: 'bg-blue-600' },
                          { label: 'Argument Structure', pct: 74, color: 'bg-indigo-600' },
                          { label: 'Clarity & Vocabulary', pct: 87, color: 'bg-emerald-600' },
                          { label: 'Confidence & Delivery', pct: 80, color: 'bg-amber-500' }
                        ].map((skill, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span>{skill.label}</span>
                              <span className="font-mono text-slate-900 text-[11px]">{skill.pct}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${skill.color} transition-all duration-500`}
                                style={{ width: `${skill.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT 5 COLS: LATEST JAM */}
                    <div className="lg:col-span-5">
                      {lastJam ? (
                        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              <span>Latest JAM Session</span>
                            </span>
                            <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {lastJam.category || 'CAMPUS'}
                            </span>
                          </div>

                          {/* Score Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-500 font-semibold">Overall Evaluation</span>
                            <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/70 px-2.5 py-1 rounded-full">
                              Score: {(() => {
                                const raw = lastJam.overallScore > 5 ? lastJam.overallScore / 2 : lastJam.overallScore;
                                return raw % 1 === 0 ? raw.toFixed(0) : raw.toFixed(1);
                              })()}/5
                            </span>
                          </div>

                          {/* Previous JAM Question */}
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            &ldquo;{lastJam.topic}&rdquo;
                          </h4>

                          {/* Metadata Row: 60 sec · Medium · Date */}
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{lastJam.durationSeconds || 60} sec</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{lastJam.difficulty || 'Medium'}</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{lastJam.date}</span>
                          </div>

                          {/* Secondary Retry Action Button */}
                          <div className="pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleRetryLastJam(lastJam)}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer group"
                            >
                              <span>Retry This Topic</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>Latest JAM Session</span>
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                            No previous JAM attempts recorded yet. Pick a challenge and start speaking to track your latest performance!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LIVE RECORDING STATE: ARENA ON THE CLOCK */}
            {isRecording && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in duration-200">
                {/* Live Top Status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-5 gap-4 flex-wrap">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></span>
                    <div>
                      <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest block">
                        YOU&apos;RE LIVE • ON THE CLOCK
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Focus on your argument. Don&apos;t worry about being perfect.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <VoiceVisualizer
                      analyser={analyser}
                      isListening={isRecording}
                      color="#2563eb"
                      theme="blue"
                      barCount={20}
                      width={100}
                      height={24}
                    />
                    <div className="bg-slate-900 text-white font-mono font-black text-2xl px-4 py-1.5 rounded-xl shrink-0">
                      00:{String(timeLeft).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Pinned Prompt in Spotlight */}
                <div className="text-center py-4 px-4 bg-blue-50/40 border border-blue-100/80 rounded-2xl">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
                    Active Challenge Prompt
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 leading-snug">
                    &ldquo;{topic}&rdquo;
                  </h2>
                </div>

                {/* Speech Capture Stream */}
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Live Speech Transcription
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {(transcript + ' ' + interimText).trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <p className="text-slate-800 min-h-[140px] text-base sm:text-lg leading-relaxed font-normal">
                    {(transcript + (interimText ? ' ' + interimText : '')).trim() || (
                      <span className="text-slate-400 italic flex items-center gap-2">
                        <Mic className="w-4 h-4 text-blue-500 animate-pulse" />
                        Listening to your microphone... Speak clearly and articulate your points.
                      </span>
                    )}
                  </p>
                </div>

                {/* End JAM Button */}
                <button 
                  onClick={stopRecording} 
                  className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-md shadow-rose-600/20 text-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Finish Speech / End JAM</span>
                </button>
              </div>
            )}

            {/* REVIEW TRANSCRIPT STATE */}
            {isReviewing && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
                      JAM COMPLETE
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                      Review Transcript
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Correct any speech recognition typos before Gemini scores your response.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      {transcript.trim().split(/\s+/).filter(Boolean).length} Words Recorded
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Prompt Addressed
                  </span>
                  <p className="text-sm font-bold text-slate-800">&ldquo;{topic}&rdquo;</p>
                </div>

                <textarea 
                  value={transcript} 
                  onChange={(e) => setTranscript(e.target.value)} 
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-base text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium resize-y" 
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={() => { setIsReviewing(false); setTopic(''); setTopicDetails(null); }} 
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all border border-slate-200/80 cursor-pointer text-sm"
                  >
                    Discard &amp; Back
                  </button>
                  <button 
                    onClick={submitForEvaluation} 
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold py-4 rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 text-base"
                  >
                    <Sparkles className="w-5 h-5 fill-white/20" />
                    <span>Generate AI Diagnostic Report</span>
                  </button>
                </div>
              </div>
            )}

            {/* EVALUATING STATE */}
            {isEvaluating && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-16 sm:p-24 text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">Gemini is Scoring Your JAM...</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Evaluating fluency pace, grammatical clarity, keyword alignment, and argument delivery.
                  </p>
                </div>
              </div>
            )}

            {/* ANALYSIS RESULT REPORT */}
            {analysis && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Score Summary Hero */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
                      AI DIAGNOSTIC REPORT
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      &ldquo;{topic}&rdquo;
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-2xl font-normal">
                      {analysis.feedback}
                    </p>
                  </div>
                  <div className="text-center bg-blue-50/60 border border-blue-200/80 rounded-2xl p-6 min-w-[150px] shrink-0 shadow-2xs self-stretch sm:self-auto flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900 font-mono">
                      {analysis.overallScore}
                      <span className="text-lg text-slate-400 font-sans font-normal">/10</span>
                    </span>
                    <span className="text-xs font-bold text-blue-700 uppercase mt-2 tracking-wider">
                      Overall Score
                    </span>
                  </div>
                </div>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: 'fluency', label: 'Fluency', score: analysis.scores.fluency, desc: 'Pace, pauses & flow' },
                    { key: 'grammar', label: 'Grammar', score: analysis.scores.grammar, desc: 'Sentence structure' },
                    { key: 'relevance', label: 'Relevance', score: analysis.scores.relevance, desc: 'Topic alignment' },
                    { key: 'vocabulary', label: 'Vocabulary', score: analysis.scores.vocabulary, desc: 'Word choice & precision' }
                  ].map((m) => {
                    const theme = getScoreTheme(m.score);
                    return (
                      <div
                        key={m.key}
                        className={`p-5 rounded-2xl border bg-white shadow-2xs transition-all hover:shadow-xs ${theme.border}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            {m.label}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${theme.badge}`}>
                            {theme.label}
                          </span>
                        </div>
                        <div className={`text-3xl font-black font-mono ${theme.text}`}>
                          {m.score}
                          <span className="text-xs font-normal text-slate-400">/10</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{m.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Qualitative Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Strengths & Filler Words */}
                  <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-3xl space-y-6 shadow-xs">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Key Strengths
                      </h4>
                      <ul className="text-xs sm:text-sm text-slate-700 space-y-2.5 list-disc list-inside font-medium">
                        {analysis.strengths.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-amber-500" />
                        Filler Words Detected
                      </h4>
                      {analysis.fillerWordsDetected?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysis.fillerWordsDetected.map((w, i) => (
                            <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1 rounded-lg font-bold">
                              &ldquo;{w}&rdquo;
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 font-medium">
                          ✨ Excellent delivery! No repetitive filler words detected.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Areas to Fix & Pro Phrasing */}
                  <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-3xl space-y-6 shadow-xs">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Areas to Improve
                      </h4>
                      <ul className="text-xs sm:text-sm text-slate-700 space-y-2.5 list-disc list-inside font-medium">
                        {analysis.areasForImprovement.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Model Phrasing Snippet
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-800 italic border-l-3 border-blue-600 pl-3.5 py-2 bg-blue-50/50 rounded-r-xl leading-relaxed">
                        &ldquo;{analysis.improvedSampleSnippet}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return to Arena Button */}
                <button 
                  onClick={() => { setAnalysis(null); setTopic(''); setTopicDetails(null); }} 
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 text-base"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Practice Another JAM in Arena</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-3xl shadow-xs text-center">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Total Sessions</span>
                <div className="text-5xl font-black text-slate-900 font-mono mt-3">{history.length}</div>
              </div>
              <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-3xl shadow-xs text-center">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Average Score</span>
                <div className="text-5xl font-black text-blue-600 font-mono mt-3">
                  {history.length > 0 ? (history.reduce((sum, h) => sum + h.overallScore, 0) / history.length).toFixed(1) : '0.0'}
                  <span className="text-xl text-slate-400 font-sans">/10</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-3xl shadow-xs text-center">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Primary Focus Area</span>
                <div className="text-2xl font-bold text-slate-800 mt-5">
                  {history.length > 0 ? (history[0].primaryWeakness || 'Fluency') : 'None'}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">JAM Speech Practice History</h3>
                  <p className="text-xs text-slate-500">Record of evaluations saved to local history.</p>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={() => { 
                      if (confirm("Clear your JAM speech history?")) { 
                        setHistory([]); 
                        localStorage.removeItem('app_score_history'); 
                      } 
                    }} 
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer transition-colors"
                  >
                    Clear Records
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="p-16 text-center text-slate-400 space-y-3">
                  <Mic className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-medium text-sm">No evaluation history recorded yet.</p>
                  <button
                    onClick={() => setActiveTab('practice')}
                    className="text-xs font-bold text-blue-600 underline cursor-pointer"
                  >
                    Start your first JAM session →
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-100">
                      <tr>
                        <th className="p-5">Date</th>
                        <th className="p-5">Challenge Topic</th>
                        <th className="p-5 text-center">Weakness Focus</th>
                        <th className="p-5 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {history.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-5 font-medium text-slate-500 text-xs">{record.date}</td>
                          <td className="p-5 font-bold text-slate-900">{record.topic}</td>
                          <td className="p-5 text-center">
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2.5 py-1 rounded-lg font-semibold">
                              {record.primaryWeakness || 'Balanced'}
                            </span>
                          </td>
                          <td className="p-5 text-right font-mono font-black text-slate-900 text-lg">
                            {record.overallScore}/10
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl mx-auto py-8 flex justify-center mt-12 text-center shrink-0 border-t border-slate-100">
        <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">
          Placement Intelligence Suite • JAM Arena
        </p>
      </footer>
    </div>
  );
}
