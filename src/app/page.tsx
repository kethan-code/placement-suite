'use client';

import React from 'react';
import Link from 'next/link';
import DepthText from '@/components/DepthText';
import BorderGlow from '@/components/BorderGlow';

export default function WelcomePage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 font-sans flex flex-col justify-between py-16 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600/10 via-amber-500/10 to-rose-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-6 w-full flex-1 flex flex-col items-center justify-center relative z-10 my-auto">
        {/* Animated 3D Header */}
        <div className="text-center flex flex-col items-center justify-center">
          <DepthText
            text="Welcome"
            faceColor="#ffffff"
            depthColor="#52525b"
            layers={20}
            fontSize="clamp(4rem, 10vw, 8rem)"
          />
          <p className="text-zinc-400 tracking-[0.2em] uppercase text-sm mt-4 font-semibold">
            Placement Intelligence Suite
          </p>
        </div>

        {/* Navigation Grid (The 3 Glowing Boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mx-auto mt-16 px-6">
          {/* Card 1: JAM Simulator */}
          <Link href="/jam" className="block h-full focus:outline-none">
            <BorderGlow
              glowColor="210 100% 60%"
              colors={['#38bdf8', '#818cf8', '#c084fc']}
            >
              <div className="p-10 flex flex-col items-center text-center rounded-[28px] h-full justify-center transition-all hover:bg-zinc-900/40">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-2xl mb-6 shadow-inner">
                  🎙️
                </div>
                <h2 className="text-white font-bold text-2xl mb-3 tracking-tight">
                  JAM Simulator
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  60-second impromptu speech practice.
                </p>
              </div>
            </BorderGlow>
          </Link>

          {/* Card 2: STAR Coach */}
          <Link href="/behavioral" className="block h-full focus:outline-none">
            <BorderGlow
              glowColor="30 100% 60%"
              colors={['#fbbf24', '#f59e0b', '#d97706']}
            >
              <div className="p-10 flex flex-col items-center text-center rounded-[28px] h-full justify-center transition-all hover:bg-zinc-900/40">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-6 shadow-inner">
                  ⭐
                </div>
                <h2 className="text-white font-bold text-2xl mb-3 tracking-tight">
                  STAR Coach
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Behavioral framework training.
                </p>
              </div>
            </BorderGlow>
          </Link>

          {/* Card 3: Mock HR */}
          <Link href="/mock-hr" className="block h-full focus:outline-none">
            <BorderGlow
              glowColor="340 100% 60%"
              colors={['#fb7185', '#e11d48', '#be123c']}
            >
              <div className="p-10 flex flex-col items-center text-center rounded-[28px] h-full justify-center transition-all hover:bg-zinc-900/40">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mb-6 shadow-inner">
                  👔
                </div>
                <h2 className="text-white font-bold text-2xl mb-3 tracking-tight">
                  Mock HR
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Two-way interactive voice interviews.
                </p>
              </div>
            </BorderGlow>
          </Link>
        </div>

        {/* Primary CTA Button */}
        <div className="mt-16 mb-12 flex justify-center z-10 relative">
          <Link href="/jam">
            <button className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-extrabold text-black bg-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] cursor-pointer">
              <span className="relative z-10 flex items-center gap-2">
                Let's Go 
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-20">
        <p className="text-zinc-600 text-xs tracking-widest lowercase">
          kethan sunkara
        </p>
      </footer>
    </div>
  );
}
