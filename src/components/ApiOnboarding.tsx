'use client';
import React, { useState } from 'react';

interface ApiOnboardingProps {
  onComplete: (provider: 'gemini', key: string) => void;
}

export default function ApiOnboarding({ onComplete }: ApiOnboardingProps) {
  const [apiKey, setApiKey] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    onComplete('gemini', apiKey.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
      <div 
        className="max-w-3xl w-full bg-white border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden z-10 transition-transform duration-700 hover:scale-[1.01]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center pt-12 pb-8 px-8 border-b border-slate-100 relative overflow-hidden">
          <div className={`w-20 h-20 bg-blue-50 border border-blue-200/60 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xs transition-all duration-700 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
            ✨
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Placement Prep Platform
          </h1>
          <p className="text-slate-500 mt-4 text-base max-w-lg mx-auto leading-relaxed">
            Welcome to the ultimate campus training suite. Connect your free Google Gemini AI to unlock instant speech analysis and mock interviews.
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-8 bg-slate-50/50">
          
          {/* Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xs">
              <div className="text-3xl mb-3">1️⃣</div>
              <h3 className="text-slate-900 font-bold mb-2">Get Your Key</h3>
              <p className="text-sm text-slate-600">Go to <a href="https://aistudio.google.com/" target="_blank" className="text-blue-600 underline font-bold hover:text-blue-700">Google AI Studio</a> and sign in with your college or personal Gmail.</p>
            </div>
            
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xs">
              <div className="text-3xl mb-3">2️⃣</div>
              <h3 className="text-slate-900 font-bold mb-2">Generate</h3>
              <p className="text-sm text-slate-600">Click the <strong>"Get API Key"</strong> button on the left, then click <strong>"Create API Key"</strong>.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xs">
              <div className="text-3xl mb-3">3️⃣</div>
              <h3 className="text-slate-900 font-bold mb-2">Connect</h3>
              <p className="text-sm text-slate-600">Copy the long string of text and paste it into the secure box below to start.</p>
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Google Gemini API Key here (starts with AIza...)"
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm shadow-xs"
            />
            <button
              type="submit"
              disabled={!apiKey.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold px-10 py-4 rounded-2xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              Unlock Platform
            </button>
          </form>
          
          <p className="text-center text-xs text-slate-400 mt-4">
            🔒 Your API key is stored securely in your browser's local memory and is never saved to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
