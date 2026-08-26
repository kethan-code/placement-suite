'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getScoreTheme } from '@/lib/scoreTheme';

const COMPETENCIES = [
  { id: 'leadership', label: '👑 Leadership & Ownership', pool: [
    "Tell me about a time you led a team project when ownership was unclear.",
    "Describe how you delegated tasks and kept team members accountable.",
    "Share an instance where you stepped up to resolve a project bottleneck."
  ]},
  { id: 'conflict', label: '🤝 Conflict Resolution', pool: [
    "Tell me about a time you had a conflict with a team member and how you resolved it.",
    "Describe a situation where you had to persuade someone to see things your way.",
    "How do you handle working with someone whose work style is completely different from yours?"
  ]},
  { id: 'crisis', label: '⚡ Crisis & Deadlines', pool: [
    "Describe a situation where you had to work under a very tight deadline.",
    "Tell me about a time when an unforeseen technical crisis disrupted your timeline.",
    "How do you prioritize deliverables when multiple high-stakes tasks hit at once?"
  ]},
  { id: 'failure', label: '💡 Failure & Resilience', pool: [
    "Describe a situation where you failed at a task. What did you learn?",
    "Tell me about a time you received critical feedback and how you responded.",
    "Share a time when a project outcome was disappointing despite your hard work."
  ]},
  { id: 'learning', label: '🚀 Rapid Learning', pool: [
    "Tell me about a time you had to learn a new skill very quickly to complete a project.",
    "Describe a situation where you worked on a domain you knew nothing about.",
    "How do you adapt when requirements change drastically midway through a project?"
  ]}
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
      } catch (e) {}
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
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
        <p className="text-zinc-400 mb-6">Please connect your Gemini API key on the main page first.</p>
        <a href="/" className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors">
          Go to Setup
        </a>
      </div>
    );
  }

  const elapsedTime = 120 - timeLeft;
  const currentStepIndex = Math.min(3, Math.floor(elapsedTime / 30));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans p-6 sm:p-10 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">STAR Method Behavioral Coach</h1>
            <p className="text-sm text-zinc-400 mt-1">Structure interview answers using Situation, Task, Action, and Result.</p>
            <p className="text-xs font-medium text-zinc-500 mt-2 tracking-wide">
              Engineered by <span className="text-zinc-300 font-semibold">Kethan Sunkara</span> • Placement Intelligence Suite
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/mock-hr"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              🎙️ Mock HR
            </a>
            <a
              href="/"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              ← Back to JAM Suite
            </a>
          </div>
        </div>

        {micError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm font-medium">
            ⚠️ {micError}
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block">
            Target Behavioral Competency
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COMPETENCIES.map((comp) => (
              <button
                key={comp.id}
                onClick={() => handleSelectCompetency(comp.id)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                  activeCompetency === comp.id
                    ? 'bg-white text-black border-transparent shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {comp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-1.5 backdrop-blur-sm">
            <span className="text-xs font-black text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">S</span>
            <h4 className="text-xs font-bold text-zinc-200 pt-1">Situation</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Set the scene and provide necessary background context.</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-1.5 backdrop-blur-sm">
            <span className="text-xs font-black text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">T</span>
            <h4 className="text-xs font-bold text-zinc-200 pt-1">Task</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Describe your specific responsibility or objective.</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-1.5 backdrop-blur-sm">
            <span className="text-xs font-black text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">A</span>
            <h4 className="text-xs font-bold text-zinc-200 pt-1">Action</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Detail the exact steps and decisions you executed.</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-1.5 backdrop-blur-sm">
            <span className="text-xs font-black text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">R</span>
            <h4 className="text-xs font-bold text-zinc-200 pt-1">Result</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Share tangible outcomes, metrics, and learnings.</p>
          </div>
        </div>

        {!isRecording && !analysis && !isEvaluating && (
          <div>
            {!question ? (
              <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl text-center space-y-6 shadow-xl">
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                  🎯
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-bold text-white">No Scenario Active</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Select a competency domain above and generate an industry-standard behavioral question.
                  </p>
                </div>
                <button
                  onClick={() => generateQuestion()}
                  className="bg-white text-black font-extrabold py-3.5 px-8 rounded-2xl hover:bg-zinc-200 transition-colors shadow-md text-sm"
                >
                  Generate Behavioral Question
                </button>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                      Assigned Scenario
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                      {difficulty}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-400">Target: 120 Seconds</span>
                </div>

                <div className="py-2">
                  <h2 className="text-2xl font-bold text-white leading-snug">{question}</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={startRecording}
                    className="flex-1 bg-white text-black font-extrabold py-4 px-8 rounded-2xl hover:bg-zinc-200 transition-colors shadow-md text-sm flex items-center justify-center gap-2"
                  >
                    🎙️ Start 2-Minute STAR Recording
                  </button>
                  <button
                    onClick={() => generateQuestion()}
                    className="bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold py-4 px-6 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
                  >
                    🎲 Re-Roll Prompt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isRecording && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live STAR Recording</span>
              </div>
              <span className="text-3xl font-mono font-bold text-white">{timeLeft}s</span>
            </div>

            <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Current Scenario
              </p>
              <p className="text-lg font-semibold text-white leading-relaxed">
                {question}
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Audio Waveform</span>
                <div className="flex items-center gap-1.5 h-6">
                  {[40, 75, 100, 60, 30, 90, 45, 80, 65, 35, 95, 50].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-white rounded-full animate-pulse"
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
                          ? 'bg-white text-black border-transparent font-bold shadow-md'
                          : isPassed
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{item.step}</div>
                      <div className="text-[10px] mt-0.5 font-medium">{item.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="min-h-[120px] text-zinc-200 leading-relaxed font-light text-sm border-t border-zinc-800/80 pt-4">
                {(transcript + (interimText ? ' ' + interimText : '')).trim() || <span className="text-zinc-500 italic">Listening... Speak your story clearly according to the STAR pillars above.</span>}
              </div>
            </div>

            <button
              onClick={stopRecording}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-sm"
            >
              ⏹ Stop & Review Transcript
            </button>
          </div>
        )}

        {!isRecording && transcript && !analysis && !isEvaluating && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Review & Edit Transcript</h3>
              <p className="text-xs text-zinc-400 mt-1">Make any adjustments before sending to the STAR evaluator.</p>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full min-h-[180px] bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-zinc-200 focus:outline-none focus:border-zinc-500 transition-all font-light text-sm"
            />

            <div className="flex gap-4">
              <button
                onClick={() => { setTranscript(''); setQuestion(''); }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-2xl transition-all text-sm"
              >
                Discard
              </button>
              <button
                onClick={evaluateSpeech}
                className="flex-[2] bg-white text-black font-bold hover:bg-zinc-200 py-4 rounded-2xl transition-colors shadow-md text-sm"
              >
                ✨ Generate STAR Evaluation
              </button>
            </div>
          </div>
        )}

        {isEvaluating && (
          <div className="bg-zinc-900 border border-zinc-800 p-16 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold text-white">Evaluating STAR Structure...</h3>
            <p className="text-xs text-zinc-400">Grading Situation, Task, Action, and Measurable Result.</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Evaluation Summary</span>
                <h3 className="text-xl font-bold text-white mt-1">{question}</h3>
                <p className="text-sm text-zinc-300 mt-2 max-w-xl leading-relaxed">{analysis.feedback}</p>
              </div>
              <div className="text-center bg-zinc-950 border border-zinc-800 rounded-2xl p-6 min-w-[130px] shrink-0">
                <span className="text-4xl font-extrabold text-white">{analysis.overallScore}<span className="text-sm text-zinc-500">/10</span></span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mt-1">STAR Score</span>
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
                    <p className="text-[11px] text-zinc-500 mt-1">{descriptions[key.toLowerCase()] || 'Metric score'}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Missing / Weak Elements</h4>
                <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
                  {analysis.missingElements?.map((m: string, i: number) => <li key={i}>{m}</li>)}
                </ul>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recommended Rephrasing</h4>
                <p className="text-xs text-zinc-300 italic border-l-2 border-white pl-3 leading-relaxed">
                  "{analysis.idealAnswerSnippet}"
                </p>
              </div>
            </div>

            <button
              onClick={() => { setAnalysis(null); setTranscript(''); setQuestion(''); }}
              className="w-full bg-white text-black font-bold hover:bg-zinc-200 py-4 rounded-2xl transition-colors text-sm"
            >
              🔄 Practice Another Behavioral Scenario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
