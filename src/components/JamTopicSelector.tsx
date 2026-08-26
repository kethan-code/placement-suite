'use client';
import React, { useState } from 'react';

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
  { id: 'HR_Interviews', label: '🤝 HR & Behavioral' },
  { id: 'Core_Engineering', label: '⚙️ Core Engineering' },
  { id: 'Business_Management', label: '📊 Business & Mgmt' },
  { id: 'General_Aptitude', label: '🧠 General & Logic' }
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
    const key = apiKey || localStorage.getItem('app_gemini_api_key') || localStorage.getItem('app_api_key');

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
    <div className="bg-[#121212] border border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8">
      {/* Tab Switcher */}
      <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
        {[
          { id: 'ai', label: '✨ JAM AI' },
          { id: 'deck', label: '🎲 Master Deck' },
          { id: 'custom', label: '✍️ Custom Topic' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-black shadow-sm border border-transparent' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ✨ JAM AI */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block mb-3">
              Select AI Track / Mood
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                'Campus Standard',
                'Tech & Innovation',
                'Abstract & Logic',
                'Personal & Behavioral'
              ].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setMoodTrack(mood)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border text-left transition-all ${
                    moodTrack === mood
                      ? 'bg-white text-black border-transparent shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateAiTopic}
            disabled={isGeneratingAi}
            className="w-full bg-white text-black font-extrabold py-3.5 rounded-xl hover:bg-zinc-200 transition-all text-sm shadow-md flex items-center justify-center gap-2"
          >
            {isGeneratingAi ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                Generating Guardrailed Topic...
              </>
            ) : (
              '⚡ Generate AI JAM Topic'
            )}
          </button>

          {aiTopicData && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3 animate-fade-in shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 bg-zinc-950 px-2.5 py-0.5 rounded-full border border-zinc-800">
                  {aiTopicData.category || moodTrack}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">60s Optimized</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-snug">{aiTopicData.topic}</h3>
              {aiTopicData.hint && (
                <p className="text-xs text-zinc-400 italic border-l-2 border-zinc-700 pl-3 leading-relaxed">
                  💡 Hint: {aiTopicData.hint}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 🎲 MASTER DECK (INTEGRATED VAULT) */}
      {activeTab === 'deck' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block mb-3">
              Domain Filter
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border text-left transition-all ${
                    category === cat.id
                      ? 'bg-white text-black border-transparent shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block mb-3">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    difficulty === diff
                      ? 'bg-white text-black border-transparent shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleGenerateCategory}
              className="flex-1 bg-white text-black font-extrabold py-3.5 rounded-xl hover:bg-zinc-200 transition-colors shadow-md text-xs sm:text-sm"
            >
              🎯 Filtered Domain Topic
            </button>
            <button
              onClick={handleGenerateDeck}
              className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold py-3.5 rounded-xl transition-all text-xs sm:text-sm"
            >
              🎲 Draw Universal Random Prompt
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ✍️ CUSTOM TOPIC */}
      {activeTab === 'custom' && (
        <div className="space-y-4 pt-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type a specific question provided by your placement team..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
          />
          <button
            onClick={() => customInput.trim() && pickTopic(customInput.trim())}
            disabled={!customInput.trim()}
            className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 font-bold py-3.5 rounded-xl transition-colors text-sm"
          >
            Lock Custom Topic
          </button>
        </div>
      )}

      {/* LOCKED TOPIC SUMMARY */}
      {selectedTopic && (
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl animate-fade-in flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block mb-1">
              Locked For 60s Session
            </span>
            <p className="text-sm font-bold text-white leading-snug">{selectedTopic}</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shrink-0">
            ✓ Ready
          </span>
        </div>
      )}
    </div>
  );
}
