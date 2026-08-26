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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
      <div 
        className="max-w-3xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-transform duration-700 hover:scale-[1.01]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center pt-12 pb-8 px-8 border-b border-zinc-800 relative overflow-hidden">
          <div className={`w-20 h-20 bg-zinc-950 border border-zinc-800 text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg transition-all duration-700 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
            ✨
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            Placement Prep Platform
          </h1>
          <p className="text-zinc-400 mt-4 text-base max-w-lg mx-auto leading-relaxed">
            Welcome to the ultimate campus training suite. Connect your free Google Gemini AI to unlock instant speech analysis and mock interviews.
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-8 bg-zinc-950">
          
          {/* Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800/50 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-3">1️⃣</div>
              <h3 className="text-white font-bold mb-2">Get Your Key</h3>
              <p className="text-sm text-zinc-400">Go to <a href="https://aistudio.google.com/" target="_blank" className="text-white underline font-bold hover:text-zinc-200">Google AI Studio</a> and sign in with your college or personal Gmail.</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800/50 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-3">2️⃣</div>
              <h3 className="text-white font-bold mb-2">Generate</h3>
              <p className="text-sm text-zinc-400">Click the <strong>"Get API Key"</strong> button on the left, then click <strong>"Create API Key"</strong>.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800/50 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-3">3️⃣</div>
              <h3 className="text-white font-bold mb-2">Connect</h3>
              <p className="text-sm text-zinc-400">Copy the long string of text and paste it into the secure box below to start.</p>
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Google Gemini API Key here (starts with AIza...)"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-mono text-sm shadow-inner"
            />
            <button
              type="submit"
              disabled={!apiKey.trim()}
              className="bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed font-extrabold px-10 py-4 rounded-2xl transition-colors shadow-lg"
            >
              Unlock Platform
            </button>
          </form>
          
          <p className="text-center text-xs text-zinc-500 mt-4">
            🔒 Your API key is stored securely in your browser's local memory and is never saved to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
