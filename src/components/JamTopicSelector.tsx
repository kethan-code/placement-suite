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

export default function JamTopicSelector({ onTopicSelect }: { onTopicSelect: (topic: string) => void }) {
  const [activeTab, setActiveTab] = useState<'category' | 'deck' | 'custom'>('category');
  const [category, setCategory] = useState('HR_Interviews');
  const [difficulty, setDifficulty] = useState('Medium');
  const [customInput, setCustomInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const pickTopic = (t: string) => {
    setSelectedTopic(t);
    onTopicSelect(t);
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
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-8">
      {/* Tab Switcher */}
      <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
        {(['category', 'deck', 'custom'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab === 'category' ? '📁 Categories' : tab === 'deck' ? '🎲 Master Deck' : '✍️ Custom Topic'}
          </button>
        ))}
      </div>

      {activeTab === 'category' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest block mb-3">Topic Domain</label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border-2 text-left transition-all ${
                    category === cat.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest block mb-3">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                    difficulty === diff
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateCategory}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base"
          >
            Generate Assessment Topic
          </button>
        </div>
      )}

      {activeTab === 'deck' && (
        <div className="text-center py-8 space-y-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="text-4xl">🎲</div>
          <p className="text-sm text-gray-600 max-w-xs mx-auto font-medium leading-relaxed">
            Draw a random, high-frequency interview prompt from our universal campus placement database.
          </p>
          <button
            onClick={handleGenerateDeck}
            className="w-3/4 mx-auto block bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md"
          >
            Draw Random Prompt
          </button>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4 pt-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type a specific question provided by your staff..."
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-gray-900 focus:outline-none focus:border-blue-500 transition-all font-medium"
          />
          <button
            onClick={() => customInput.trim() && pickTopic(customInput.trim())}
            disabled={!customInput.trim()}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all text-base"
          >
            Lock Custom Topic
          </button>
        </div>
      )}

      {selectedTopic && (
        <div className="p-5 bg-blue-50 border-2 border-blue-100 rounded-2xl animate-fade-in">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 block mb-2">Locked For Session</span>
          <p className="text-base font-bold text-gray-900 leading-snug">{selectedTopic}</p>
        </div>
      )}
    </div>
  );
}
