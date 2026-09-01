'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen text-zinc-900 font-sans flex flex-col justify-between overflow-x-hidden selection:bg-zinc-200">
      {/* 1. NAVBAR (Height ~108px, Max-width ~1340px) */}
      <header className="w-full max-w-[1340px] mx-auto px-6 sm:px-10 h-[84px] sm:h-[96px] md:h-[108px] flex items-center justify-between shrink-0">
        {/* Brand Logo (Width ~280px) */}
        <Link href="/" className="flex items-center gap-3 w-[220px] sm:w-[280px] group focus:outline-none shrink-0">
          <div className="grid grid-cols-2 gap-1 w-7 h-7 sm:w-8 sm:h-8 shrink-0">
            <span className="bg-zinc-950 rounded-tl-[6px] sm:rounded-tl-[7px] rounded-br-[2px]" />
            <span className="bg-zinc-950 rounded-tr-[6px] sm:rounded-tr-[7px] rounded-bl-[2px]" />
            <span className="bg-zinc-950 rounded-bl-[6px] sm:rounded-bl-[7px] rounded-tr-[2px]" />
            <span className="bg-zinc-950 rounded-br-[6px] sm:rounded-br-[7px] rounded-tl-[2px]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[17px] sm:text-[20px] tracking-tight text-zinc-950 leading-none">
              PLACEMENT
            </span>
            <span className="text-[9px] sm:text-[11px] font-semibold tracking-[0.24em] text-zinc-600 leading-none uppercase mt-0.5">
              Intelligence Suite
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Text ~20px, Gap 50-60px) */}
        <nav className="hidden md:flex items-center gap-[40px] lg:gap-[55px]">
          <a
            href="#about"
            className="text-[17px] lg:text-[19px] font-medium text-zinc-800 hover:text-black transition-colors"
          >
            About Us
          </a>
          <a
            href="#features"
            className="text-[17px] lg:text-[19px] font-medium text-zinc-800 hover:text-black transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-[17px] lg:text-[19px] font-medium text-zinc-800 hover:text-black transition-colors"
          >
            How It Works
          </a>
        </nav>

        {/* Right Action: Sign In Button (~135px x 56px, Text ~19-20px) */}
        <div>
          <Link
            href="/jam"
            className="inline-flex items-center justify-center w-[110px] h-[44px] sm:w-[130px] sm:h-[54px] rounded-full border-[1.8px] border-zinc-950 bg-white text-zinc-950 text-[16px] sm:text-[19px] font-medium hover:bg-zinc-50 transition-all duration-200 shrink-0"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content Area (Vertically balanced to fit in ONE desktop screen) */}
      <main className="flex-1 flex flex-col items-center justify-between w-full max-w-[1340px] mx-auto px-6 py-2 sm:py-3">
        {/* 2. WELCOME (Dominant ~170-190px at 1536px viewport, compact vertical spacing) */}
        <section className="w-full text-center mt-[15px] sm:mt-[22px] md:mt-[26px] mb-[18px] sm:mb-[24px] md:mb-[28px] shrink-0">
          <h1
            style={{ fontSize: 'clamp(75px, 11.5vw, 175px)' }}
            className="font-extrabold text-black tracking-[-0.04em] leading-[0.92] select-none break-normal"
          >
            Welcome
          </h1>
        </section>

        {/* 3. THREE FEATURE COLUMNS (150-160px Icons, 32-36px Titles, 20-22px Descriptions) */}
        <div
          id="features"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-[45px] lg:gap-[65px] xl:gap-[85px] w-full max-w-[1240px] mx-auto items-start shrink-0"
        >
          {/* Feature 1: JAM Simulator */}
          <Link
            href="/jam"
            className="group flex flex-col items-center text-center w-full focus:outline-none"
          >
            {/* Blue Icon Block (150-160px, rounded-[32-35px]) */}
            <div className="w-[130px] h-[130px] sm:w-[148px] sm:h-[148px] lg:w-[155px] lg:h-[155px] rounded-[30px] sm:rounded-[34px] bg-gradient-to-b from-[#2b7fff] via-[#1d6eed] to-[#1259db] shadow-[0_10px_24px_rgba(29,110,237,0.25)] flex items-center justify-center text-white mb-[16px] sm:mb-[20px] group-hover:scale-105 group-hover:shadow-[0_14px_30px_rgba(29,110,237,0.35)] transition-all duration-300">
              <svg
                className="w-[66px] h-[66px] sm:w-[74px] sm:h-[74px] lg:w-[78px] lg:h-[78px] text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" stroke="none" />
                <path d="M5 10v1.5a7 7 0 0 0 14 0V10" strokeWidth="2.2" />
                <line x1="12" y1="18.5" x2="12" y2="21.5" strokeWidth="2.2" />
                <circle cx="12" cy="21.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </div>

            {/* Feature Title (32-36px) */}
            <h2 className="text-[26px] sm:text-[30px] lg:text-[34px] xl:text-[35px] font-bold text-zinc-950 leading-[1.1] mb-[8px] sm:mb-[10px] tracking-[-0.02em] group-hover:text-black transition-colors">
              JAM Simulator
            </h2>

            {/* Description (20-22px, Line-height ~1.38, Max-width ~270px) */}
            <p className="text-[16px] sm:text-[18px] lg:text-[20px] xl:text-[21px] text-zinc-600 font-normal leading-[1.38] max-w-[270px] mx-auto min-h-[auto] md:min-h-[58px]">
              60-second impromptu
              <br />
              speaking practice.
            </p>

            {/* Accent Line (Width ~120-140px, Height ~2.5px, Blue) */}
            <div className="w-[115px] sm:w-[130px] lg:w-[135px] h-[2.5px] bg-[#2563eb] rounded-full mt-[16px] sm:mt-[20px] mb-[16px] sm:mb-[20px] group-hover:w-[155px] transition-all duration-300" />

            {/* Practice Now (20-22px, Arrow ~22-24px) */}
            <span className="inline-flex items-center gap-2.5 text-[17px] sm:text-[19px] lg:text-[21px] font-semibold text-zinc-900 group-hover:text-black tracking-tight transition-colors duration-200 cursor-pointer">
              <span>Practice Now</span>
              <svg
                className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] transition-transform duration-200 ease-out group-hover:translate-x-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.4"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </Link>

          {/* Feature 2: STAR Coach */}
          <Link
            href="/behavioral"
            className="group flex flex-col items-center text-center w-full focus:outline-none"
          >
            {/* Orange Icon Block (150-160px, rounded-[32-35px]) */}
            <div className="w-[130px] h-[130px] sm:w-[148px] sm:h-[148px] lg:w-[155px] lg:h-[155px] rounded-[30px] sm:rounded-[34px] bg-gradient-to-b from-[#ff911a] via-[#f76a00] to-[#e65200] shadow-[0_10px_24px_rgba(247,106,0,0.25)] flex items-center justify-center text-white mb-[16px] sm:mb-[20px] group-hover:scale-105 group-hover:shadow-[0_14px_30px_rgba(247,106,0,0.35)] transition-all duration-300">
              <svg
                className="w-[66px] h-[66px] sm:w-[74px] sm:h-[74px] lg:w-[78px] lg:h-[78px] text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.3l-5.8 3.2 1.1-6.5-4.8-4.6 6.6-.9L12 2.5z" />
              </svg>
            </div>

            {/* Feature Title (32-36px) */}
            <h2 className="text-[26px] sm:text-[30px] lg:text-[34px] xl:text-[35px] font-bold text-zinc-950 leading-[1.1] mb-[8px] sm:mb-[10px] tracking-[-0.02em] group-hover:text-black transition-colors">
              STAR Coach
            </h2>

            {/* Description (20-22px, Line-height ~1.38, Max-width ~270px) */}
            <p className="text-[16px] sm:text-[18px] lg:text-[20px] xl:text-[21px] text-zinc-600 font-normal leading-[1.38] max-w-[270px] mx-auto min-h-[auto] md:min-h-[58px]">
              Behavioral framework
              <br />
              training.
            </p>

            {/* Accent Line (Width ~120-140px, Height ~2.5px, Orange) */}
            <div className="w-[115px] sm:w-[130px] lg:w-[135px] h-[2.5px] bg-[#f97316] rounded-full mt-[16px] sm:mt-[20px] mb-[16px] sm:mb-[20px] group-hover:w-[155px] transition-all duration-300" />

            {/* Practice Now (20-22px, Arrow ~22-24px) */}
            <span className="inline-flex items-center gap-2.5 text-[17px] sm:text-[19px] lg:text-[21px] font-semibold text-zinc-900 group-hover:text-black tracking-tight transition-colors duration-200 cursor-pointer">
              <span>Practice Now</span>
              <svg
                className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] transition-transform duration-200 ease-out group-hover:translate-x-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.4"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </Link>

          {/* Feature 3: Mock HR */}
          <Link
            href="/mock-hr"
            className="group flex flex-col items-center text-center w-full focus:outline-none"
          >
            {/* Purple Icon Block (150-160px, rounded-[32-35px]) */}
            <div className="w-[130px] h-[130px] sm:w-[148px] sm:h-[148px] lg:w-[155px] lg:h-[155px] rounded-[30px] sm:rounded-[34px] bg-gradient-to-b from-[#9f3eff] via-[#851deb] to-[#6c0ddb] shadow-[0_10px_24px_rgba(133,29,235,0.25)] flex items-center justify-center text-white mb-[16px] sm:mb-[20px] group-hover:scale-105 group-hover:shadow-[0_14px_30px_rgba(133,29,235,0.35)] transition-all duration-300">
              <svg
                className="w-[66px] h-[66px] sm:w-[74px] sm:h-[74px] lg:w-[78px] lg:h-[78px] text-white fill-current"
                viewBox="0 0 24 24"
              >
                <circle cx="8" cy="8" r="4.2" />
                <path d="M1.5 20.5c0-3.8 3.2-6.5 6.5-6.5s6.5 2.7 6.5 6.5H1.5z" />
                <path
                  d="M17.5 7.5a6.5 6.5 0 0 1 0 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M20.8 5a10.5 10.5 0 0 1 0 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Feature Title (32-36px) */}
            <h2 className="text-[26px] sm:text-[30px] lg:text-[34px] xl:text-[35px] font-bold text-zinc-950 leading-[1.1] mb-[8px] sm:mb-[10px] tracking-[-0.02em] group-hover:text-black transition-colors">
              Mock HR
            </h2>

            {/* Description (20-22px, Line-height ~1.38, Max-width ~270px) */}
            <p className="text-[16px] sm:text-[18px] lg:text-[20px] xl:text-[21px] text-zinc-600 font-normal leading-[1.38] max-w-[270px] mx-auto min-h-[auto] md:min-h-[58px]">
              Two-way interactive
              <br />
              voice interviews.
            </p>

            {/* Accent Line (Width ~120-140px, Height ~2.5px, Purple) */}
            <div className="w-[115px] sm:w-[130px] lg:w-[135px] h-[2.5px] bg-[#9333ea] rounded-full mt-[16px] sm:mt-[20px] mb-[16px] sm:mb-[20px] group-hover:w-[155px] transition-all duration-300" />

            {/* Practice Now (20-22px, Arrow ~22-24px) */}
            <span className="inline-flex items-center gap-2.5 text-[17px] sm:text-[19px] lg:text-[21px] font-semibold text-zinc-900 group-hover:text-black tracking-tight transition-colors duration-200 cursor-pointer">
              <span>Practice Now</span>
              <svg
                className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] transition-transform duration-200 ease-out group-hover:translate-x-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.4"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </Link>
        </div>

        {/* 4. LET'S GO CTA (~280-295px x 74-78px, positioned cleanly below features) */}
        <div className="mt-[28px] sm:mt-[36px] md:mt-[40px] mb-[20px] sm:mb-[28px] flex justify-center w-full shrink-0">
          <Link
            href="/jam"
            className="w-[240px] h-[64px] sm:w-[275px] sm:h-[72px] md:w-[290px] md:h-[76px] rounded-full bg-[#111318] hover:bg-black text-white text-[22px] sm:text-[25px] md:text-[26px] font-bold tracking-tight inline-flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer select-none"
          >
            <span>Let's Go</span>
            <svg
              className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] transition-transform duration-200 ease-out group-hover:translate-x-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
