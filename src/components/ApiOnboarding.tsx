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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div 
        className="max-w-3xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden z-10 transition-transform duration-700 hover:scale-[1.01]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center pt-12 pb-8 px-8 border-b border-white/10 relative overflow-hidden">
          <div className={`w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-blue-500/30 transition-all duration-700 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
            ✨
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            Placement Prep Platform
          </h1>
          <p className="text-blue-200 mt-4 text-base max-w-lg mx-auto leading-relaxed">
            Welcome to the ultimate campus training suite. Connect your free Google Gemini AI to unlock instant speech analysis and mock interviews.
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-8 bg-black/20">
          
          {/* Animated Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
              <div className="text-3xl mb-3">1️⃣</div>
              <h3 className="text-white font-bold mb-2">Get Your Key</h3>
              <p className="text-sm text-gray-300">Go to <a href="https://aistudio.google.com/" target="_blank" className="text-blue-400 font-bold hover:underline">Google AI Studio</a> and sign in with your college or personal Gmail.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 delay-100">
              <div className="text-3xl mb-3">2️⃣</div>
              <h3 className="text-white font-bold mb-2">Generate</h3>
              <p className="text-sm text-gray-300">Click the blue <strong>"Get API Key"</strong> button on the left, then click <strong>"Create API Key"</strong>.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 delay-200">
              <div className="text-3xl mb-3">3️⃣</div>
              <h3 className="text-white font-bold mb-2">Connect</h3>
              <p className="text-sm text-gray-300">Copy the long string of text and paste it into the secure box below to start.</p>
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Google Gemini API Key here (starts with AIza...)"
              className="flex-1 bg-black/40 border-2 border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all font-mono text-sm shadow-inner"
            />
            <button
              type="submit"
              disabled={!apiKey.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold px-10 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50 hover:-translate-y-1"
            >
              Unlock Platform
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            🔒 Your API key is stored securely in your browser's local memory and is never saved to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
