'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function WelcomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen text-zinc-900 font-sans flex flex-col justify-between relative overflow-x-hidden select-none">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-zinc-200/60 sticky top-0 z-50 h-[80px] lg:h-[96px] flex items-center shrink-0">
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

          {/* Right: Navigation Links & Sign In */}
          <div className="hidden md:flex items-center gap-[40px] lg:gap-[50px]">
            <nav className="flex items-center gap-[35px] lg:gap-[45px] text-[17px] lg:text-[19px] font-medium text-zinc-900">
              <a href="#about" className="hover:text-black transition-colors">About Us</a>
              <a href="#features" className="hover:text-black transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a>
            </nav>

            <a
              href="#signin"
              className="w-[120px] lg:w-[128px] h-[46px] lg:h-[50px] inline-flex items-center justify-center text-[17px] lg:text-[19px] font-medium text-zinc-950 border-[2px] border-zinc-950 rounded-full hover:bg-zinc-100 transition-colors focus:outline-none shrink-0"
            >
              Sign In
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center p-2 text-zinc-800 hover:text-black focus:outline-none"
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

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 px-6 py-5 flex flex-col gap-4 shadow-lg absolute top-full left-0 w-full z-50">
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-lg font-medium text-zinc-900 hover:text-black py-2 border-b border-zinc-100"
            >
              About Us
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-lg font-medium text-zinc-900 hover:text-black py-2 border-b border-zinc-100"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-lg font-medium text-zinc-900 hover:text-black py-2 border-b border-zinc-100"
            >
              How It Works
            </a>
            <a 
              href="#signin" 
              onClick={() => setMobileMenuOpen(false)} 
              className="mt-2 h-[48px] inline-flex items-center justify-center text-lg font-medium text-zinc-950 border-[2px] border-zinc-950 rounded-full hover:bg-zinc-100 transition-colors text-center"
            >
              Sign In
            </a>
          </div>
        )}
      </header>

      {/* Main hero & options - compact vertical fit */}
      <main className="max-w-[1340px] w-full mx-auto flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-2 sm:py-4">
        {/* Dominant Hero Section: Large Welcome */}
        <section className="text-center pt-1 pb-3 sm:pt-2 sm:pb-4 lg:pt-3 lg:pb-5 w-full">
          <h1 className="text-[clamp(85px,11.5vw,175px)] font-black tracking-[-0.04em] text-black select-none leading-[0.9]">
            Welcome
          </h1>
        </section>

        {/* Feature Grid: 150-160px Icon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-[40px] lg:gap-[75px] w-full max-w-[1220px] mx-auto">
          {/* Card 1: JAM Simulator */}
          <Link href="/jam" className="group block focus:outline-none">
            <div className="flex flex-col items-center text-center cursor-pointer h-full justify-between">
              <div>
                {/* Blue Icon Block (~150-160px, rounded-[32px]) */}
                <div className="w-[135px] h-[135px] sm:w-[150px] sm:h-[150px] lg:w-[155px] lg:h-[155px] rounded-[28px] sm:rounded-[32px] lg:rounded-[34px] bg-gradient-to-b from-[#226cfb] to-[#1252df] flex items-center justify-center shadow-md mx-auto transition-transform duration-200 group-hover:scale-[1.02]">
                  <svg className="w-[62px] h-[62px] sm:w-[68px] sm:h-[68px] lg:w-[70px] lg:h-[70px] text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a3.5 3.5 0 0 0-3.5 3.5v6a3.5 3.5 0 0 0 7 0v-6A3.5 3.5 0 0 0 12 2z" />
                    <path d="M19 10.5a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.58A7 7 0 0 0 19 10.5z" />
                  </svg>
                </div>

                {/* Feature Name (32-36px) */}
                <h2 className="text-[28px] sm:text-[32px] lg:text-[34px] font-bold text-black tracking-tight leading-[1.1] mt-[18px] sm:mt-[22px] mb-[6px] sm:mb-[8px]">
                  JAM Simulator
                </h2>
                {/* Short Description (20-22px) */}
                <p className="text-zinc-700 text-[17px] sm:text-[19px] lg:text-[21px] leading-[1.35] font-normal max-w-[270px] mx-auto">
                  60-second impromptu<br />speaking practice.
                </p>
              </div>

              <div className="flex flex-col items-center mt-2">
                {/* Accent Line: 130px width, 3px height */}
                <div className="w-[130px] h-[3px] bg-[#2563eb] rounded-full mt-[16px] sm:mt-[20px] mb-[14px] sm:mb-[18px]" />
                {/* Practice Now: 20-22px font size */}
                <div className="inline-flex items-center gap-1.5 text-[18px] sm:text-[20px] lg:text-[21px] font-bold text-black group-hover:text-zinc-800 transition-colors duration-200">
                  <span>Practice Now</span>
                  <span className="inline-block text-[22px] lg:text-[24px] leading-none transform transition-transform duration-200 group-hover:translate-x-1.5">
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
                {/* Orange Icon Block (~150-160px, rounded-[32px]) */}
                <div className="w-[135px] h-[135px] sm:w-[150px] sm:h-[150px] lg:w-[155px] lg:h-[155px] rounded-[28px] sm:rounded-[32px] lg:rounded-[34px] bg-gradient-to-b from-[#fbbf24] to-[#f97316] flex items-center justify-center shadow-md mx-auto transition-transform duration-200 group-hover:scale-[1.02]">
                  <svg className="w-[66px] h-[66px] sm:w-[72px] sm:h-[72px] lg:w-[74px] lg:h-[74px] text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.5l2.9 6.2 6.8.9-5 4.7 1.3 6.7-6-3.3-6 3.3 1.3-6.7-5-4.7 6.8-.9L12 2.5z" />
                  </svg>
                </div>

                {/* Feature Name (32-36px) */}
                <h2 className="text-[28px] sm:text-[32px] lg:text-[34px] font-bold text-black tracking-tight leading-[1.1] mt-[18px] sm:mt-[22px] mb-[6px] sm:mb-[8px]">
                  STAR Coach
                </h2>
                {/* Short Description (20-22px) */}
                <p className="text-zinc-700 text-[17px] sm:text-[19px] lg:text-[21px] leading-[1.35] font-normal max-w-[270px] mx-auto">
                  Behavioral framework<br />training.
                </p>
              </div>

              <div className="flex flex-col items-center mt-2">
                {/* Accent Line: 130px width, 3px height */}
                <div className="w-[130px] h-[3px] bg-[#f97316] rounded-full mt-[16px] sm:mt-[20px] mb-[14px] sm:mb-[18px]" />
                {/* Practice Now: 20-22px font size */}
                <div className="inline-flex items-center gap-1.5 text-[18px] sm:text-[20px] lg:text-[21px] font-bold text-black group-hover:text-zinc-800 transition-colors duration-200">
                  <span>Practice Now</span>
                  <span className="inline-block text-[22px] lg:text-[24px] leading-none transform transition-transform duration-200 group-hover:translate-x-1.5">
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
                {/* Purple Icon Block (~150-160px, rounded-[32px]) */}
                <div className="w-[135px] h-[135px] sm:w-[150px] sm:h-[150px] lg:w-[155px] lg:h-[155px] rounded-[28px] sm:rounded-[32px] lg:rounded-[34px] bg-gradient-to-b from-[#8b5cf6] to-[#6366f1] flex items-center justify-center shadow-md mx-auto transition-transform duration-200 group-hover:scale-[1.02]">
                  <svg className="w-[64px] h-[64px] sm:w-[70px] sm:h-[70px] lg:w-[72px] lg:h-[72px] text-white" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="8" r="3.5" />
                    <path d="M2.5 19c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6v1h-13v-1z" />
                    <path d="M17.5 7.5a1 1 0 0 1 1.4-.2 7 7 0 0 1 0 9.4 1 1 0 0 1-1.4-1.4 5 5 0 0 0 0-6.6 1 1 0 0 1 0-1.2z" />
                    <path d="M20 5a1 1 0 0 1 1.4-.2 10.5 10.5 0 0 1 0 14.4 1 1 0 0 1-1.4-1.4 8.5 8.5 0 0 0 0-11.6 1 1 0 0 1 0-1.2z" />
                  </svg>
                </div>

                {/* Feature Name (32-36px) */}
                <h2 className="text-[28px] sm:text-[32px] lg:text-[34px] font-bold text-black tracking-tight leading-[1.1] mt-[18px] sm:mt-[22px] mb-[6px] sm:mb-[8px]">
                  Mock HR
                </h2>
                {/* Short Description (20-22px) */}
                <p className="text-zinc-700 text-[17px] sm:text-[19px] lg:text-[21px] leading-[1.35] font-normal max-w-[270px] mx-auto">
                  Two-way interactive<br />voice interviews.
                </p>
              </div>

              <div className="flex flex-col items-center mt-2">
                {/* Accent Line: 130px width, 3px height */}
                <div className="w-[130px] h-[3px] bg-[#8b5cf6] rounded-full mt-[16px] sm:mt-[20px] mb-[14px] sm:mb-[18px]" />
                {/* Practice Now: 20-22px font size */}
                <div className="inline-flex items-center gap-1.5 text-[18px] sm:text-[20px] lg:text-[21px] font-bold text-black group-hover:text-zinc-800 transition-colors duration-200">
                  <span>Practice Now</span>
                  <span className="inline-block text-[22px] lg:text-[24px] leading-none transform transition-transform duration-200 group-hover:translate-x-1.5">
                    →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Main CTA Button: ~280px width, ~75px height, 25px text */}
        <div className="mt-6 sm:mt-8 lg:mt-9 mb-2 sm:mb-3 flex justify-center z-10 relative">
          <Link href="/jam" className="focus:outline-none">
            <button className="group relative w-[240px] sm:w-[275px] h-[64px] sm:h-[74px] inline-flex items-center justify-center text-[22px] sm:text-[25px] font-bold text-white bg-[#111318] rounded-full transition-all duration-200 ease-out hover:bg-black hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] shadow-md select-none cursor-pointer">
              <span className="flex items-center gap-3">
                Let&apos;s Go 
                <span className="inline-block text-[24px] sm:text-[28px] leading-none transform transition-transform duration-200 group-hover:translate-x-1.5">
                  →
                </span>
              </span>
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1340px] mx-auto py-2 sm:py-3 flex justify-center mt-auto shrink-0">
        <p className="text-zinc-500 text-[10px] sm:text-[11.5px] tracking-[0.2em] uppercase font-bold">
          BY KETHAN SUNKARA © 2026
        </p>
      </footer>
    </div>
  );
}
