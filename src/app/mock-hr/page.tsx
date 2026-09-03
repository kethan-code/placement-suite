'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getScoreTheme } from '@/lib/scoreTheme';
import VoiceVisualizer from '@/components/VoiceVisualizer';

interface ChatMessage {
  id: string;
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
}

const SAMPLE_INITIAL_QUESTIONS: Record<string, string[]> = {
  SoftwareEngineers: [
    "Tell me about yourself and a complex technical project you built recently.",
    "Walk me through how you approach debugging a high-priority production bug.",
    "How do you stay updated with emerging frameworks and tech stacks?"
  ],
  BusinessManagement: [
    "Tell me about yourself and your experience leading group initiatives.",
    "How do you prioritize deliverables when managing conflicting business deadlines?",
    "Describe a situation where data analytics changed your strategic plan."
  ],
  GeneralCampusPlacement: [
    "Introduce yourself and highlight why you are a great fit for our organization.",
    "Tell me about a time you handled feedback or criticism from a mentor.",
    "Where do you see yourself in 3 years within our corporate structure?"
  ]
};

export default function MockHRPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState('GeneralCampusPlacement');
  const [persona, setPersona] = useState<'friendly' | 'balanced' | 'strict'>('balanced');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
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
    setApiKey(localStorage.getItem('app_gemini_api_key') || localStorage.getItem('app_api_key'));
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, candidateTranscript, isLoadingNextTurn]);

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

  const startInterview = () => {
    const initialPool = SAMPLE_INITIAL_QUESTIONS[jobRole] || SAMPLE_INITIAL_QUESTIONS.GeneralCampusPlacement;
    const initialQ = initialPool[Math.floor(Math.random() * initialPool.length)];

    const firstMsg: ChatMessage = {
      id: Date.now().toString(),
      speaker: 'interviewer',
      text: initialQ,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversation([firstMsg]);
    setIsInterviewActive(true);
    setEvaluation(null);
    setMicError(null);

    // Speak initial question aloud then prompt student to answer
    playAudioOrFallback(initialQ, null, () => {
      startListening();
    });
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
      // Connect / resume microphone audio stream for ChatGPT-style live voice visualizer
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
      const res = await fetch('/api/mock-hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'turn',
          conversation: updatedHistory,
          candidateAnswer: finalAnswer,
          jobRole,
          apiKey
        })
      });

      const data = await res.json();
      if (data.success && data.turn) {
        const fullSpokenResponse = `${data.turn.interviewerReaction} ${data.turn.followUpQuestion}`;

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          speaker: 'interviewer',
          text: fullSpokenResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversation((prev) => [...prev, aiMsg]);
        setIsLoadingNextTurn(false);

        // Play Gemini audio or fallback to TTS, then open microphone
        playAudioOrFallback(fullSpokenResponse, data.audioBase64, () => {
          if (!data.turn.isFinalTurn) {
            startListening();
          }
        });
      } else {
        alert("Failed to generate follow-up question: " + (data.error || 'Gemini error'));
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
      const res = await fetch('/api/mock-hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          conversation,
          jobRole,
          apiKey
        })
      });

      const data = await res.json();
      if (data.success) {
        setEvaluation(data.evaluation);
        setIsInterviewActive(false);
      } else {
        alert("Evaluation error: " + (data.error || 'Check key.'));
      }
    } catch (e) {
      alert("Network error obtaining diagnostic score.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto text-2xl">
            🔑
          </div>
          <h2 className="text-2xl font-bold text-slate-900">API Key Required</h2>
          <p className="text-sm text-slate-500">Please connect your Gemini API key on the main page first.</p>
          <a href="/" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm shadow-purple-500/20 text-sm">
            Go to Setup
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between">
      <div className="max-w-4xl w-full mx-auto space-y-8 relative z-10 flex-1">

        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#8b5cf6] to-[#6366f1] text-white flex items-center justify-center shadow-sm shadow-purple-500/20 shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 19c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6v1h-13v-1z" />
                <path d="M17.5 7.5a1 1 0 0 1 1.4-.2 7 7 0 0 1 0 9.4 1 1 0 0 1-1.4-1.4 5 5 0 0 0 0-6.6 1 1 0 0 1 0-1.2z" />
                <path d="M20 5a1 1 0 0 1 1.4-.2 10.5 10.5 0 0 1 0 14.4 1 1 0 0 1-1.4-1.4 8.5 8.5 0 0 0 0-11.6 1 1 0 0 1 0-1.2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Two-Way Mock HR Interview</h1>
              <p className="text-sm text-slate-500 mt-0.5">Real-time voice conversation with AI interviewer & TTS audio playback.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="/"
              className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-slate-900 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back to JAM Suite</span>
            </a>
          </div>
        </div>

        {micError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-xs">
            <svg className="w-5 h-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{micError}</span>
          </div>
        )}

        {/* SETUP SCREEN */}
        {!isInterviewActive && !evaluation && !isEvaluating && (
          <div className="bg-white border border-slate-200/80 p-8 sm:p-10 rounded-3xl shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Interview Configuration Hub</h2>
                <p className="text-xs text-slate-500 mt-1">Calibrate target domain, interviewer strictness, and hardware audio checks.</p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200/80">
                Interactive 2-Way Speech
              </span>
            </div>

            {/* 1. TARGET ROLE & DOMAIN SELECTOR (GRID LAYOUT) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                1. Target Role & Domain
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'SoftwareEngineers',
                    title: 'Software Engineering & DSA',
                    icon: (
                      <svg className="w-4 h-4 shrink-0 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    ),
                    desc: 'Core CS concepts, data structures, and algorithmic problem-solving.'
                  },
                  {
                    id: 'UIUXFrontend',
                    title: 'UI/UX & Frontend Architecture',
                    icon: (
                      <svg className="w-4 h-4 shrink-0 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                      </svg>
                    ),
                    desc: 'Product design, React, CSS systems & client web performance.'
                  },
                  {
                    id: 'GeneralCampusPlacement',
                    title: 'General Campus Placement',
                    icon: (
                      <svg className="w-4 h-4 shrink-0 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                    ),
                    desc: 'Standard HR behavioral questions, background & corporate fit.'
                  },
                  {
                    id: 'SystemDesignLeadership',
                    title: 'System Design & Leadership',
                    icon: (
                      <svg className="w-4 h-4 shrink-0 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.75 5.1a1.5 1.5 0 011.2-.6h10.1a1.5 1.5 0 011.2.6l2.1 3.45a4.5 4.5 0 01.9 2.7" />
                      </svg>
                    ),
                    desc: 'Scalable architecture trade-offs, system design & team scenarios.'
                  }
                ].map((role) => {
                  const isSelected = jobRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setJobRole(role.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-purple-50/80 text-purple-900 border-purple-500 shadow-xs ring-1 ring-purple-500/20'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isSelected ? 'text-purple-600' : 'text-slate-400'}>{role.icon}</span>
                        <h4 className="text-sm font-bold text-slate-900">{role.title}</h4>
                      </div>
                      <p className={`text-xs ${isSelected ? 'text-slate-600' : 'text-slate-500'} leading-relaxed pl-6`}>{role.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. RECRUITER STRICTNESS & PERSONA SELECTOR */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                2. Recruiter Strictness & Persona
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'friendly',
                    label: 'Friendly (Standard HR)',
                    icon: (
                      <svg className="w-4 h-4 shrink-0 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    desc: 'Conversational pace & standard intro questions'
                  },
                  {
                    id: 'balanced',
                    label: 'Balanced (Tech Lead)',
                    icon: (
                      <svg className="w-4 h-4 shrink-0 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                      </svg>
                    ),
                    desc: 'Probing follow-ups & requests concrete examples'
                  },
                  {
                    id: 'strict',
                    label: 'Strict (Stress Interview)',
                    icon: (
                      <svg className="w-4 h-4 shrink-0 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                      </svg>
                    ),
                    desc: 'Flags vague answers & challenges trade-offs aggressively'
                  }
                ].map((p) => {
                  const isSelected = persona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersona(p.id as any)}
                      className={`text-left p-4 rounded-2xl transition-all duration-200 border cursor-pointer space-y-1 ${
                        isSelected
                          ? 'bg-purple-50/80 text-purple-900 border-purple-500 shadow-xs ring-1 ring-purple-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isSelected ? 'text-purple-600' : 'text-slate-400'}>{p.icon}</span>
                        <div className={`text-xs font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{p.label}</div>
                      </div>
                      <div className={`text-[11px] leading-relaxed pl-6 ${isSelected ? 'text-slate-600' : 'text-slate-500'}`}>{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. HARDWARE & AUDIO PRE-FLIGHT CHECK WIDGET */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                3. Audio Pre-Flight Check
              </label>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-emerald-700">Mic Ready</span>
                  </div>

                  {/* Live Input Visual Meter */}
                  <div className="flex items-center gap-1 h-5 flex-1 sm:w-32">
                    {[30, 65, 80, 45, 90, 70, 40, 85, 60, 95].map((val, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-purple-400 rounded-full animate-pulse"
                        style={{ height: `${val}%`, animationDelay: `${i * 120}ms` }}
                      ></span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={testAudioPlayback}
                  className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-slate-900 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                  <span>Test Audio Output</span>
                </button>
              </div>
            </div>

            {/* 4. PRIMARY LAUNCH CALL TO ACTION */}
            <div className="pt-2 space-y-2 text-center">
              <button
                onClick={startInterview}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-extrabold rounded-2xl transition-all text-base shadow-sm shadow-purple-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
                <span>Launch Interactive 2-Way Interview</span>
              </button>
              <p className="text-xs text-slate-500">Ensure headphones are connected for optimal two-way conversation.</p>
            </div>
          </div>
        )}

        {/* INTERVIEW LOOP SCREEN */}
        {isInterviewActive && (
          <div className="space-y-6">

            {/* Status Header */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                {isSpeakingAI ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></span>
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">HR Speaking (TTS)</span>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">Listening to Candidate</span>
                    </div>
                    <VoiceVisualizer analyser={analyser} isListening={isListening} />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processing Turn...</span>
                )}
              </div>

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

            {/* Chat Conversation Stream */}
            <div className="bg-slate-50/50 border border-slate-200/80 rounded-3xl p-6 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 shadow-inner">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.speaker === 'interviewer' ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 px-1 flex items-center gap-1">
                    {msg.speaker === 'interviewer' ? '👔 HR Interviewer' : '👤 You'} • {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.speaker === 'interviewer'
                        ? 'bg-white border border-slate-200/80 text-slate-900 shadow-xs rounded-tl-none font-normal'
                        : 'bg-purple-600 text-white font-medium rounded-tr-none shadow-xs'
                    }`}
                  >
                    {msg.text}
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
                disabled={!isListening || !candidateTranscript.trim() || isLoadingNextTurn}
                className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-extrabold py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-purple-500/20 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <span>Submit Answer & Get Follow-Up</span>
              </button>

              {!isListening && !isSpeakingAI && !isLoadingNextTurn && (
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
              onClick={() => { setEvaluation(null); setConversation([]); }}
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
      <footer className="w-full max-w-4xl mx-auto py-8 flex justify-center mt-12 text-center shrink-0">
        <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">
          Placement Intelligence Suite • Two-Way Mock HR
        </p>
      </footer>
    </div>
  );
}

