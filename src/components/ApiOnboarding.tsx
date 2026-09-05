'use client';
import React, { useState } from 'react';
import { setGeminiApiKey } from '@/lib/geminiKey';

interface ApiOnboardingProps {
  onComplete?: (provider: 'gemini', key: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export default function ApiOnboarding({ onComplete, isModal = false, onClose }: ApiOnboardingProps) {
  const [apiKey, setApiKey] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = apiKey.trim();
    if (!clean) return;
    setGeminiApiKey(clean);
    if (onComplete) {
      onComplete('gemini', clean);
    }
    if (onClose) {
      onClose();
    }
  };

  const containerClasses = isModal
    ? "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    : "min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative";

  return (
    <div className={containerClasses}>
      <div 
        className="max-w-3xl w-full bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden z-10 transition-transform duration-500 relative my-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors z-20 cursor-pointer"
            aria-label="Close setup"
          >
            ✕
          </button>
        )}

        <div className="text-center pt-10 pb-6 px-8 border-b border-slate-100 relative overflow-hidden">
          <div className={`w-18 h-18 bg-blue-50 border border-blue-200/60 text-blue-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xs transition-all duration-700 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
            ✨
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Placement Prep Platform
          </h1>
          <p className="text-slate-500 mt-3 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Welcome to the ultimate campus training suite. Connect your free Google Gemini AI to unlock instant speech analysis and mock interviews across the entire suite.
          </p>
        </div>

        <div className="p-6 sm:p-10 space-y-6 bg-slate-50/50">
          
          {/* Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xs">
              <div className="text-2xl sm:text-3xl mb-2">1️⃣</div>
              <h3 className="text-slate-900 font-bold mb-1 text-sm sm:text-base">Get Your Key</h3>
              <p className="text-xs sm:text-sm text-slate-600">Go to <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold hover:text-blue-700">Google AI Studio</a> and sign in with Gmail.</p>
            </div>
            
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xs">
              <div className="text-2xl sm:text-3xl mb-2">2️⃣</div>
              <h3 className="text-slate-900 font-bold mb-1 text-sm sm:text-base">Generate</h3>
              <p className="text-xs sm:text-sm text-slate-600">Click <strong>&quot;Get API Key&quot;</strong>, then click <strong>&quot;Create API Key&quot;</strong>.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xs">
              <div className="text-2xl sm:text-3xl mb-2">3️⃣</div>
              <h3 className="text-slate-900 font-bold mb-1 text-sm sm:text-base">Connect Once</h3>
              <p className="text-xs sm:text-sm text-slate-600">Paste your key below. It will be active across JAM, STAR Coach, &amp; Mock HR.</p>
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Google Gemini API Key here (starts with AIza...)"
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm shadow-xs"
            />
            <button
              type="submit"
              disabled={!apiKey.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold px-8 py-3.5 rounded-2xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer text-sm sm:text-base shrink-0"
            >
              Unlock Suite
            </button>
          </form>
          
          <p className="text-center text-xs text-slate-400 mt-3">
            🔒 Your API key is stored securely in your browser&apos;s local storage and is never sent to any external server other than Google Gemini.
          </p>
        </div>
      </div>
    </div>
  );
}

