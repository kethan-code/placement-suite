'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getScoreTheme } from '@/lib/scoreTheme';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import ApiOnboarding from '@/components/ApiOnboarding';
import { getGeminiApiKey, setGeminiApiKey, removeGeminiApiKey } from '@/lib/geminiKey';

interface ChatMessage {
  id: string;
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
}

const INTERVIEW_ROLES = [
  {
    id: 'SoftwareEngineers',
    title: 'Software Engineering & DSA',
    badge: 'Coding & Algorithms',
    desc: 'Core CS concepts, data structures, and algorithmic problem-solving.'
  },
  {
    id: 'FrontendUI',
    title: 'UI/UX & Frontend Architecture',
    badge: 'Design & Web',
    desc: 'Product design, React, CSS systems & client web performance.'
  },
  {
    id: 'GeneralCampusPlacement',
    title: 'General Campus Placement',
    badge: 'HR & Behavioral',
    desc: 'Standard HR behavioral questions, background & corporate fit.'
  },
  {
    id: 'SystemDesign',
    title: 'System Design & Leadership',
    badge: 'System & Leadership',
    desc: 'Scalable architecture trade-offs, system design & team scenarios.'
  }
];

const INTERVIEW_PERSONAS = [
  {
    id: 'friendly',
    title: 'Friendly',
    roleTag: 'Standard HR',
    badge: 'Conversational',
    desc: 'Conversational pace & standard intro questions'
  },
  {
    id: 'balanced',
    title: 'Balanced',
    roleTag: 'Tech Lead',
    badge: 'Probing',
    desc: 'Probing follow-ups & requests concrete examples'
  },
  {
    id: 'strict',
    title: 'Strict',
    roleTag: 'Stress Interview',
    badge: 'Challenging',
    desc: 'Flags vague answers & challenges trade-offs aggressively'
  }
];

export default function MockHRPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [jobRole, setJobRole] = useState('GeneralCampusPlacement');
  const [persona, setPersona] = useState<'friendly' | 'balanced' | 'strict'>('balanced');
  
  // Session & Question State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<string[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [candidateTranscript, setCandidateTranscript] = useState('');
  const [isLoadingNextTurn, setIsLoadingNextTurn] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const key = getGeminiApiKey();
    if (key) setApiKey(key);

    const syncKey = () => {
      setApiKey(getGeminiApiKey());
    };
    window.addEventListener('gemini_api_key_updated', syncKey);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Restore active session state on page refresh if available
    if (typeof window !== 'undefined') {
      try {
        const savedSession = sessionStorage.getItem('mock_hr_active_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.isInterviewActive && parsed.conversation?.length > 0) {
            setSessionId(parsed.sessionId || null);
            setSessionQuestions(parsed.sessionQuestions || []);
            setConversation(parsed.conversation || []);
            setJobRole(parsed.jobRole || 'GeneralCampusPlacement');
            setPersona(parsed.persona || 'balanced');
            setIsInterviewActive(true);
          }
        }
      } catch (e) {
        console.warn("Failed restoring active session:", e);
      }
    }

    return () => {
      window.removeEventListener('gemini_api_key_updated', syncKey);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Save current active session state for refresh recovery
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isInterviewActive && conversation.length > 0) {
        sessionStorage.setItem('mock_hr_active_session', JSON.stringify({
          sessionId,
          sessionQuestions,
          conversation,
          jobRole,
          persona,
          isInterviewActive: true
        }));
      } else if (!isInterviewActive && !isEvaluating) {
        sessionStorage.removeItem('mock_hr_active_session');
      }
    }
  }, [isInterviewActive, conversation, sessionQuestions, sessionId, jobRole, persona, isEvaluating]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, candidateTranscript, isLoadingNextTurn, isGeneratingQuestion]);

  const getRecentQuestions = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('mock_hr_recent_questions');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const saveToRecentQuestions = (q: string) => {
    if (typeof window === 'undefined' || !q) return;
    try {
      const recent = getRecentQuestions();
      const filtered = recent.filter((item) => item.toLowerCase().trim() !== q.toLowerCase().trim());
      const updated = [q, ...filtered].slice(0, 25);
      localStorage.setItem('mock_hr_recent_questions', JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed saving recent question:", e);
    }
  };

  const testAudioPlayback = () => {
    speakText("Audio output check passed. Headphones and speaker system are working correctly.");
  };

  const speakText = (text: string, onEndCallback?: () => void) => {
    if (!synthRef.current) {
      if (onEndCallback) onEndCallback();
      return;
    }
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeakingAI(true);
    utterance.onend = () => {
      setIsSpeakingAI(false);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => {
      setIsSpeakingAI(false);
      if (onEndCallback) onEndCallback();
    };

    synthRef.current.speak(utterance);
  };

  const playAudioOrFallback = (text: string, base64Audio?: string | null, onEndCallback?: () => void) => {
    if (base64Audio) {
      try {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        setIsSpeakingAI(true);
        audio.onended = () => {
          setIsSpeakingAI(false);
          if (onEndCallback) onEndCallback();
        };
        audio.onerror = () => {
          setIsSpeakingAI(false);
          speakText(text, onEndCallback);
        };
        audio.play();
        return;
      } catch (err) {
        console.warn("Base64 audio playback failed, resorting to TTS synthesis:", err);
      }
    }
    speakText(text, onEndCallback);
  };

  const startInterview = async () => {
    const newSessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}`;
    setSessionId(newSessionId);
    setConversation([]);
    setSessionQuestions([]);
    setEvaluation(null);
    setMicError(null);
    setIsInterviewActive(true);
    setIsGeneratingQuestion(true);

    const activeKey = apiKey || getGeminiApiKey();
    const recent = getRecentQuestions();

    try {
      const res = await fetch('/api/mock-hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_session',
          jobRole,
          persona,
          sessionQuestions: [],
          recentQuestions: recent,
          apiKey: activeKey
        })
      });

      const data = await res.json();
      if (data.success && data.question) {
        const initialQ = data.question;
        setSessionQuestions([initialQ]);
        saveToRecentQuestions(initialQ);

        const firstMsg: ChatMessage = {
          id: Date.now().toString(),
          speaker: 'interviewer',
          text: initialQ,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversation([firstMsg]);
        setIsGeneratingQuestion(false);

        playAudioOrFallback(initialQ, null, () => {
          startListening();
        });
      } else {
        const isAuthError = res.status === 401 || (data.error && data.error.toLowerCase().includes('api key'));
        if (isAuthError) {
          alert("Gemini API key is invalid or unavailable. Please update your API key.");
          removeGeminiApiKey();
          setApiKey(null);
        } else {
          alert("Failed to initialize interview session: " + (data.error || 'Unknown error'));
        }
        setIsInterviewActive(false);
        setIsGeneratingQuestion(false);
      }
    } catch (err) {
      alert("Network error starting interview session.");
      setIsInterviewActive(false);
      setIsGeneratingQuestion(false);
    }
  };

  const handleTryAnotherQuestion = async () => {
    if (isGeneratingQuestion || isLoadingNextTurn) return;
    stopListening();
    if (synthRef.current) synthRef.current.cancel();

    setIsGeneratingQuestion(true);
    const activeKey = apiKey || getGeminiApiKey();
    const recent = getRecentQuestions();

    const isInitialTurn = conversation.length <= 1;

    try {
      if (isInitialTurn) {
        const res = await fetch('/api/mock-hr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_question',
            jobRole,
            persona,
            sessionQuestions,
            recentQuestions: recent,
            apiKey: activeKey
          })
        });

        const data = await res.json();
        if (data.success && data.question) {
          const newQ = data.question;
          setSessionQuestions((prev) => [...prev, newQ]);
          saveToRecentQuestions(newQ);

          const updatedFirstMsg: ChatMessage = {
            id: Date.now().toString(),
            speaker: 'interviewer',
            text: newQ,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setConversation([updatedFirstMsg]);
          setIsGeneratingQuestion(false);

          playAudioOrFallback(newQ, null, () => {
            startListening();
          });
        } else {
          alert("Failed to generate alternative question: " + (data.error || 'Error'));
          setIsGeneratingQuestion(false);
        }
      } else {
        const historyWithoutLastQ = conversation[conversation.length - 1]?.speaker === 'interviewer'
          ? conversation.slice(0, -1)
          : conversation;

        const lastCandidateMsg = historyWithoutLastQ.filter(c => c.speaker === 'candidate').slice(-1)[0];
        const candidateAnswer = lastCandidateMsg ? lastCandidateMsg.text : "";

        const res = await fetch('/api/mock-hr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'turn',
            conversation: historyWithoutLastQ,
            candidateAnswer,
            jobRole,
            persona,
            sessionQuestions,
            recentQuestions: recent,
            apiKey: activeKey
          })
        });

        const data = await res.json();
        if (data.success && data.turn) {
          const fullSpokenResponse = `${data.turn.interviewerReaction} ${data.turn.followUpQuestion}`;

          if (data.turn.followUpQuestion) {
            setSessionQuestions((prev) => [...prev, data.turn.followUpQuestion]);
            saveToRecentQuestions(data.turn.followUpQuestion);
          }

          const updatedMsg: ChatMessage = {
            id: Date.now().toString(),
            speaker: 'interviewer',
            text: fullSpokenResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setConversation((prev) => {
            const base = prev[prev.length - 1]?.speaker === 'interviewer' ? prev.slice(0, -1) : prev;
            return [...base, updatedMsg];
          });
          setIsGeneratingQuestion(false);

          playAudioOrFallback(fullSpokenResponse, data.audioBase64, () => {
            startListening();
          });
        } else {
          alert("Failed to generate alternative question: " + (data.error || 'Error'));
          setIsGeneratingQuestion(false);
        }
      }
    } catch (err) {
      alert("Network error generating alternative question.");
      setIsGeneratingQuestion(false);
    }
  };

  const cleanupAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAnalyser(null);
  };

  const startListening = async () => {
    setMicError(null);
    setCandidateTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        if (!mediaStreamRef.current || !mediaStreamRef.current.active) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              audioContextRef.current = ctx;
              const analyserNode = ctx.createAnalyser();
              analyserNode.fftSize = 256;
              analyserNode.smoothingTimeConstant = 0.8;
              const source = ctx.createMediaStreamSource(stream);
              source.connect(analyserNode);
              analyserRef.current = analyserNode;
              setAnalyser(analyserNode);
            }
          } catch (e) {
            console.warn("Microphone visualizer stream notice:", e);
          }
        } else if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (e: any) => {
        let text = '';
        for (let i = 0; i < e.results.length; i++) {
          text += e.results[i][0].transcript + ' ';
        }
        setCandidateTranscript(text.trim());
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e.error);
        if (e.error === 'not-allowed') {
          setMicError("Microphone access denied. Please unblock microphone in browser settings.");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start listening:", err);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
    }
  };

  const handleFinishCandidateTurn = async () => {
    stopListening();
    const finalAnswer = candidateTranscript.trim();

    if (!finalAnswer) {
      alert("No answer captured. Please speak into your microphone.");
      startListening();
      return;
    }

    const candidateMsg: ChatMessage = {
      id: Date.now().toString(),
      speaker: 'candidate',
      text: finalAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...conversation, candidateMsg];
    setConversation(updatedHistory);
    setCandidateTranscript('');
    setIsLoadingNextTurn(true);

    try {
      const activeKey = apiKey || getGeminiApiKey();
      const recent = getRecentQuestions();
      const res = await fetch('/api/mock-hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'turn',
          conversation: updatedHistory,
          candidateAnswer: finalAnswer,
          jobRole,
          persona,
          sessionQuestions,
          recentQuestions: recent,
          apiKey: activeKey
        })
      });

      const data = await res.json();
      if (data.success && data.turn) {
        const fullSpokenResponse = `${data.turn.interviewerReaction} ${data.turn.followUpQuestion}`;

        if (data.turn.followUpQuestion) {
          setSessionQuestions((prev) => [...prev, data.turn.followUpQuestion]);
          saveToRecentQuestions(data.turn.followUpQuestion);
        }

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          speaker: 'interviewer',
          text: fullSpokenResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversation((prev) => [...prev, aiMsg]);
        setIsLoadingNextTurn(false);

        playAudioOrFallback(fullSpokenResponse, data.audioBase64, () => {
          if (!data.turn.isFinalTurn) {
            startListening();
          }
        });
      } else {
        const isAuthError = res.status === 401 || (data.error && data.error.toLowerCase().includes('api key'));
        if (isAuthError) {
          alert("Gemini API key is invalid or unavailable. Please update your API key.");
          removeGeminiApiKey();
          setApiKey(null);
        } else {
          alert("Failed to generate follow-up question: " + (data.error || 'Gemini error'));
        }
        setIsLoadingNextTurn(false);
      }
    } catch (e) {
      alert("Network error communicating with AI server.");
      setIsLoadingNextTurn(false);
    }
  };

  const handleFinishInterview = async () => {
    stopListening();
    cleanupAudio();
    if (synthRef.current) synthRef.current.cancel();

    if (conversation.length < 2) {
      alert("Please complete at least one Q&A turn before ending the interview.");
      return;
    }

    setIsEvaluating(true);
    try {
      const activeKey = apiKey || getGeminiApiKey();
      const res = await fetch('/api/mock-hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          conversation,
          jobRole,
          persona,
          apiKey: activeKey
        })
      });

      const data = await res.json();
      if (data.success) {
        setEvaluation(data.evaluation);
        setIsInterviewActive(false);

        try {
          const scoreOutOf100 = typeof data.evaluation.overallScore === 'number' 
            ? Math.round(data.evaluation.overallScore <= 10 ? data.evaluation.overallScore * 10 : data.evaluation.overallScore)
            : 80;

          const newRecord = {
            id: sessionId || Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            jobRole,
            persona,
            overallScore: scoreOutOf100,
            turnsCount: Math.floor(conversation.length / 2),
            questionsAsked: sessionQuestions,
            transcript: conversation,
            timestamp: Date.now()
          };

          const existingHistory = JSON.parse(localStorage.getItem('mock_hr_score_history') || '[]');
          localStorage.setItem('mock_hr_score_history', JSON.stringify([newRecord, ...existingHistory]));
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('mock_hr_active_session');
          }
        } catch (e) {
          console.warn("Failed saving analytics record:", e);
        }
      } else {
        alert("Evaluation failed: " + (data.error || 'Unknown error'));
      }
    } catch (e) {
      alert("Network error processing evaluation.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-purple-500/30">
      
      {/* Top Header Navigation */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">AI Mock Interview</h1>
              <p className="text-[11px] text-slate-500 leading-tight">Real-time voice conversation with AI interviewer & TTS audio playback.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowSetupModal(true)}
              className="text-xs font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span>{apiKey ? 'API Connected' : 'Setup API'}</span>
            </button>
            <button
              onClick={() => setShowSetupModal(true)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Edit
            </button>
            <a
              href="/jam"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              JAM
            </a>
            <a
              href="/behavioral"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              STAR Coach
            </a>
            <a
              href="/analytics"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Analytics
            </a>
            <a
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Suite
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-[1060px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-10">

        {showSetupModal && (
          <ApiOnboarding
            isModal={true}
            onClose={() => setShowSetupModal(false)}
            onComplete={(_provider: string, savedKey: string) => {
              setApiKey(savedKey);
              setShowSetupModal(false);
            }}
          />
        )}

        {/* SETUP SCREEN (SPACIOUS, OPEN & PROFESSIONAL SETUP ROOM) */}
        {!isInterviewActive && !evaluation && !isEvaluating && (
          <div className="space-y-8 sm:space-y-10">
            
            {/* 0. Section Header / Intro Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 sm:pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shrink-0"></span>
                  <span className="text-xs font-black tracking-widest text-purple-700 uppercase">
                    INTERVIEW SETUP ROOM
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  Choose Your Practice Interview
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
                  Select target domain, calibrate interviewer style, and verify audio before entering.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-xs font-bold text-purple-700 self-start sm:self-auto shrink-0 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                <span>Interactive 2-Way Speech</span>
              </div>
            </div>

            {micError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs sm:text-sm space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <span>Microphone Notice</span>
                </div>
                <p className="text-xs text-rose-700">{micError}</p>
              </div>
            )}

            {/* 1. TARGET ROLE & DOMAIN (2x2 on Desktop, 1-col on Mobile) */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  1. Target Role &amp; Domain
                </label>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">4 Placement Tracks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4.5">
                {INTERVIEW_ROLES.map((role) => {
                  const isSelected = jobRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setJobRole(role.id)}
                      className={`p-5 sm:p-6 text-left rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-purple-500/80 bg-purple-50/50 shadow-xs ring-1 ring-purple-500/20'
                          : 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/40 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 block leading-snug">
                            {role.title}
                          </span>
                          <span className="text-[11px] font-mono font-medium text-slate-400 block">
                            {role.badge}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 stroke-current stroke-[3]" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {role.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. RECRUITER STRICTNESS & PERSONA (3 in a row on Desktop, Stack/Wrap on Mobile) */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  2. Recruiter Strictness &amp; Persona
                </label>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  How challenging should the interviewer feel?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                {INTERVIEW_PERSONAS.map((p) => {
                  const isSelected = persona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersona(p.id as any)}
                      className={`p-4 sm:p-5 text-left rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-purple-500/80 bg-purple-50/50 shadow-xs ring-1 ring-purple-500/20'
                          : 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/40 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                            {p.title}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            ({p.roleTag})
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {p.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. AUDIO PRE-FLIGHT CHECK (Clean Horizontal Status Bar) */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                3. Audio Pre-Flight Check
              </label>
              <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  {/* Microphone Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎙</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Microphone
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Ready
                    </span>
                    <div className="flex items-center gap-0.5 h-3 ml-1">
                      <span className="w-0.5 h-2 bg-purple-600 rounded-full animate-pulse"></span>
                      <span className="w-0.5 h-3 bg-purple-600 rounded-full animate-pulse [animation-delay:-0.2s]"></span>
                      <span className="w-0.5 h-1.5 bg-purple-600 rounded-full animate-pulse [animation-delay:-0.4s]"></span>
                      <span className="w-0.5 h-2.5 bg-purple-600 rounded-full animate-pulse [animation-delay:-0.1s]"></span>
                    </div>
                  </div>

                  <span className="text-slate-300 hidden sm:inline">|</span>

                  {/* Speaker Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔊</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Speaker
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Ready
                    </span>
                  </div>
                </div>

                <button
                  onClick={testAudioPlayback}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0 active:scale-98"
                >
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                  <span>Test Audio Output</span>
                </button>
              </div>
            </div>

            {/* 4. DYNAMIC SUMMARY & LAUNCH CTA */}
            {(() => {
              const selectedRole = INTERVIEW_ROLES.find(r => r.id === jobRole) || INTERVIEW_ROLES[2];
              const selectedPersona = INTERVIEW_PERSONAS.find(p => p.id === persona) || INTERVIEW_PERSONAS[1];
              return (
                <div className="space-y-4 pt-2">
                  {/* Dynamic Summary Strip */}
                  <div className="bg-purple-50/50 border border-purple-100/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">
                          YOUR INTERVIEW
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {selectedRole.title}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs sm:text-sm font-semibold text-purple-900">
                          {selectedPersona.title} ({selectedPersona.roleTag})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Interactive 2-way voice · AI follow-ups &amp; real-time conversational evaluation
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-purple-200/80 text-xs font-bold text-purple-700 shrink-0 self-start sm:self-auto shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                      <span>🎙 Interactive 2-Way Voice</span>
                    </div>
                  </div>

                  {/* Launch CTA */}
                  <div className="space-y-2.5 text-center pt-2">
                    <button
                      onClick={startInterview}
                      className="w-full py-4 sm:py-5 px-8 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-extrabold rounded-2xl transition-all text-base sm:text-lg shadow-sm shadow-purple-500/20 cursor-pointer flex items-center justify-center gap-2.5"
                    >
                      <span>🚀 Launch Interactive 2-Way Interview</span>
                    </button>
                    <p className="text-xs text-slate-400 font-medium">
                      Ensure headphones or speakers are active for the best conversational experience.
                    </p>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* INTERVIEW LOOP SCREEN */}
        {isInterviewActive && (
          <div className="space-y-6">

            {/* Status Header */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                {isGeneratingQuestion ? (
                  <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-widest">
                    <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Question...</span>
                  </div>
                ) : isSpeakingAI ? (
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></span>
                    <span className="text-xs font-extrabold text-purple-700 uppercase tracking-widest">HR Speaking</span>
                    <div className="flex items-center gap-1 h-4 ml-1">
                      <span className="w-1 h-3 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1 h-4 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1 h-2 bg-purple-600 rounded-full animate-bounce"></span>
                      <span className="w-1 h-3.5 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                    </div>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                      <span className="text-xs font-extrabold text-purple-700 uppercase tracking-widest">Listening to Candidate</span>
                    </div>
                    <VoiceVisualizer analyser={analyser} isListening={isListening} />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processing Turn...</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {conversation.length >= 1 && conversation[conversation.length - 1]?.speaker === 'interviewer' && !isSpeakingAI && !isLoadingNextTurn && !isGeneratingQuestion && (
                  <button
                    onClick={handleTryAnotherQuestion}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>Try Another Question</span>
                  </button>
                )}

                <button
                  onClick={handleFinishInterview}
                  className="bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 border border-slate-200/80 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a1.5 1.5 0 001.142-1.455V4.743a1.5 1.5 0 00-1.854-1.455l-3.114.733a9 9 0 01-6.086-.71l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                  </svg>
                  <span>End & Score Interview</span>
                </button>
              </div>
            </div>

            {/* Chat Conversation Stream */}
            <div className="bg-slate-50/50 border border-slate-200/80 rounded-3xl p-6 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 shadow-inner">
              {isGeneratingQuestion && conversation.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold text-slate-600">Generating fresh opening question for {jobRole}...</p>
                </div>
              )}

              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.speaker === 'interviewer' ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase mb-1 px-1 flex items-center gap-1.5 tracking-wider">
                    {msg.speaker === 'interviewer' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                        HR INTERVIEWER • {msg.timestamp}
                      </>
                    ) : (
                      <>
                        YOU • {msg.timestamp}
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                      </>
                    )}
                  </span>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-5 rounded-2xl text-sm sm:text-base leading-relaxed ${
                      msg.speaker === 'interviewer'
                        ? 'bg-white border border-slate-200/80 text-slate-900 shadow-xs rounded-tl-none font-medium'
                        : 'bg-purple-600 text-white font-medium rounded-tr-none shadow-xs'
                    }`}
                  >
                    "{msg.text}"
                  </div>
                </div>
              ))}

              {/* Realtime Candidate Speech Draft */}
              {isListening && candidateTranscript && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-rose-500 uppercase mb-1 px-1 animate-pulse">Live Capture...</span>
                  <div className="max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed bg-purple-50 border border-purple-200 text-purple-950 italic rounded-tr-none shadow-xs">
                    "{candidateTranscript}"
                  </div>
                </div>
              )}

              {/* AI Processing Spinner */}
              {isLoadingNextTurn && (
                <div className="flex items-center gap-3 text-slate-500 text-xs italic py-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Gemini formulating follow-up question...
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* User Input & Action Controls */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-4 shadow-sm">
              <button
                onClick={handleFinishCandidateTurn}
                disabled={!isListening || !candidateTranscript.trim() || isLoadingNextTurn || isGeneratingQuestion}
                className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-extrabold py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-purple-500/20 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <span>Submit Answer & Get Follow-Up</span>
              </button>

              {!isListening && !isSpeakingAI && !isLoadingNextTurn && !isGeneratingQuestion && (
                <button
                  onClick={startListening}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-bold px-6 py-4 rounded-2xl transition-all text-sm border border-slate-200/80 cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Re-Open Microphone</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* EVALUATING SPINNER */}
        {isEvaluating && (
          <div className="bg-white border border-slate-200/80 p-16 rounded-3xl text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold text-slate-900">Analyzing 2-Way Interview Performance...</h3>
            <p className="text-xs text-slate-500">Scoring communication, confidence, problem solving, and behavioral alignment.</p>
          </div>
        )}

        {/* FINAL EVALUATION DIAGNOSTIC REPORT */}
        {evaluation && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interview Diagnostic</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">2-Way HR Evaluation Report</h3>
                <p className="text-sm text-slate-600 mt-2 max-w-xl leading-relaxed">{evaluation.feedbackSummary}</p>
              </div>
              <div className="text-center bg-slate-50 border border-slate-200/80 rounded-2xl p-6 min-w-[130px] shrink-0 shadow-xs">
                <span className="text-4xl font-extrabold text-slate-900">{evaluation.overallScore}<span className="text-sm text-slate-400">/10</span></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mt-1">Overall Rating</span>
              </div>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              {evaluation.scores && Object.entries(evaluation.scores).map(([key, val]: any) => {
                const theme = getScoreTheme(val);
                const descriptions: Record<string, string> = {
                  communication: 'Clarity & delivery',
                  confidence: 'Poise & tone',
                  problemsolving: 'Analytical depth',
                  behavioralfit: 'Role alignment'
                };
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-2xl border bg-white shadow-xs transition-all hover:shadow-sm ${theme.border}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        {key}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${theme.badge}`}>
                        {val}/10
                      </span>
                    </div>
                    <div className={`text-3xl font-extrabold ${theme.text}`}>
                      {val}
                      <span className="text-sm font-normal text-slate-400">/10</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{descriptions[key.toLowerCase()] || 'Performance metric'}</p>
                  </div>
                );
              })}
            </div>

            {/* Detailed Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Strengths Demonstrated</h4>
                <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                  {evaluation.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth Opportunities</h4>
                <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                  {evaluation.areasForImprovement?.map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>

            {evaluation.proTipForNextInterview && (
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  <span>Pro Tip for Real Interviews</span>
                </h4>
                <p className="text-sm text-slate-700 italic leading-relaxed border-l-2 border-purple-600 pl-3 py-1 bg-purple-50/40 rounded-r-lg">
                  "{evaluation.proTipForNextInterview}"
                </p>
              </div>
            )}

            <button
              onClick={() => { setEvaluation(null); setConversation([]); setSessionQuestions([]); setSessionId(null); }}
              className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold py-4 rounded-2xl transition-colors shadow-sm shadow-purple-500/20 text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Start New 2-Way Interview Session</span>
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="w-full max-w-[1080px] mx-auto py-8 px-4 flex justify-center mt-12 text-center shrink-0 border-t border-slate-100">
        <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">
          Placement Intelligence Suite • AI Mock Interview
        </p>
      </footer>
    </div>
  );
}
