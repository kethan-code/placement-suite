'use client';
import React, { useState, useEffect, useRef } from 'react';

const BEHAVIORAL_QUESTIONS = [
  "Tell me about a time you had a conflict with a team member and how you resolved it.",
  "Describe a situation where you failed at a task. What did you learn?",
  "Tell me about a time you had to learn a new skill very quickly to complete a project.",
  "Describe a time when you had to persuade someone to see things your way.",
  "Tell me about your proudest academic or professional achievement.",
  "Describe a situation where you had to work under a very tight deadline."
];

export default function BehavioralCoachPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2-Minute STAR timer
  const [transcript, setTranscript] = useState('');
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

  const generateQuestion = () => {
    const randomQ = BEHAVIORAL_QUESTIONS[Math.floor(Math.random() * BEHAVIORAL_QUESTIONS.length)];
    setQuestion(randomQ);
    setAnalysis(null);
    setTranscript('');
    setMicError(null);
  };

  const startRecording = async () => {
    if (!question) {
      alert("Please select or generate a question first.");
      return;
    }

    setMicError(null);
    setTranscript('');
    setTimeLeft(120);

    // 1. Explicitly request microphone access to trigger browser prompt
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err: any) {
      setMicError("Microphone permission denied. Please allow microphone access in your browser bar.");
      return;
    }

    // 2. Initialize Speech Recognition
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
      let accumulated = '';
      for (let i = 0; i < event.results.length; i++) {
        accumulated += event.results[i][0].transcript + ' ';
      }
      setTranscript(accumulated.trim());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'not-allowed') {
        setMicError("Microphone access was blocked. Please click the mic icon in your browser URL bar and allow it.");
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current && isRecording && timeLeft > 0) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore if already active
        }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recognition start failed:", err);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
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
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
        <p className="text-gray-400 mb-6">Please connect your Gemini API key on the main page first.</p>
        <a href="/" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all">
          Go to Setup
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans p-6 sm:p-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">STAR Method Behavioral Coach</h1>
            <p className="text-sm text-gray-400 mt-1">Structure interview answers using Situation, Task, Action, and Result.</p>
          </div>
          <a
            href="/"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            ← Back to JAM Suite
          </a>
        </div>

        {micError && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-2xl text-sm font-medium">
            ⚠️ {micError}
          </div>
        )}

        {/* SETUP / QUESTION VIEW */}
        {!isRecording && !analysis && !isEvaluating && (
          <div className="bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-md shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-2xl flex items-center justify-center text-3xl mx-auto">
              🎯
            </div>

            {question ? (
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-purple-400">Assigned Scenario</span>
                <h2 className="text-2xl font-bold text-white max-w-2xl mx-auto">{question}</h2>
              </div>
            ) : (
              <p className="text-gray-400">Click below to generate a real-world behavioral placement question.</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={generateQuestion}
                className="bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 px-6 rounded-2xl transition-all"
              >
                🎲 {question ? 'Shuffle Question' : 'Generate Question'}
              </button>
              <button
                onClick={startRecording}
                disabled={!question}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg transition-all"
              >
                🎙️ Start 2-Minute STAR Answer
              </button>
            </div>
          </div>
        )}

        {/* RECORDING VIEW */}
        {isRecording && (
          <div className="bg-white/5 border border-red-500/30 p-8 rounded-3xl backdrop-blur-md shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Recording Response</span>
              </div>
              <span className="text-3xl font-mono font-bold text-white">{timeLeft}s</span>
            </div>

            <div className="text-center py-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question</span>
              <h2 className="text-xl font-bold text-white mt-1">{question}</h2>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 min-h-[160px] text-gray-200 leading-relaxed font-light">
              {transcript || <span className="text-gray-500 italic">Listening... Start speaking your story clearly.</span>}
            </div>

            <button
              onClick={stopRecording}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg"
            >
              ⏹ Stop & Review Transcript
            </button>
          </div>
        )}

        {/* TRANSCRIPT EDIT / SUBMIT VIEW */}
        {!isRecording && transcript && !analysis && !isEvaluating && (
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Review & Edit Transcript</h3>
              <p className="text-xs text-gray-400 mt-1">Make any adjustments before sending to the STAR evaluator.</p>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full min-h-[180px] bg-black/40 border border-white/10 rounded-2xl p-5 text-gray-200 focus:outline-none focus:border-purple-500 transition-all font-light"
            />

            <div className="flex gap-4">
              <button
                onClick={() => { setTranscript(''); setQuestion(''); }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-4 rounded-2xl transition-all"
              >
                Discard
              </button>
              <button
                onClick={evaluateSpeech}
                className="flex-[2] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
              >
                ✨ Generate STAR Evaluation
              </button>
            </div>
          </div>
        )}

        {/* EVALUATING SPINNER */}
        {isEvaluating && (
          <div className="bg-white/5 border border-purple-500/30 p-16 rounded-3xl text-center space-y-4 backdrop-blur-md">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold text-white">Evaluating STAR Structure...</h3>
            <p className="text-xs text-gray-400">Grading Situation, Task, Action, and Measurable Result.</p>
          </div>
        )}

        {/* RESULTS REPORT */}
        {analysis && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white/5 border border-purple-500/30 p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Evaluation Summary</span>
                <h3 className="text-xl font-bold text-white mt-1">{question}</h3>
                <p className="text-sm text-gray-300 mt-2 max-w-xl leading-relaxed">{analysis.feedback}</p>
              </div>
              <div className="text-center bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 min-w-[130px] shrink-0">
                <span className="text-4xl font-extrabold text-purple-400">{analysis.overallScore}<span className="text-sm text-gray-400">/10</span></span>
                <span className="text-[10px] font-bold text-purple-300 uppercase block mt-1">STAR Score</span>
              </div>
            </div>

            {/* STAR Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {analysis.starScores && Object.entries(analysis.starScores).map(([key, val]: any) => (
                <div key={key} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center backdrop-blur-sm">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{key}</span>
                  <div className="text-3xl font-extrabold text-white my-2">{val}/10</div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${val * 10}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Missing Elements & Ideal Phrasing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Missing / Weak Elements</h4>
                <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside">
                  {analysis.missingElements?.map((m: string, i: number) => <li key={i}>{m}</li>)}
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Recommended Rephrasing</h4>
                <p className="text-xs text-gray-300 italic border-l-2 border-blue-500 pl-3 leading-relaxed">
                  "{analysis.idealAnswerSnippet}"
                </p>
              </div>
            </div>

            <button
              onClick={() => { setAnalysis(null); setTranscript(''); setQuestion(''); }}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all"
            >
              🔄 Practice Another Behavioral Scenario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
