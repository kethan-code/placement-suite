'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden text-zinc-900 font-sans flex flex-col justify-between overflow-x-hidden selection:bg-zinc-200">
      {/* 1. NAVBAR (Height ~80-100px on desktop) */}
      <header className="w-full max-w-[1340px] mx-auto px-6 sm:px-10 h-[75px] md:h-[88px] xl:h-[96px] flex items-center justify-between shrink-0">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 w-[200px] sm:w-[260px] xl:w-[280px] group focus:outline-none shrink-0">
          <div className="grid grid-cols-2 gap-1 w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 shrink-0">
            <span className="bg-zinc-950 rounded-tl-[5px] sm:rounded-tl-[7px] rounded-br-[2px]" />
            <span className="bg-zinc-950 rounded-tr-[5px] sm:rounded-tr-[7px] rounded-bl-[2px]" />
            <span className="bg-zinc-950 rounded-bl-[5px] sm:rounded-bl-[7px] rounded-tr-[2px]" />
            <span className="bg-zinc-950 rounded-br-[5px] sm:rounded-br-[7px] rounded-tl-[2px]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[15px] sm:text-[18px] xl:text-[20px] tracking-tight text-zinc-950 leading-none">
              PLACEMENT
            </span>
            <span className="text-[8px] sm:text-[10px] xl:text-[11px] font-semibold tracking-[0.24em] text-zinc-600 leading-none uppercase mt-0.5">
              Intelligence Suite
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-[35px] lg:gap-[45px] xl:gap-[55px]">
          <a
            href="#about"
            className="text-[16px] lg:text-[18px] xl:text-[19px] font-medium text-zinc-800 hover:text-black transition-colors"
          >
            About Us
          </a>
          <a
            href="#features"
            className="text-[16px] lg:text-[18px] xl:text-[19px] font-medium text-zinc-800 hover:text-black transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-[16px] lg:text-[18px] xl:text-[19px] font-medium text-zinc-800 hover:text-black transition-colors"
          >
            How It Works
          </a>
        </nav>

        {/* Right Action: Sign In Button */}
        <div>
          <Link
            href="/jam"
            className="inline-flex items-center justify-center w-[100px] h-[40px] sm:w-[120px] sm:h-[48px] xl:w-[130px] xl:h-[52px] rounded-full border-[1.8px] border-zinc-950 bg-white text-zinc-950 text-[15px] sm:text-[17px] xl:text-[19px] font-medium hover:bg-zinc-50 transition-all duration-200 shrink-0"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content Area: Flex distributed to perfectly fit in 100vh on desktop */}
      <main className="flex-1 flex flex-col items-center justify-between w-full max-w-[1340px] mx-auto px-6 py-1 sm:py-2 xl:py-3 min-h-0">
        {/* 2. WELCOME (Large & Dominant, tight vertical footprint) */}
        <section className="w-full text-center my-auto py-1 sm:py-2 shrink-0">
          <h1
            style={{ fontSize: 'clamp(65px, 10.5vw, 170px)' }}
            className="font-extrabold text-black tracking-[-0.04em] leading-[0.9] select-none break-normal"
          >
            Welcome
          </h1>
        </section>

        {/* 3. THREE FEATURE COLUMNS (145x145px Icons, 32-36px Titles, 19-21px Descriptions) */}
        <div
          id="features"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-[35px] lg:gap-[50px] xl:gap-[70px] w-full max-w-[1240px] mx-auto items-start my-auto shrink-0"
        >
          {/* Feature 1: JAM Simulator */}
          <Link
            href="/jam"
            className="group flex flex-col items-center text-center w-full focus:outline-none"
          >
            {/* Blue Icon Block (~145px x 145px, rounded-[30px]) */}
            <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] lg:w-[140px] lg:h-[140px] xl:w-[148px] xl:h-[148px] rounded-[24px] sm:rounded-[28px] lg:rounded-[30px] bg-gradient-to-b from-[#2b7fff] via-[#1d6eed] to-[#1259db] shadow-[0_8px_20px_rgba(29,110,237,0.25)] flex items-center justify-center text-white mb-[10px] sm:mb-[14px] xl:mb-[16px] group-hover:scale-105 group-hover:shadow-[0_12px_26px_rgba(29,110,237,0.35)] transition-all duration-300">
              <svg
                className="w-[56px] h-[56px] sm:w-[66px] sm:h-[66px] lg:w-[72px] lg:h-[72px] text-white"
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
            <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] xl:text-[34px] font-bold text-zinc-950 leading-[1.1] mb-[4px] sm:mb-[8px] tracking-[-0.02em] group-hover:text-black transition-colors">
              JAM Simulator
            </h2>

            {/* Description (19-21px, Line-height ~1.35) */}
            <p className="text-[14px] sm:text-[16px] lg:text-[18px] xl:text-[20px] text-zinc-600 font-normal leading-[1.35] max-w-[260px] mx-auto min-h-[auto] md:min-h-[48px] xl:min-h-[54px]">
              60-second impromptu
              <br />
              speaking practice.
            </p>

            {/* Accent Line (~120-140px, Blue) */}
            <div className="w-[100px] sm:w-[120px] lg:w-[135px] h-[2.5px] bg-[#2563eb] rounded-full mt-[10px] sm:mt-[14px] mb-[10px] sm:mb-[14px] group-hover:w-[150px] transition-all duration-300" />

            {/* Practice Now (20-21px) */}
            <span className="inline-flex items-center gap-2 text-[15px] sm:text-[17px] lg:text-[19px] xl:text-[20px] font-semibold text-zinc-900 group-hover:text-black tracking-tight transition-colors duration-200 cursor-pointer">
              <span>Practice Now</span>
              <svg
                className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-transform duration-200 ease-out group-hover:translate-x-1.5"
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
            {/* Orange Icon Block (~145px x 145px, rounded-[30px]) */}
            <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] lg:w-[140px] lg:h-[140px] xl:w-[148px] xl:h-[148px] rounded-[24px] sm:rounded-[28px] lg:rounded-[30px] bg-gradient-to-b from-[#ff911a] via-[#f76a00] to-[#e65200] shadow-[0_8px_20px_rgba(247,106,0,0.25)] flex items-center justify-center text-white mb-[10px] sm:mb-[14px] xl:mb-[16px] group-hover:scale-105 group-hover:shadow-[0_12px_26px_rgba(247,106,0,0.35)] transition-all duration-300">
              <svg
                className="w-[56px] h-[56px] sm:w-[66px] sm:h-[66px] lg:w-[72px] lg:h-[72px] text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.3l-5.8 3.2 1.1-6.5-4.8-4.6 6.6-.9L12 2.5z" />
              </svg>
            </div>

            {/* Feature Title (32-36px) */}
            <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] xl:text-[34px] font-bold text-zinc-950 leading-[1.1] mb-[4px] sm:mb-[8px] tracking-[-0.02em] group-hover:text-black transition-colors">
              STAR Coach
            </h2>

            {/* Description (19-21px, Line-height ~1.35) */}
            <p className="text-[14px] sm:text-[16px] lg:text-[18px] xl:text-[20px] text-zinc-600 font-normal leading-[1.35] max-w-[260px] mx-auto min-h-[auto] md:min-h-[48px] xl:min-h-[54px]">
              Behavioral framework
              <br />
              training.
            </p>

            {/* Accent Line (~120-140px, Orange) */}
            <div className="w-[100px] sm:w-[120px] lg:w-[135px] h-[2.5px] bg-[#f97316] rounded-full mt-[10px] sm:mt-[14px] mb-[10px] sm:mb-[14px] group-hover:w-[150px] transition-all duration-300" />

            {/* Practice Now (20-21px) */}
            <span className="inline-flex items-center gap-2 text-[15px] sm:text-[17px] lg:text-[19px] xl:text-[20px] font-semibold text-zinc-900 group-hover:text-black tracking-tight transition-colors duration-200 cursor-pointer">
              <span>Practice Now</span>
              <svg
                className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-transform duration-200 ease-out group-hover:translate-x-1.5"
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
            {/* Purple Icon Block (~145px x 145px, rounded-[30px]) */}
            <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] lg:w-[140px] lg:h-[140px] xl:w-[148px] xl:h-[148px] rounded-[24px] sm:rounded-[28px] lg:rounded-[30px] bg-gradient-to-b from-[#9f3eff] via-[#851deb] to-[#6c0ddb] shadow-[0_8px_20px_rgba(133,29,235,0.25)] flex items-center justify-center text-white mb-[10px] sm:mb-[14px] xl:mb-[16px] group-hover:scale-105 group-hover:shadow-[0_12px_26px_rgba(133,29,235,0.35)] transition-all duration-300">
              <svg
                className="w-[56px] h-[56px] sm:w-[66px] sm:h-[66px] lg:w-[72px] lg:h-[72px] text-white fill-current"
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
            <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] xl:text-[34px] font-bold text-zinc-950 leading-[1.1] mb-[4px] sm:mb-[8px] tracking-[-0.02em] group-hover:text-black transition-colors">
              Mock HR
            </h2>

            {/* Description (19-21px, Line-height ~1.35) */}
            <p className="text-[14px] sm:text-[16px] lg:text-[18px] xl:text-[20px] text-zinc-600 font-normal leading-[1.35] max-w-[260px] mx-auto min-h-[auto] md:min-h-[48px] xl:min-h-[54px]">
              Two-way interactive
              <br />
              voice interviews.
            </p>

            {/* Accent Line (~120-140px, Purple) */}
            <div className="w-[100px] sm:w-[120px] lg:w-[135px] h-[2.5px] bg-[#9333ea] rounded-full mt-[10px] sm:mt-[14px] mb-[10px] sm:mb-[14px] group-hover:w-[150px] transition-all duration-300" />

            {/* Practice Now (20-21px) */}
            <span className="inline-flex items-center gap-2 text-[15px] sm:text-[17px] lg:text-[19px] xl:text-[20px] font-semibold text-zinc-900 group-hover:text-black tracking-tight transition-colors duration-200 cursor-pointer">
              <span>Practice Now</span>
              <svg
                className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-transform duration-200 ease-out group-hover:translate-x-1.5"
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

        {/* 4. LET'S GO CTA (~280px x 70px) */}
        <div className="my-auto py-2 sm:py-3 flex justify-center w-full shrink-0">
          <Link
            href="/jam"
            className="w-[220px] h-[58px] sm:w-[255px] sm:h-[66px] md:w-[280px] md:h-[72px] rounded-full bg-[#111318] hover:bg-black text-white text-[20px] sm:text-[23px] md:text-[25px] font-bold tracking-tight inline-flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer select-none"
          >
            <span>Let's Go</span>
            <svg
              className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] md:w-[24px] md:h-[24px] transition-transform duration-200 ease-out group-hover:translate-x-1.5"
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
