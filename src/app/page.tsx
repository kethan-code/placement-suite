'use client';
import React, { useState, useEffect, useRef } from 'react';
import ApiOnboarding from '@/components/ApiOnboarding';
import JamTopicSelector from '@/components/JamTopicSelector';

interface ScoreRecord {
  id: string;
  date: string;
  topic: string;
  overallScore: number;
  scores: { fluency: number; grammar: number; relevance: number; vocabulary: number };
  primaryWeakness: string;
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

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'practice' | 'analytics'>('practice');
  const [topic, setTopic] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<ScoreRecord[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('app_api_key');
    const storedHistory = localStorage.getItem('app_score_history');
    if (storedKey) setApiKey(storedKey);
    if (storedHistory) setHistory(JSON.parse(storedHistory));
  }, []);

  const handleKeySetup = (provider: 'gemini', key: string) => {
    localStorage.setItem('app_api_key', key);
    setApiKey(key);
  };

  const handleDisconnectKey = () => {
    localStorage.removeItem('app_api_key');
    setApiKey(null);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRecording && timeLeft === 0) stopRecording();
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const isRecordingRef = useRef(false);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(buffer);
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
    if (audioContextRef.current) audioContextRef.current.close();
    setAudioLevel(0);
  };

  const startRecording = async () => {
    if (!topic) return alert("Please select a topic first.");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");

    setTranscript('');
    setTimeLeft(60);
    setIsRecording(true);
    isRecordingRef.current = true;
    setAnalysis(null);
    setIsReviewing(false);

    let finalTranscript = '';

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: any) => {
      let interim = '';
      finalTranscript = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setTranscript((finalTranscript + interim).trim());
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch (err) {
          console.warn("Could not auto-restart speech recognition:", err);
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
    setIsReviewing(true);
  };

  const submitForEvaluation = async () => {
    if (!transcript.trim()) {
      alert("No transcript found. Please record again.");
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
        const newRecord: ScoreRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          topic,
          overallScore: data.analysis.overallScore,
          scores: data.analysis.scores,
          primaryWeakness: data.analysis.primaryWeakness || 'None'
        };
        const updatedHistory = [newRecord, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('app_score_history', JSON.stringify(updatedHistory));
      } else {
        alert("Evaluation failed: " + (data.error || 'Check your API key.'));
        if (res.status === 401 || (data.error && data.error.toLowerCase().includes('api key'))) {
          localStorage.removeItem('app_gemini_api_key');
          setApiKey('');
        }
        setIsReviewing(true);
      }
    } catch (e) {
      alert("Network error connecting to evaluation server.");
      setIsReviewing(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!apiKey) return <ApiOnboarding onComplete={handleKeySetup} />;

  const averageScore = history.length > 0 ? (history.reduce((sum, h) => sum + h.overallScore, 0) / history.length).toFixed(1) : '0.0';
  const weaknessCount: Record<string, number> = {};
  history.forEach((h) => { if (h.primaryWeakness && h.primaryWeakness !== 'None') weaknessCount[h.primaryWeakness] = (weaknessCount[h.primaryWeakness] || 0) + 1; });

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans pb-16 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="bg-white/5 border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-xl shadow-lg">✨</div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">Placement Suite</span>
              <span className="hidden sm:inline-block ml-3 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-bold">
                Powered by Gemini 2.5
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('practice')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'practice' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              JAM Simulator
            </button>
            <a href="/behavioral" className="px-4 py-2 rounded-xl text-sm font-bold text-purple-400 hover:text-white hover:bg-purple-500/20 transition-all border border-purple-500/30">
              STAR Coach
            </a>
            <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              Analytics
            </button>
            <button onClick={handleDisconnectKey} title="Disconnect Key" className="text-sm text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 rounded-xl px-3 py-2 transition-all ml-2">
              ⚙️ Disconnect
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 relative z-10">
        {activeTab === 'practice' && (
          <div className="space-y-6 animate-fade-in">
            {!isRecording && !isReviewing && !isEvaluating && !analysis && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7">
                  {/* Keep your light theme selector here if you prefer, or we can restyle it dark later */}
                  <JamTopicSelector onTopicSelect={(t) => setTopic(t)} />
                </div>

                <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-8 backdrop-blur-md shadow-xl">
                  <div className="w-48 h-48 rounded-full border-4 border-blue-500/30 flex flex-col items-center justify-center bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative">
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-400 animate-spin opacity-30"></div>
                    <span className="text-6xl font-extrabold text-white font-mono drop-shadow-md">60</span>
                    <span className="text-xs uppercase tracking-widest text-blue-300 font-bold mt-2">Seconds</span>
                  </div>

                  <div className="w-full space-y-3">
                    <button onClick={startRecording} disabled={!topic} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg text-lg hover:-translate-y-1">
                      🎙️ Start JAM Session
                    </button>
                    {!topic && <p className="text-xs text-gray-500">Pick or generate a topic to unlock the timer.</p>}
                  </div>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="bg-white/5 border border-red-500/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(239,68,68,0.1)] space-y-6 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-sm font-bold text-red-400 uppercase tracking-widest">Live Recording</span>
                  </div>
                  <span className="text-4xl font-mono font-bold text-white">{timeLeft}s</span>
                </div>
                <div className="text-center py-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Prompt</span>
                  <h2 className="text-3xl font-extrabold text-white mt-2 drop-shadow-sm">{topic}</h2>
                </div>
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Speech Capture</span>
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-75" style={{ width: `${audioLevel}%` }}></div>
                    </div>
                  </div>
                  <p className="text-gray-300 min-h-[120px] text-lg leading-relaxed font-light">
                    {transcript || <span className="text-gray-600 italic">Speak clearly into your microphone...</span>}
                  </p>
                </div>
                <button onClick={stopRecording} className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg text-lg hover:-translate-y-1">
                  ⏹ Finish Speech
                </button>
              </div>
            )}

            {isReviewing && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl space-y-6 backdrop-blur-md">
                <div>
                  <h3 className="text-2xl font-bold text-white">Review Transcript</h3>
                  <p className="text-sm text-gray-400 mt-2">Correct any typos before the AI grades your performance.</p>
                </div>
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="w-full min-h-[200px] bg-black/40 border border-white/10 rounded-2xl p-5 text-base text-gray-300 leading-relaxed focus:bg-black/60 focus:outline-none focus:border-blue-500 transition-all" />
                <div className="flex gap-4">
                  <button onClick={() => { setIsReviewing(false); setTopic(''); }} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-4 rounded-2xl transition-all">Discard</button>
                  <button onClick={submitForEvaluation} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1">✨ Generate AI Diagnostic</button>
                </div>
              </div>
            )}

            {isEvaluating && (
              <div className="bg-white/5 border border-blue-500/30 rounded-3xl p-20 text-center space-y-6 shadow-xl backdrop-blur-md">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="text-2xl font-bold text-white">Gemini is Analyzing...</h3>
                <p className="text-gray-400">Evaluating fluency, structure, and keyword relevance.</p>
              </div>
            )}

            {analysis && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl backdrop-blur-md">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Final Report</span>
                    <h3 className="text-2xl font-extrabold text-white mt-2">{topic}</h3>
                    <p className="text-base text-gray-300 mt-3 leading-relaxed max-w-2xl">{analysis.feedback}</p>
                  </div>
                  <div className="text-center bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 min-w-[140px] shrink-0 shadow-inner">
                    <span className="text-5xl font-black text-blue-400">{analysis.overallScore}<span className="text-lg text-gray-500">/10</span></span>
                    <span className="text-xs font-bold text-blue-500 uppercase block mt-2 tracking-widest">Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[ { label: 'Fluency', val: analysis.scores.fluency }, { label: 'Grammar', val: analysis.scores.grammar }, { label: 'Relevance', val: analysis.scores.relevance }, { label: 'Vocabulary', val: analysis.scores.vocabulary } ].map((s) => (
                    <div key={s.label} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center backdrop-blur-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</span>
                      <div className="text-3xl font-extrabold text-white my-3">{s.val}/10</div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${s.val * 10}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6 backdrop-blur-sm">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Key Strengths</h4>
                      <ul className="text-sm text-gray-300 space-y-3 list-disc list-inside">
                        {analysis.strengths.map((st, i) => <li key={i}>{st}</li>)}
                      </ul>
                    </div>
                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Filler Words Used</h4>
                      {analysis.fillerWordsDetected?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysis.fillerWordsDetected.map((w, i) => <span key={i} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-3 py-1.5 rounded-lg font-bold">"{w}"</span>)}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Clean delivery! No filler words detected.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6 backdrop-blur-sm">
                    <div>
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">Areas to Fix</h4>
                      <ul className="text-sm text-gray-300 space-y-3 list-disc list-inside">
                        {analysis.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Pro Phrasing</h4>
                      <p className="text-sm text-gray-300 italic border-l-2 border-blue-500 pl-4 py-2 bg-blue-500/5 rounded-r-xl">
                        "{analysis.improvedSampleSnippet}"
                      </p>
                    </div>
                  </div>
                </div>

                <button onClick={() => { setAnalysis(null); setTopic(''); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all">
                  🔄 Practice Another Session
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-sm text-center backdrop-blur-sm">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Sessions</span>
                <div className="text-5xl font-extrabold text-white mt-4">{history.length}</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-sm text-center backdrop-blur-sm">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Average Score</span>
                <div className="text-5xl font-extrabold text-blue-400 mt-4">{averageScore}<span className="text-xl text-gray-500">/10</span></div>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-sm text-center backdrop-blur-sm">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Weakness</span>
                <div className="text-2xl font-bold text-rose-400 mt-6">
                  {Object.keys(weaknessCount).length > 0 ? Object.entries(weaknessCount).sort((a, b) => b[1] - a[1])[0][0] : 'None'}
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white">Session History</h3>
                {history.length > 0 && (
                  <button onClick={() => { if (confirm("Clear your speech history?")) { setHistory([]); localStorage.removeItem('app_score_history'); } }} className="text-xs text-red-400 hover:text-red-300 transition-colors font-bold">
                    Clear Records
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="p-16 text-center text-gray-500">No evaluation history recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-black/20 text-xs font-bold text-gray-400 uppercase border-b border-white/10">
                      <tr>
                        <th className="p-5">Date</th>
                        <th className="p-5">Topic</th>
                        <th className="p-5 text-center">Focus Area</th>
                        <th className="p-5 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {history.map((record) => (
                        <tr key={record.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 font-medium">{record.date}</td>
                          <td className="p-5 font-bold text-white">{record.topic}</td>
                          <td className="p-5 text-center">
                            <span className="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-lg font-bold">
                              {record.primaryWeakness || 'Balanced'}
                            </span>
                          </td>
                          <td className="p-5 text-right font-black text-blue-400 text-lg">
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
    </div>
  );
}
