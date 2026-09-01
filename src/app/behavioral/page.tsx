'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getScoreTheme } from '@/lib/scoreTheme';

const COMPETENCIES = [
  {
    id: 'leadership',
    label: 'Leadership & Ownership',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    pool: [
      "Tell me about a time you led a team project when ownership was unclear.",
      "Describe how you delegated tasks and kept team members accountable.",
      "Share an instance where you stepped up to resolve a project bottleneck."
    ]
  },
  {
    id: 'conflict',
    label: 'Conflict Resolution',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    pool: [
      "Tell me about a time you had a conflict with a team member and how you resolved it.",
      "Describe a situation where you had to persuade someone to see things your way.",
      "How do you handle working with someone whose work style is completely different from yours?"
    ]
  },
  {
    id: 'crisis',
    label: 'Crisis & Deadlines',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    pool: [
      "Describe a situation where you had to work under a very tight deadline.",
      "Tell me about a time when an unforeseen technical crisis disrupted your timeline.",
      "How do you prioritize deliverables when multiple high-stakes tasks hit at once?"
    ]
  },
  {
    id: 'failure',
    label: 'Failure & Resilience',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    pool: [
      "Describe a situation where you failed at a task. What did you learn?",
      "Tell me about a time you received critical feedback and how you responded.",
      "Share a time when a project outcome was disappointing despite your hard work."
    ]
  },
  {
    id: 'learning',
    label: 'Rapid Learning',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    pool: [
      "Tell me about a time you had to learn a new skill very quickly to complete a project.",
      "Describe a situation where you worked on a domain you knew nothing about.",
      "How do you adapt when requirements change drastically midway through a project?"
    ]
  }
];

export default function BehavioralCoachPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeCompetency, setActiveCompetency] = useState('leadership');
  const [question, setQuestion] = useState('');
  const [difficulty, setDifficulty] = useState<'Medium' | 'Hard'>('Medium');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2-Minute STAR timer
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setApiKey(localStorage.getItem('app_gemini_api_key') || localStorage.getItem('app_api_key'));
  }, []);

  // Timer Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRecording && timeLeft === 0) {
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const generateQuestion = (competencyId?: string) => {
    const comp = COMPETENCIES.find((c) => c.id === (competencyId || activeCompetency)) || COMPETENCIES[0];
    const randomQ = comp.pool[Math.floor(Math.random() * comp.pool.length)];
    setQuestion(randomQ);
    setDifficulty(Math.random() > 0.5 ? 'Hard' : 'Medium');
    setAnalysis(null);
    setTranscript('');
    setMicError(null);
  };

  const handleSelectCompetency = (id: string) => {
    setActiveCompetency(id);
    generateQuestion(id);
  };

  const isRecordingRef = useRef(false);

  const startRecording = async () => {
    if (!question) {
      alert("Please select or generate a question first.");
      return;
    }

    setMicError(null);
    setTranscript('');
    setInterimText('');
    setTimeLeft(120);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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
    setTranscript((prev) => (prev + (interimText ? ' ' + interimText : '')).trim());
    setInterimText('');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const evaluateSpeech = async () => {
    if (!transcript.trim()) {
      alert("No transcript found. Please record your answer first.");
      return;
    }
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/analyze-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          question,
          durationSeconds: 120 - timeLeft,
          apiKey
        })
      });

      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        alert("Evaluation Error: " + (data.error || 'Check your Gemini key.'));
      }
    } catch (e) {
      alert("Network error communicating with AI server.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            🔑
          </div>
          <h2 className="text-2xl font-bold text-slate-900">API Key Required</h2>
          <p className="text-sm text-slate-500">Please connect your Gemini API key on the main page first.</p>
          <a href="/" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm shadow-amber-500/20 text-sm">
            Go to Setup
          </a>
        </div>
      </div>
    );
  }

  const elapsedTime = 120 - timeLeft;
  const currentStepIndex = Math.min(3, Math.floor(elapsedTime / 30));

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto space-y-8 relative z-10 flex-1">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20 shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">STAR Method Behavioral Coach</h1>
              <p className="text-sm text-slate-500 mt-0.5">Structure interview answers using Situation, Task, Action, and Result.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="/mock-hr"
              className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-slate-900 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 19c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6v1h-13v-1z" />
                <path d="M17.5 7.5a1 1 0 0 1 1.4-.2 7 7 0 0 1 0 9.4 1 1 0 0 1-1.4-1.4 5 5 0 0 0 0-6.6 1 1 0 0 1 0-1.2z" />
                <path d="M20 5a1 1 0 0 1 1.4-.2 10.5 10.5 0 0 1 0 14.4 1 1 0 0 1-1.4-1.4 8.5 8.5 0 0 0 0-11.6 1 1 0 0 1 0-1.2z" />
              </svg>
              <span>Mock HR</span>
            </a>
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

        {/* Competencies */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Target Behavioral Competency
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COMPETENCIES.map((comp) => {
              const isSelected = activeCompetency === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => handleSelectCompetency(comp.id)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 text-amber-800 border-amber-500 shadow-xs ring-1 ring-amber-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/60'
                  }`}
                >
                  <span className={isSelected ? 'text-amber-600' : 'text-slate-400'}>{comp.icon}</span>
                  <span>{comp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1.5 shadow-xs">
            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/80">S</span>
            <h4 className="text-xs font-bold text-slate-900 pt-1">Situation</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Set the scene and provide necessary background context.</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1.5 shadow-xs">
            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/80">T</span>
            <h4 className="text-xs font-bold text-slate-900 pt-1">Task</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Describe your specific responsibility or objective.</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1.5 shadow-xs">
            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/80">A</span>
            <h4 className="text-xs font-bold text-slate-900 pt-1">Action</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Detail the exact steps and decisions you executed.</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1.5 shadow-xs">
            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/80">R</span>
            <h4 className="text-xs font-bold text-slate-900 pt-1">Result</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Share tangible outcomes, metrics, and learnings.</p>
          </div>
        </div>

        {/* Main Work Area */}
        {!isRecording && !analysis && !isEvaluating && (
          <div>
            {!question ? (
              <div className="bg-white border border-slate-200/80 p-12 rounded-3xl text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 bg-amber-50 border border-amber-200/80 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">No Scenario Active</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select a competency domain above and generate an industry-standard behavioral question.
                  </p>
                </div>
                <button
                  onClick={() => generateQuestion()}
                  className="bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold py-3.5 px-8 rounded-2xl transition-colors shadow-sm shadow-amber-500/20 text-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" />
                  </svg>
                  <span>Generate Behavioral Question</span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 p-8 rounded-3xl space-y-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
                      Assigned Scenario
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      {difficulty}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">Target: 120 Seconds</span>
                </div>

                <div className="py-2">
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">{question}</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={startRecording}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold py-4 px-8 rounded-2xl transition-colors shadow-sm shadow-amber-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Start 2-Minute STAR Recording</span>
                  </button>
                  <button
                    onClick={() => generateQuestion()}
                    className="bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-700 border border-slate-200/80 font-bold py-4 px-6 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Re-Roll Prompt</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Recording */}
        {isRecording && (
          <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">Live STAR Recording</span>
              </div>
              <span className="text-3xl font-mono font-bold text-slate-900">{timeLeft}s</span>
            </div>

            <div className="mb-6 p-4 bg-amber-50/40 border border-amber-200/60 rounded-xl">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                Current Scenario
              </p>
              <p className="text-lg font-semibold text-slate-900 leading-relaxed">
                {question}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audio Waveform</span>
                <div className="flex items-center gap-1.5 h-6">
                  {[40, 75, 100, 60, 30, 90, 45, 80, 65, 35, 95, 50].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-amber-500 rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                    ></span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-2">
                {[
                  { step: 'S', label: 'Situation (0-30s)' },
                  { step: 'T', label: 'Task (30-60s)' },
                  { step: 'A', label: 'Action (60-90s)' },
                  { step: 'R', label: 'Result (90-120s)' }
                ].map((item, idx) => {
                  const isActive = currentStepIndex === idx;
                  const isPassed = currentStepIndex > idx;
                  return (
                    <div
                      key={item.step}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isActive
                          ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs'
                          : isPassed
                            ? 'bg-amber-50 border-amber-200/80 text-amber-800'
                            : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{item.step}</div>
                      <div className="text-[10px] mt-0.5 font-medium">{item.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="min-h-[120px] text-slate-800 leading-relaxed font-normal text-sm border-t border-slate-200 pt-4">
                {(transcript + (interimText ? ' ' + interimText : '')).trim() || <span className="text-slate-400 italic">Listening... Speak your story clearly according to the STAR pillars above.</span>}
              </div>
            </div>

            <button
              onClick={stopRecording}
              className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold py-4 rounded-2xl transition-all shadow-sm shadow-rose-500/20 text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span>Stop & Review Transcript</span>
            </button>
          </div>
        )}

        {/* Review Transcript */}
        {!isRecording && transcript && !analysis && !isEvaluating && (
          <div className="bg-white border border-slate-200/80 p-8 rounded-3xl space-y-6 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Review & Edit Transcript</h3>
              <p className="text-xs text-slate-500 mt-1">Make any adjustments before sending to the STAR evaluator.</p>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full min-h-[180px] bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-sm"
            />

            <div className="flex gap-4">
              <button
                onClick={() => { setTranscript(''); setQuestion(''); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all border border-slate-200/80 text-sm cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={evaluateSpeech}
                className="flex-[2] bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold py-4 rounded-2xl transition-colors shadow-sm shadow-amber-500/20 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" />
                </svg>
                <span>Generate STAR Evaluation</span>
              </button>
            </div>
          </div>
        )}

        {/* Evaluating */}
        {isEvaluating && (
          <div className="bg-white border border-slate-200/80 p-16 rounded-3xl text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold text-slate-900">Evaluating STAR Structure...</h3>
            <p className="text-xs text-slate-500">Grading Situation, Task, Action, and Measurable Result.</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Evaluation Summary</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{question}</h3>
                <p className="text-sm text-slate-600 mt-2 max-w-xl leading-relaxed">{analysis.feedback}</p>
              </div>
              <div className="text-center bg-slate-50 border border-slate-200/80 rounded-2xl p-6 min-w-[130px] shrink-0 shadow-xs">
                <span className="text-4xl font-extrabold text-slate-900">{analysis.overallScore}<span className="text-sm text-slate-400">/10</span></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mt-1">STAR Score</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              {analysis.starScores && Object.entries(analysis.starScores).map(([key, val]: any) => {
                const theme = getScoreTheme(val);
                const descriptions: Record<string, string> = {
                  situation: 'Context & setting',
                  task: 'Responsibility',
                  action: 'Steps taken',
                  result: 'Outcome & metrics'
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
                    <p className="text-[11px] text-slate-500 mt-1">{descriptions[key.toLowerCase()] || 'Metric score'}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Missing / Weak Elements</h4>
                <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                  {analysis.missingElements?.map((m: string, i: number) => <li key={i}>{m}</li>)}
                </ul>
              </div>

              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Rephrasing</h4>
                <p className="text-xs text-slate-700 italic border-l-2 border-amber-500 pl-3 py-1 bg-amber-50/40 rounded-r-lg leading-relaxed">
                  "{analysis.idealAnswerSnippet}"
                </p>
              </div>
            </div>

            <button
              onClick={() => { setAnalysis(null); setTranscript(''); setQuestion(''); }}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold py-4 rounded-2xl transition-colors shadow-sm shadow-amber-500/20 text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Practice Another Behavioral Scenario</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-8 flex justify-center mt-12 text-center shrink-0">
        <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">
          Placement Intelligence Suite • STAR Method Coach
        </p>
      </footer>
    </div>
  );
}

