'use client';
import React, { useState } from 'react';
import { getGeminiApiKey } from '@/lib/geminiKey';

// Universal Topics for ALL Branches
export const MASTER_DECK = [
  "The impact of Artificial Intelligence on traditional industries",
  "Is remote work a sustainable model for the future?",
  "The role of renewable energy in modern infrastructure",
  "How social media algorithms shape public opinion",
  "Emotional Intelligence vs. IQ in corporate leadership",
  "The ethics of automation and job displacement",
  "Why cross-disciplinary skills are essential for freshers",
  "Handling failure and building resilience in your career",
  "The future of global supply chains",
  "How to maintain work-life balance in high-stress jobs"
];

export const CATEGORY_POOL: Record<string, Record<string, string[]>> = {
  HR_Interviews: {
    Easy: ["Tell me about a time you worked in a team.", "What are your short-term career goals?", "How do you handle strict deadlines?"],
    Medium: ["Describe a situation where you had to lead without a formal title.", "How do you handle disagreements with a manager?", "What is your biggest professional weakness?"],
    Hard: ["Tell me about a time a project failed and how you recovered.", "How do you motivate a team member who is underperforming?", "Describe an ethical dilemma you faced and how you solved it."]
  },
  Core_Engineering: {
    Easy: ["The importance of safety protocols in engineering.", "Why is preventative maintenance important?", "The basics of project management."],
    Medium: ["How IoT is changing manufacturing.", "The impact of 3D printing on prototyping.", "Balancing cost vs. quality in material selection."],
    Hard: ["The future of smart cities and urban planning.", "Transitioning to zero-emission infrastructure.", "Overcoming supply chain bottlenecks in manufacturing."]
  },
  Business_Management: {
    Easy: ["What makes a good marketing campaign?", "The importance of customer feedback.", "Basic principles of time management."],
    Medium: ["How to build a brand identity from scratch.", "The role of data analytics in decision making.", "Navigating corporate communication."],
    Hard: ["Crisis management in a PR disaster.", "Strategies for scaling a local startup globally.", "The psychological impact of pricing strategies."]
  },
  General_Aptitude: {
    Easy: ["Why is continuous learning important?", "The value of extracurricular activities in college.", "How to prepare for campus placements."],
    Medium: ["The role of internships in bridging the industry gap.", "How to build a professional network on LinkedIn.", "The importance of financial literacy for students."],
    Hard: ["Standardized testing vs. practical skill evaluation.", "The economic impact of brain drain.", "Evaluating the success of government startup initiatives."]
  }
};

const CATEGORIES = [
  { 
    id: 'HR_Interviews', 
    label: 'HR & Behavioral',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    id: 'Core_Engineering', 
    label: 'Core Engineering',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  { 
    id: 'Business_Management', 
    label: 'Business & Mgmt',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    id: 'General_Aptitude', 
    label: 'General & Logic',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  }
];

const TABS = [
  {
    id: 'ai' as const,
    label: 'JAM AI',
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    )
  },
  {
    id: 'deck' as const,
    label: 'Master Deck',
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
      </svg>
    )
  },
  {
    id: 'custom' as const,
    label: 'Custom Topic',
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    )
  }
];

interface JamTopicSelectorProps {
  onTopicSelect: (topic: string) => void;
  apiKey?: string | null;
}

export default function JamTopicSelector({ onTopicSelect, apiKey }: JamTopicSelectorProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'deck' | 'custom'>('ai');
  const [moodTrack, setMoodTrack] = useState('Campus Standard');
  const [category, setCategory] = useState('HR_Interviews');
  const [difficulty, setDifficulty] = useState('Medium');
  const [customInput, setCustomInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [aiTopicData, setAiTopicData] = useState<{ topic: string; category: string; hint: string } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const pickTopic = (t: string) => {
    setSelectedTopic(t);
    onTopicSelect(t);
  };

  const handleGenerateAiTopic = async () => {
    setIsGeneratingAi(true);
    const key = apiKey || getGeminiApiKey();

    const prompt = `You are a placement training coordinator specializing in standard 60-second Just-A-Minute (JAM) rounds for engineering college placement drives.

Selected Mood/Track: ${moodTrack}

Generate ONE clear, engaging, and highly articulate JAM topic.
Strict Rules:
1. Must be concise (under 12 words).
2. Must be easy to grasp instantly without needing niche or obscure knowledge.
3. Ideal for a 60-second impromptu speech.
4. Output strictly valid JSON: { "topic": string, "category": string, "hint": string }`;

    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    let topicResult: { topic: string; category: string; hint: string } | null = null;

    for (const model of candidateModels) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed.topic) {
            topicResult = parsed;
            break;
          }
        }
      } catch (e) {
        console.warn(`Model ${model} failed, trying fallback...`, e);
      }
    }

    if (topicResult) {
      setAiTopicData(topicResult);
      pickTopic(topicResult.topic);
    } else {
      // Fallback topic if API key missing or network fails
      const fallback = {
        topic: "The Role of Innovation in Modern Engineering Solutions",
        category: moodTrack,
        hint: "Discuss how creative problem-solving turns technical ideas into real-world applications."
      };
      setAiTopicData(fallback);
      pickTopic(fallback.topic);
    }

    setIsGeneratingAi(false);
  };

  const handleGenerateCategory = () => {
    const pool = CATEGORY_POOL[category]?.[difficulty] || [];
    if (pool.length > 0) {
      pickTopic(pool[Math.floor(Math.random() * pool.length)]);
    }
  };

  const handleGenerateDeck = () => {
    pickTopic(MASTER_DECK[Math.floor(Math.random() * MASTER_DECK.length)]);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-8">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 gap-1">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSelected 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
              }`}
            >
              <span className={isSelected ? 'text-blue-600' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: JAM AI */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Select AI Track / Mood
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                'Campus Standard',
                'Tech & Innovation',
                'Abstract & Logic',
                'Personal & Behavioral'
              ].map((mood) => {
                const isSelected = moodTrack === mood;
                return (
                  <button
                    key={mood}
                    onClick={() => setMoodTrack(mood)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 text-blue-700 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/60'
                    }`}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerateAiTopic}
            disabled={isGeneratingAi}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGeneratingAi ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Generating Guardrailed Topic...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" />
                </svg>
                <span>Generate AI JAM Topic</span>
              </>
            )}
          </button>

          {aiTopicData && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3 animate-fade-in shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                  {aiTopicData.category || moodTrack}
                </span>
                <span className="text-[10px] font-mono text-slate-400">60s Optimized</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">{aiTopicData.topic}</h3>
              {aiTopicData.hint && (
                <div className="text-xs text-slate-600 italic border-l-2 border-blue-500 pl-3 py-1.5 leading-relaxed bg-white/80 rounded-r-lg flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span><strong>Hint:</strong> {aiTopicData.hint}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER DECK */}
      {activeTab === 'deck' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Domain Filter
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 text-blue-700 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/60'
                    }`}
                  >
                    <span className={isSelected ? 'text-blue-600' : 'text-slate-400'}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['Easy', 'Medium', 'Hard'].map((diff) => {
                const isSelected = difficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 text-blue-700 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/60'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleGenerateCategory}
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm shadow-blue-500/20 text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <span>Filtered Domain Topic</span>
            </button>
            <button
              onClick={handleGenerateDeck}
              className="flex-1 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-700 border border-slate-200/80 font-bold py-3.5 rounded-xl transition-all text-xs sm:text-sm shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Draw Universal Random Prompt</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM TOPIC */}
      {activeTab === 'custom' && (
        <div className="space-y-4 pt-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type a specific question provided by your placement team..."
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium shadow-xs"
          />
          <button
            onClick={() => customInput.trim() && pickTopic(customInput.trim())}
            disabled={!customInput.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-sm shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>Lock Custom Topic</span>
          </button>
        </div>
      )}

      {/* LOCKED TOPIC SUMMARY */}
      {selectedTopic && (
        <div className="p-5 bg-blue-50/50 border border-blue-200/60 rounded-2xl animate-fade-in flex items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
              Locked For 60s Session
            </span>
            <p className="text-sm font-bold text-slate-900 leading-snug">{selectedTopic}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
            <svg className="w-3.5 h-3.5 stroke-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Ready
          </span>
        </div>
      )}
    </div>
  );
}

