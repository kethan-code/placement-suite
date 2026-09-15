'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getGeminiApiKey, removeGeminiApiKey, hasGeminiApiKey } from '@/lib/geminiKey';
import ApiOnboarding from '@/components/ApiOnboarding';

export default function WelcomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [howItWorksDropdownOpen, setHowItWorksDropdownOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileHowItWorksOpen, setMobileHowItWorksOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const checkKey = () => {
      setIsConfigured(hasGeminiApiKey());
    };
    checkKey();

    window.addEventListener('gemini_api_key_updated', checkKey);
    return () => window.removeEventListener('gemini_api_key_updated', checkKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFeaturesDropdownOpen(false);
        setAboutDropdownOpen(false);
        setHowItWorksDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDisconnect = () => {
    if (confirm('Disconnect your Gemini API key? You will need to enter it again to use AI features.')) {
      removeGeminiApiKey();
      setIsConfigured(false);
    }
  };

  return (
    <div className="bg-white h-screen max-h-screen text-zinc-900 font-sans flex flex-col justify-between overflow-y-auto lg:overflow-hidden select-none">
      {/* Setup Modal */}
      {showSetupModal && (
        <ApiOnboarding
          isModal={true}
          onClose={() => setShowSetupModal(false)}
          onComplete={() => {
            setShowSetupModal(false);
            setIsConfigured(true);
          }}
        />
      )}

      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-zinc-200/60 sticky top-0 z-40 h-[72px] lg:h-[80px] flex items-center shrink-0">
        <div className="max-w-[1340px] w-full mx-auto px-6 sm:px-10 h-full flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link href="/" className="w-[230px] sm:w-[250px] flex items-center gap-3 group focus:outline-none shrink-0">
            <svg className="w-9 h-9 sm:w-10 sm:h-10 text-black shrink-0" viewBox="0 0 32 32" fill="currentColor">
              <path d="M6 5C3.79 5 2 6.79 2 9v2c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4V9c0-2.21-1.79-4-4-4H6zm14 6c-2.21 0-4 1.79-4 4v2c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-2c0-2.21-1.79-4-4-4h-6zM6 17c-2.21 0-4 1.79-4 4v2c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-2c0-2.21-1.79-4-4-4H6z" />
            </svg>
            <div className="flex flex-col text-left">
              <span className="text-[17px] sm:text-[18px] font-black tracking-wider text-black leading-tight font-sans">
                PLACEMENT
              </span>
              <span className="text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.18em] text-zinc-900 leading-tight mt-0.5">
                INTELLIGENCE SUITE
              </span>
            </div>
          </Link>

          {/* Right: Navigation Links & API Connection Status */}
          <div className="hidden md:flex items-center gap-[30px] lg:gap-[40px]">
            <nav className="flex items-center gap-[30px] lg:gap-[40px] text-[16px] lg:text-[18px] font-medium text-zinc-900" ref={dropdownRef}>
              {/* About Us Item with Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAboutDropdownOpen(!aboutDropdownOpen);
                    if (!aboutDropdownOpen) setFeaturesDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer focus:outline-none"
                  aria-expanded={aboutDropdownOpen}
                >
                  <span>About Us</span>
                </button>

                {/* About Us Dropdown Panel */}
                {aboutDropdownOpen && (
                  <div className="absolute top-[calc(100%+24px)] left-1/2 -translate-x-1/2 w-[540px] max-w-[92vw] bg-white border border-zinc-200/90 rounded-2xl shadow-xl p-6 sm:p-7 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4">
                      {/* Heading */}
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-zinc-950 uppercase tracking-wider">
                          ABOUT PLACEMENT INTELLIGENCE SUITE
                        </h3>
                      </div>

                      {/* Content Paragraphs */}
                      <div className="space-y-3 text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-normal">
                        <p>
                          &ldquo;An AI-powered placement preparation platform designed to help students practice, improve, and build interview confidence.&rdquo;
                        </p>
                        <p>
                          &ldquo;Practice with JAM Simulator, strengthen behavioral answers with STAR Coach, and experience realistic conversations with AI Mock Interview.&rdquo;
                        </p>
                        <p>
                          &ldquo;Analytics tracks your actual practice history and performance, helping you understand your strengths and what to improve next.&rdquo;
                        </p>
                      </div>

                      {/* Creator Credit */}
                      <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">
                          BY KETHAN & SREEKAR
                        </span>
                        <button
                          onClick={() => setAboutDropdownOpen(false)}
                          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors font-medium cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Features Item with Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setFeaturesDropdownOpen(!featuresDropdownOpen);
                    if (!featuresDropdownOpen) setAboutDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer focus:outline-none"
                  aria-expanded={featuresDropdownOpen}
                >
                  <span>Features</span>
                </button>

                {/* Dropdown Panel */}
                {featuresDropdownOpen && (
                  <div className="absolute top-[calc(100%+24px)] left-1/2 -translate-x-1/2 w-[880px] max-w-[92vw] bg-white border border-zinc-200/90 rounded-2xl shadow-xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-4 gap-4">
                      {/* 1. JAM Simulator */}
                      <Link 
                        href="/jam" 
                        onClick={() => setFeaturesDropdownOpen(false)} 
                        className="group/item p-3.5 rounded-xl hover:bg-blue-50/40 border border-transparent hover:border-blue-100 transition-all block"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-base">🎙</span>
                          <h4 className="text-xs font-bold text-zinc-900 group-hover/item:text-blue-600 transition-colors tracking-tight">
                            JAM SIMULATOR
                          </h4>
                        </div>
                        <p className="text-[11px] font-semibold text-blue-600 mb-1 leading-snug">
                          60-second AI-powered speaking practice.
                        </p>
                        <p className="text-[11px] text-zinc-600 font-normal leading-relaxed">
                          Speak, transcribe, and improve your communication.
                        </p>
                      </Link>

                      {/* 2. STAR Coach */}
                      <Link 
                        href="/behavioral" 
                        onClick={() => setFeaturesDropdownOpen(false)} 
                        className="group/item p-3.5 rounded-xl hover:bg-amber-50/40 border border-transparent hover:border-amber-100 transition-all block"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-base">⭐</span>
                          <h4 className="text-xs font-bold text-zinc-900 group-hover/item:text-amber-600 transition-colors tracking-tight">
                            STAR COACH
                          </h4>
                        </div>
                        <p className="text-[11px] font-semibold text-amber-600 mb-1 leading-snug">
                          AI-guided behavioral interview preparation.
                        </p>
                        <p className="text-[11px] text-zinc-600 font-normal leading-relaxed">
                          Practice structured answers using the STAR method.
                        </p>
                      </Link>

                      {/* 3. AI Mock Interview */}
                      <Link 
                        href="/mock-hr" 
                        onClick={() => setFeaturesDropdownOpen(false)} 
                        className="group/item p-3.5 rounded-xl hover:bg-purple-50/40 border border-transparent hover:border-purple-100 transition-all block"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-base">👤</span>
                          <h4 className="text-xs font-bold text-zinc-900 group-hover/item:text-purple-600 transition-colors tracking-tight">
                            AI MOCK INTERVIEW
                          </h4>
                        </div>
                        <p className="text-[11px] font-semibold text-purple-600 mb-1 leading-snug">
                          Real-time two-way AI interview simulation.
                        </p>
                        <p className="text-[11px] text-zinc-600 font-normal leading-relaxed">
                          Experience realistic interviews with instant feedback.
                        </p>
                      </Link>

                      {/* 4. Analytics */}
                      <Link 
                        href="/analytics" 
                        onClick={() => setFeaturesDropdownOpen(false)} 
                        className="group/item p-3.5 rounded-xl hover:bg-zinc-100/70 border border-transparent hover:border-zinc-200 transition-all block"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-base">📊</span>
                          <h4 className="text-xs font-bold text-zinc-900 group-hover/item:text-zinc-800 transition-colors tracking-tight">
                            ANALYTICS
                          </h4>
                        </div>
                        <p className="text-[11px] font-semibold text-zinc-700 mb-1 leading-snug">
                          Track your complete placement preparation journey.
                        </p>
                        <p className="text-[11px] text-zinc-600 font-normal leading-relaxed">
                          Review JAM, STAR & Mock Interview history and progress.
                        </p>
                      </Link>
                    </div>

                    {/* Bottom Tagline */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 text-center">
                      <p className="text-xs font-medium text-zinc-500">
                        One platform. Four AI-powered ways to get placement-ready.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* How It Works Item with Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setHowItWorksDropdownOpen(!howItWorksDropdownOpen);
                    if (!howItWorksDropdownOpen) {
                      setFeaturesDropdownOpen(false);
                      setAboutDropdownOpen(false);
                    }
                  }}
                  className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer focus:outline-none"
                  aria-expanded={howItWorksDropdownOpen}
                >
                  <span>How It Works</span>
                </button>

                {/* How It Works Dropdown Panel */}
                {howItWorksDropdownOpen && (
                  <div className="absolute top-[calc(100%+24px)] right-[-100px] w-[760px] max-w-[94vw] bg-white border border-zinc-200/90 rounded-2xl shadow-2xl p-6 sm:p-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[82vh] overflow-y-auto">
                    <div className="space-y-6">
                      
                      {/* Title & Subtitle */}
                      <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-base sm:text-lg font-extrabold text-zinc-950 uppercase tracking-wider">
                          HOW IT WORKS
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-zinc-700 mt-1">
                          &ldquo;One platform. Three ways to practice. One place to track your progress.&rdquo;
                        </p>
                      </div>

                      {/* Step-by-Step Breakdown */}
                      <div className="space-y-4 text-xs sm:text-[13px] text-zinc-600 leading-relaxed">
                        
                        {/* Step 1 */}
                        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                            <h4 className="font-bold text-zinc-900 uppercase tracking-wide text-xs">STEP 1 — CONNECT YOUR AI</h4>
                          </div>
                          <p className="text-zinc-600 pl-7">
                            Connect your Google Gemini API key once during setup. The connection is shared across the platform, so you don&apos;t need to configure the API again when switching between JAM, STAR Coach, AI Mock Interview, or Analytics.
                          </p>
                        </div>

                        {/* Step 2 */}
                        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                            <h4 className="font-bold text-zinc-900 uppercase tracking-wide text-xs">STEP 2 — CHOOSE YOUR PRACTICE MODE</h4>
                          </div>
                          <p className="text-zinc-600 pl-7 mb-1.5">
                            Choose the type of interview practice you need:
                          </p>
                          <div className="pl-7 space-y-1.5 text-zinc-700 font-normal">
                            <div className="flex items-start gap-1.5">
                              <span className="text-blue-600 font-bold">•</span>
                              <div><strong className="text-zinc-900 text-blue-700">JAM Simulator</strong> — Practice speaking spontaneously for 60 seconds on AI-generated, predefined, or custom topics.</div>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold">•</span>
                              <div><strong className="text-zinc-900 text-amber-700">STAR Coach</strong> — Practice behavioral interview questions using the Situation, Task, Action, and Result framework.</div>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-purple-600 font-bold">•</span>
                              <div><strong className="text-zinc-900 text-purple-700">AI Mock Interview</strong> — Experience a realistic two-way voice interview with an AI interviewer, including follow-up questions.</div>
                            </div>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                            <h4 className="font-bold text-zinc-900 uppercase tracking-wide text-xs">STEP 3 — PRACTICE WITH AI</h4>
                          </div>
                          <p className="text-zinc-600 pl-7">
                            The selected module generates or presents an appropriate interview challenge. Speak naturally using your microphone and complete the practice session.
                          </p>
                        </div>

                        {/* Step 4 */}
                        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">4</span>
                            <h4 className="font-bold text-zinc-900 uppercase tracking-wide text-xs">STEP 4 — AI ANALYZES YOUR PERFORMANCE</h4>
                          </div>
                          <p className="text-zinc-600 pl-7">
                            Your response is processed using AI to evaluate relevant aspects of your performance, depending on the practice mode:
                          </p>
                          <div className="pl-7 space-y-1.5 text-xs text-zinc-700">
                            <div><strong className="text-blue-700">For JAM:</strong> Focus on clarity, relevance, confidence, structure, and speaking quality.</div>
                            <div><strong className="text-amber-700">For STAR Coach:</strong> Focus on Situation, Task, Action, Result, ownership, clarity, specificity, and measurable impact.</div>
                            <div><strong className="text-purple-700">For AI Mock Interview:</strong> Focus on communication, relevance, confidence, consistency, and overall interview performance.</div>
                          </div>
                        </div>

                        {/* Step 5 */}
                        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">5</span>
                            <h4 className="font-bold text-zinc-900 uppercase tracking-wide text-xs">STEP 5 — REVIEW YOUR RESULT</h4>
                          </div>
                          <p className="text-zinc-600 pl-7">
                            After completing a session, review your transcript, feedback, scores, strengths, and areas that need improvement.
                          </p>
                        </div>

                        {/* Step 6 */}
                        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">6</span>
                            <h4 className="font-bold text-zinc-900 uppercase tracking-wide text-xs">STEP 6 — TRACK YOUR PROGRESS</h4>
                          </div>
                          <p className="text-zinc-600 pl-7">
                            Analytics keeps a history of the practice sessions you actually complete. It does not assume that you have used every feature.
                          </p>
                          <p className="text-zinc-600 pl-7 text-[12px]">
                            Your analytics are based only on your available practice history. If you use only JAM, Analytics shows JAM-based progress. If you later use STAR Coach or AI Mock Interview, those sessions are added to your overall practice history.
                          </p>
                        </div>

                        {/* Step 7 */}
                        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">7</span>
                            <h4 className="font-bold text-zinc-900 uppercase tracking-wide text-xs">STEP 7 — IMPROVE &amp; PRACTICE AGAIN</h4>
                          </div>
                          <p className="text-zinc-600 pl-7">
                            Use your feedback and previous performance to identify weak areas, then return to the appropriate practice mode and improve through repeated practice.
                          </p>
                        </div>

                      </div>

                      {/* Simple Visual Flow */}
                      <div className="pt-4 border-t border-zinc-200 space-y-3">
                        <h4 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest text-center">
                          COMPLETE PLATFORM FLOW
                        </h4>
                        
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11px] font-bold">
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200/80">CONNECT AI</span>
                          <span className="text-zinc-400">→</span>
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80">CHOOSE MODE</span>
                          <span className="text-zinc-400">→</span>
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200/80">PRACTICE</span>
                          <span className="text-zinc-400">→</span>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80">AI FEEDBACK</span>
                          <span className="text-zinc-400">→</span>
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200/80">REVIEW RESULTS</span>
                          <span className="text-zinc-400">→</span>
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/80">TRACK PROGRESS</span>
                          <span className="text-zinc-400">→</span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">IMPROVE &amp; REPEAT</span>
                        </div>
                      </div>

                      {/* Footer Close */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setHowItWorksDropdownOpen(false)}
                          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors font-medium cursor-pointer"
                        >
                          Close
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Global API Connection Status */}
            {isMounted && (
              isConfigured ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-full shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs lg:text-sm font-semibold text-emerald-800">
                    ✓ Gemini Connected
                  </span>
                  <button
                    onClick={() => setShowSetupModal(true)}
                    className="text-xs text-emerald-700 hover:text-emerald-950 underline ml-1 cursor-pointer font-medium"
                    title="Change or update your Gemini API key"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="text-xs text-rose-600 hover:text-rose-800 ml-1 cursor-pointer font-medium"
                    title="Disconnect key"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="h-[44px] lg:h-[48px] px-6 inline-flex items-center justify-center text-[15px] lg:text-[17px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-200 shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  Connect API Key
                </button>
              )
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            {isMounted && isConfigured && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                ✓ Connected
              </span>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-800 hover:text-black focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 px-6 py-5 flex flex-col gap-4 shadow-lg absolute top-full left-0 w-full z-50">
            {/* Mobile About Us Collapsible Accordion */}
            <div className="border-b border-zinc-100 py-2">
              <button
                type="button"
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                className="w-full flex items-center justify-between text-lg font-medium text-zinc-900 hover:text-black focus:outline-none"
              >
                <span>About Us</span>
              </button>

              {mobileAboutOpen && (
                <div className="mt-3 space-y-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 animate-in fade-in duration-150">
                  <h4 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider">
                    ABOUT PLACEMENT INTELLIGENCE SUITE
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    &ldquo;An AI-powered placement preparation platform designed to help students practice, improve, and build interview confidence.&rdquo;
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    &ldquo;Practice with JAM Simulator, strengthen behavioral answers with STAR Coach, and experience realistic conversations with AI Mock Interview.&rdquo;
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    &ldquo;Analytics tracks your actual practice history and performance, helping you understand your strengths and what to improve next.&rdquo;
                  </p>
                  <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">
                      BY KETHAN & SREEKAR
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Features Collapsible Accordion */}
            <div className="border-b border-zinc-100 py-2">
              <button
                type="button"
                onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
                className="w-full flex items-center justify-between text-lg font-medium text-zinc-900 hover:text-black focus:outline-none"
              >
                <span>Features</span>
              </button>

              {mobileFeaturesOpen && (
                <div className="mt-3 space-y-3 pl-2 pr-1 animate-in fade-in duration-150">
                  {/* JAM */}
                  <Link
                    href="/jam"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-3 rounded-xl bg-blue-50/40 border border-blue-100/80"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>🎙</span>
                      <span className="text-sm font-bold text-zinc-900">JAM SIMULATOR</span>
                    </div>
                    <p className="text-xs font-semibold text-blue-600 mb-0.5">60-second AI-powered speaking practice.</p>
                    <p className="text-xs text-zinc-600">Speak, transcribe, and improve your communication.</p>
                  </Link>

                  {/* STAR */}
                  <Link
                    href="/behavioral"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-3 rounded-xl bg-amber-50/40 border border-amber-100/80"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>⭐</span>
                      <span className="text-sm font-bold text-zinc-900">STAR COACH</span>
                    </div>
                    <p className="text-xs font-semibold text-amber-600 mb-0.5">AI-guided behavioral interview preparation.</p>
                    <p className="text-xs text-zinc-600">Practice structured answers using the STAR method.</p>
                  </Link>

                  {/* Mock HR */}
                  <Link
                    href="/mock-hr"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-3 rounded-xl bg-purple-50/40 border border-purple-100/80"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>👤</span>
                      <span className="text-sm font-bold text-zinc-900">AI MOCK INTERVIEW</span>
                    </div>
                    <p className="text-xs font-semibold text-purple-600 mb-0.5">Real-time two-way AI interview simulation.</p>
                    <p className="text-xs text-zinc-600">Experience realistic interviews with instant feedback.</p>
                  </Link>

                  {/* Analytics */}
                  <Link
                    href="/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-3 rounded-xl bg-zinc-50 border border-zinc-200"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>📊</span>
                      <span className="text-sm font-bold text-zinc-900">ANALYTICS</span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-700 mb-0.5">Track your complete placement preparation journey.</p>
                    <p className="text-xs text-zinc-600">Review JAM, STAR & Mock Interview history and progress.</p>
                  </Link>

                  <p className="text-[11px] text-zinc-500 pt-1 text-center font-medium">
                    One platform. Four AI-powered ways to get placement-ready.
                  </p>
                </div>
              )}
            </div>

            {/* Mobile How It Works Collapsible Accordion */}
            <div className="border-b border-zinc-100 py-2">
              <button
                type="button"
                onClick={() => setMobileHowItWorksOpen(!mobileHowItWorksOpen)}
                className="w-full flex items-center justify-between text-lg font-medium text-zinc-900 hover:text-black focus:outline-none"
              >
                <span>How It Works</span>
              </button>

              {mobileHowItWorksOpen && (
                <div className="mt-3 space-y-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 animate-in fade-in duration-150 text-xs text-zinc-600 leading-relaxed">
                  <h4 className="font-extrabold text-zinc-950 uppercase tracking-wider">
                    HOW IT WORKS
                  </h4>
                  <p className="font-medium text-zinc-700">
                    &ldquo;One platform. Three ways to practice. One place to track your progress.&rdquo;
                  </p>
                  
                  <div className="space-y-2 pt-1">
                    <div>
                      <strong className="text-zinc-900 block">STEP 1 — CONNECT YOUR AI</strong>
                      Connect your Google Gemini API key once during setup. The connection is shared across all modules.
                    </div>

                    <div>
                      <strong className="text-zinc-900 block">STEP 2 — CHOOSE YOUR PRACTICE MODE</strong>
                      <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                        <li><strong className="text-blue-700">JAM Simulator:</strong> 60s spontaneous speaking practice.</li>
                        <li><strong className="text-amber-700">STAR Coach:</strong> Situation, Task, Action &amp; Result behavioral training.</li>
                        <li><strong className="text-purple-700">AI Mock Interview:</strong> Two-way interactive voice interview with follow-ups.</li>
                      </ul>
                    </div>

                    <div>
                      <strong className="text-zinc-900 block">STEP 3 — PRACTICE WITH AI</strong>
                      Speak naturally using your microphone and complete the practice drill.
                    </div>

                    <div>
                      <strong className="text-zinc-900 block">STEP 4 — AI ANALYZES YOUR PERFORMANCE</strong>
                      Evaluates fluency, structure, STAR ownership, or overall interview readiness.
                    </div>

                    <div>
                      <strong className="text-zinc-900 block">STEP 5 — REVIEW YOUR RESULT</strong>
                      Review transcripts, diagnostic scores, and actionable feedback.
                    </div>

                    <div>
                      <strong className="text-zinc-900 block">STEP 6 — TRACK YOUR PROGRESS</strong>
                      Analytics grows dynamically based only on completed sessions.
                    </div>

                    <div>
                      <strong className="text-zinc-900 block">STEP 7 — IMPROVE &amp; REPEAT</strong>
                      Identify weak areas and practice repeatedly to build confidence.
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Platform Flow</span>
                    <div className="text-[10px] font-bold text-zinc-700 flex flex-wrap justify-center gap-1">
                      <span>CONNECT</span> → <span>CHOOSE MODE</span> → <span>PRACTICE</span> → <span>AI FEEDBACK</span> → <span>TRACK</span> → <span>IMPROVE</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {isConfigured ? (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-emerald-800">✓ Gemini API Connected</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowSetupModal(true);
                  }}
                  className="text-sm font-bold text-blue-600 underline"
                >
                  Edit Key
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSetupModal(true);
                }}
                className="mt-2 h-[48px] inline-flex items-center justify-center text-lg font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors text-center"
              >
                Connect Gemini API Key
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main hero & options - compact vertical fit */}
      <main className="max-w-[1280px] w-full mx-auto flex-1 flex flex-col justify-between items-center px-4 sm:px-8 py-2 lg:py-3 min-h-0">
        {/* Dominant Hero Section: Compact Welcome */}
        <section className="text-center pt-0 pb-1 sm:pt-1 sm:pb-2 w-full shrink-0">
          <h1 className="text-[clamp(56px,7.5vw,108px)] font-black tracking-[-0.04em] text-black select-none leading-[0.95]">
            Welcome
          </h1>
        </section>

        {/* Feature Grid: Compact Balanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 lg:gap-14 w-full max-w-[1100px] mx-auto my-auto">
          {/* Card 1: JAM Simulator */}
          <Link href="/jam" className="group block focus:outline-none">
            <div className="flex flex-col items-center text-center cursor-pointer h-full justify-between">
              <div>
                {/* Blue Icon Block */}
                <div className="w-[100px] h-[100px] sm:w-[115px] sm:h-[115px] lg:w-[124px] lg:h-[124px] rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-[#226cfb] to-[#1252df] flex items-center justify-center shadow-md mx-auto transition-transform duration-200 group-hover:scale-[1.02]">
                  <svg className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] lg:w-[58px] lg:h-[58px] text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a3.5 3.5 0 0 0-3.5 3.5v6a3.5 3.5 0 0 0 7 0v-6A3.5 3.5 0 0 0 12 2z" />
                    <path d="M19 10.5a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.58A7 7 0 0 0 19 10.5z" />
                  </svg>
                </div>

                {/* Feature Name */}
                <h2 className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold text-black tracking-tight leading-[1.1] mt-3 sm:mt-4 mb-1">
                  JAM Simulator
                </h2>
                {/* Short Description */}
                <p className="text-zinc-700 text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.3] font-normal max-w-[240px] mx-auto">
                  60-second impromptu<br />speaking practice.
                </p>
              </div>

              <div className="flex flex-col items-center mt-1">
                {/* Accent Line */}
                <div className="w-[100px] h-[3px] bg-[#2563eb] rounded-full mt-2.5 sm:mt-3.5 mb-2 sm:mb-2.5" />
                {/* Practice Now */}
                <div className="inline-flex items-center gap-1.5 text-[15px] sm:text-[16px] lg:text-[17px] font-bold text-black group-hover:text-zinc-800 transition-colors duration-200">
                  <span>Practice Now</span>
                  <span className="inline-block text-[18px] lg:text-[20px] leading-none transform transition-transform duration-200 group-hover:translate-x-1.5">
                    →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: STAR Coach */}
          <Link href="/behavioral" className="group block focus:outline-none">
            <div className="flex flex-col items-center text-center cursor-pointer h-full justify-between">
              <div>
                {/* Orange Icon Block */}
                <div className="w-[100px] h-[100px] sm:w-[115px] sm:h-[115px] lg:w-[124px] lg:h-[124px] rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-[#fbbf24] to-[#f97316] flex items-center justify-center shadow-md mx-auto transition-transform duration-200 group-hover:scale-[1.02]">
                  <svg className="w-[50px] h-[50px] sm:w-[56px] sm:h-[56px] lg:w-[60px] lg:h-[60px] text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.5l2.9 6.2 6.8.9-5 4.7 1.3 6.7-6-3.3-6 3.3 1.3-6.7-5-4.7 6.8-.9L12 2.5z" />
                  </svg>
                </div>

                {/* Feature Name */}
                <h2 className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold text-black tracking-tight leading-[1.1] mt-3 sm:mt-4 mb-1">
                  STAR Coach
                </h2>
                {/* Short Description */}
                <p className="text-zinc-700 text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.3] font-normal max-w-[240px] mx-auto">
                  Behavioral framework<br />training.
                </p>
              </div>

              <div className="flex flex-col items-center mt-1">
                {/* Accent Line */}
                <div className="w-[100px] h-[3px] bg-[#f97316] rounded-full mt-2.5 sm:mt-3.5 mb-2 sm:mb-2.5" />
                {/* Practice Now */}
                <div className="inline-flex items-center gap-1.5 text-[15px] sm:text-[16px] lg:text-[17px] font-bold text-black group-hover:text-zinc-800 transition-colors duration-200">
                  <span>Practice Now</span>
                  <span className="inline-block text-[18px] lg:text-[20px] leading-none transform transition-transform duration-200 group-hover:translate-x-1.5">
                    →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3: Mock HR */}
          <Link href="/mock-hr" className="group block focus:outline-none">
            <div className="flex flex-col items-center text-center cursor-pointer h-full justify-between">
              <div>
                {/* Purple Icon Block */}
                <div className="w-[100px] h-[100px] sm:w-[115px] sm:h-[115px] lg:w-[124px] lg:h-[124px] rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-[#8b5cf6] to-[#6366f1] flex items-center justify-center shadow-md mx-auto transition-transform duration-200 group-hover:scale-[1.02]">
                  <svg className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] lg:w-[58px] lg:h-[58px] text-white" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="8" r="3.5" />
                    <path d="M2.5 19c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6v1h-13v-1z" />
                    <path d="M17.5 7.5a1 1 0 0 1 1.4-.2 7 7 0 0 1 0 9.4 1 1 0 0 1-1.4-1.4 5 5 0 0 0 0-6.6 1 1 0 0 1 0-1.2z" />
                    <path d="M20 5a1 1 0 0 1 1.4-.2 10.5 10.5 0 0 1 0 14.4 1 1 0 0 1-1.4-1.4 8.5 8.5 0 0 0 0-11.6 1 1 0 0 1 0-1.2z" />
                  </svg>
                </div>

                {/* Feature Name */}
                <h2 className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold text-black tracking-tight leading-[1.1] mt-3 sm:mt-4 mb-1">
                  AI Mock Interview
                </h2>
                {/* Short Description */}
                <p className="text-zinc-700 text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.3] font-normal max-w-[240px] mx-auto">
                  Two-way interactive<br />voice interviews.
                </p>
              </div>

              <div className="flex flex-col items-center mt-1">
                {/* Accent Line */}
                <div className="w-[100px] h-[3px] bg-[#8b5cf6] rounded-full mt-2.5 sm:mt-3.5 mb-2 sm:mb-2.5" />
                {/* Practice Now */}
                <div className="inline-flex items-center gap-1.5 text-[15px] sm:text-[16px] lg:text-[17px] font-bold text-black group-hover:text-zinc-800 transition-colors duration-200">
                  <span>Practice Now</span>
                  <span className="inline-block text-[18px] lg:text-[20px] leading-none transform transition-transform duration-200 group-hover:translate-x-1.5">
                    →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Main CTA Button: Compact & elevated */}
        <div className="mt-3 sm:mt-4 lg:mt-5 mb-2 sm:mb-3 flex justify-center z-10 relative shrink-0">
          <Link href="/jam" className="focus:outline-none">
            <button className="group relative w-[210px] sm:w-[240px] h-[52px] sm:h-[60px] inline-flex items-center justify-center text-[18px] sm:text-[21px] font-bold text-white bg-[#111318] rounded-full transition-all duration-200 ease-out hover:bg-black hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] shadow-md select-none cursor-pointer">
              <span className="flex items-center gap-2.5">
                Let&apos;s Go 
                <span className="inline-block text-[20px] sm:text-[24px] leading-none transform transition-transform duration-200 group-hover:translate-x-1.5">
                  →
                </span>
              </span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

