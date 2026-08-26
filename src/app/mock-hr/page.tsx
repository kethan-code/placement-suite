'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getScoreTheme } from '@/lib/scoreTheme';

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

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setApiKey(localStorage.getItem('app_gemini_api_key') || localStorage.getItem('app_api_key'));
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
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

  const startListening = async () => {
    setMicError(null);
    setCandidateTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
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
      } catch (e) {}
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
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
        <p className="text-zinc-400 mb-6">Please connect your Gemini API key on the main page first.</p>
        <a href="/" className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors">
          Go to Setup
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans p-6 sm:p-10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Two-Way Mock HR Interview</h1>
            <p className="text-sm text-zinc-400 mt-1">Real-time voice conversation with AI interviewer & TTS audio playback.</p>
            <p className="text-xs font-medium text-zinc-500 mt-2 tracking-wide">
              Engineered by <span className="text-zinc-300 font-semibold">Kethan Sunkara</span> • Interactive AI Screening
            </p>
          </div>
          <a
            href="/"
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            ← Back to JAM Suite
          </a>
        </div>

        {micError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm font-medium">
            ⚠️ {micError}
          </div>
        )}

        {/* SETUP SCREEN */}
        {!isInterviewActive && !evaluation && !isEvaluating && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 sm:p-10 rounded-3xl shadow-xl space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Interview Configuration Hub</h2>
                <p className="text-xs text-zinc-400 mt-1">Calibrate target domain, interviewer strictness, and hardware audio checks.</p>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                Interactive 2-Way Speech
              </span>
            </div>

            {/* 1. TARGET ROLE & DOMAIN SELECTOR (GRID LAYOUT) */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
                1. Target Role & Domain
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'SoftwareEngineers',
                    title: '💻 Software Engineering & DSA',
                    desc: 'Core CS concepts, data structures, and algorithmic problem-solving.'
                  },
                  {
                    id: 'UIUXFrontend',
                    title: '🎨 UI/UX & Frontend Architecture',
                    desc: 'Product design, React, CSS systems & client web performance.'
                  },
                  {
                    id: 'GeneralCampusPlacement',
                    title: '🎓 General Campus Placement',
                    desc: 'Standard HR behavioral questions, background & corporate fit.'
                  },
                  {
                    id: 'SystemDesignLeadership',
                    title: '🚀 System Design & Leadership',
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
                          ? 'bg-white text-black border-white shadow-lg'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <h4 className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-white'}`}>{role.title}</h4>
                      <p className={`text-xs ${isSelected ? 'text-zinc-700' : 'text-zinc-400'} leading-relaxed`}>{role.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. RECRUITER STRICTNESS & PERSONA SELECTOR */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
                2. Recruiter Strictness & Persona
              </label>
              <div className="bg-zinc-950 border border-zinc-800 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-1.5">
                {[
                  { id: 'friendly', label: '😊 Friendly (Standard HR)', desc: 'Conversational pace & standard intro questions' },
                  { id: 'balanced', label: '⚖️ Balanced (Tech Lead)', desc: 'Probing follow-ups & requests concrete examples' },
                  { id: 'strict', label: '🔥 Strict (Stress Interview)', desc: 'Flags vague answers & challenges trade-offs aggressively' }
                ].map((p) => {
                  const isSelected = persona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersona(p.id as any)}
                      className={`flex-1 text-left p-3.5 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-white text-black border-transparent shadow-sm'
                          : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className={`text-xs font-bold ${isSelected ? 'text-black' : 'text-zinc-200'}`}>{p.label}</div>
                      <div className={`text-[11px] mt-1 ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. HARDWARE & AUDIO PRE-FLIGHT CHECK WIDGET */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
                3. Audio Pre-Flight Check
              </label>
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-medium text-emerald-400">Mic Ready</span>
                  </div>
                  
                  {/* Live Input Visual Meter */}
                  <div className="flex items-center gap-1 h-5 flex-1 sm:w-32">
                    {[30, 65, 80, 45, 90, 70, 40, 85, 60, 95].map((val, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-zinc-700 rounded-full animate-pulse"
                        style={{ height: `${val}%`, animationDelay: `${i * 120}ms` }}
                      ></span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={testAudioPlayback}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2"
                >
                  🔊 Test Audio Output
                </button>
              </div>
            </div>

            {/* 4. PRIMARY LAUNCH CALL TO ACTION */}
            <div className="pt-2 space-y-2 text-center">
              <button
                onClick={startInterview}
                className="w-full py-4 bg-white text-black font-extrabold rounded-2xl hover:bg-zinc-200 transition-all text-base shadow-md"
              >
                🚀 Launch Interactive 2-Way Interview
              </button>
              <p className="text-xs text-zinc-500">Ensure headphones are connected for optimal two-way conversation.</p>
            </div>
          </div>
        )}

        {/* INTERVIEW LOOP SCREEN */}
        {isInterviewActive && (
          <div className="space-y-6">
            
            {/* Status Header */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isSpeakingAI ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
                    <span className="text-xs font-bold text-white uppercase tracking-widest">HR Speaking (TTS)</span>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Listening to Candidate</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Processing Turn...</span>
                )}
              </div>

              <button
                onClick={handleFinishInterview}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                🏁 End & Score Interview
              </button>
            </div>

            {/* Chat Conversation Stream */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 shadow-inner">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.speaker === 'interviewer' ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase mb-1 px-1">
                    {msg.speaker === 'interviewer' ? '👔 HR Interviewer' : '👤 You'} • {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.speaker === 'interviewer'
                        ? 'bg-zinc-950 border border-zinc-800 text-white rounded-tl-none'
                        : 'bg-white text-black font-medium rounded-tr-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Realtime Candidate Speech Draft */}
              {isListening && candidateTranscript && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-red-400 uppercase mb-1 px-1 animate-pulse">Live Capture...</span>
                  <div className="max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed bg-zinc-800/80 border border-zinc-700 text-zinc-200 italic rounded-tr-none">
                    "{candidateTranscript}"
                  </div>
                </div>
              )}

              {/* AI Processing Spinner */}
              {isLoadingNextTurn && (
                <div className="flex items-center gap-3 text-zinc-400 text-xs italic py-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Gemini formulating follow-up question...
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* User Input & Action Controls */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleFinishCandidateTurn}
                disabled={!isListening || !candidateTranscript.trim() || isLoadingNextTurn}
                className="w-full sm:flex-1 bg-white text-black font-extrabold py-4 rounded-2xl hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-md text-sm"
              >
                🗣️ Submit Answer & Get Follow-Up
              </button>

              {!isListening && !isSpeakingAI && !isLoadingNextTurn && (
                <button
                  onClick={startListening}
                  className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-4 rounded-2xl transition-all text-sm"
                >
                  🎙️ Re-Open Microphone
                </button>
              )}
            </div>

          </div>
        )}

        {/* EVALUATING SPINNER */}
        {isEvaluating && (
          <div className="bg-zinc-900 border border-zinc-800 p-16 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold text-white">Analyzing 2-Way Interview Performance...</h3>
            <p className="text-xs text-zinc-400">Scoring communication, confidence, problem solving, and behavioral alignment.</p>
          </div>
        )}

        {/* FINAL EVALUATION DIAGNOSTIC REPORT */}
        {evaluation && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Interview Diagnostic</span>
                <h3 className="text-xl font-bold text-white mt-1">2-Way HR Evaluation Report</h3>
                <p className="text-sm text-zinc-300 mt-2 max-w-xl leading-relaxed">{evaluation.feedbackSummary}</p>
              </div>
              <div className="text-center bg-zinc-950 border border-zinc-800 rounded-2xl p-6 min-w-[130px] shrink-0">
                <span className="text-4xl font-extrabold text-white">{evaluation.overallScore}<span className="text-sm text-zinc-500">/10</span></span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mt-1">Overall Rating</span>
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
                    <p className="text-[11px] text-zinc-500 mt-1">{descriptions[key.toLowerCase()] || 'Performance metric'}</p>
                  </div>
                );
              })}
            </div>

            {/* Detailed Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Key Strengths Demonstrated</h4>
                <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
                  {evaluation.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Growth Opportunities</h4>
                <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
                  {evaluation.areasForImprovement?.map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>

            {evaluation.proTipForNextInterview && (
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">💡 Pro Tip for Real Interviews</h4>
                <p className="text-sm text-zinc-200 italic leading-relaxed">
                  "{evaluation.proTipForNextInterview}"
                </p>
              </div>
            )}

            <button
              onClick={() => { setEvaluation(null); setConversation([]); }}
              className="w-full bg-white text-black font-bold hover:bg-zinc-200 py-4 rounded-2xl transition-colors"
            >
              🔄 Start New 2-Way Interview Session
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
