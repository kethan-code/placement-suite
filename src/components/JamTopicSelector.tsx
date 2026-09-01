'use client';
import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  PenLine, 
  Shuffle, 
  Users, 
  Cpu, 
  Briefcase, 
  Brain, 
  Target, 
  Lightbulb, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export interface TopicItem {
  topic: string;
  hint: string[];
}

// Universal Topics for ALL Branches (1st-year B.Tech friendly)
export const MASTER_DECK: TopicItem[] = [
  {
    topic: "Will AI end up helping students or making them lazy?",
    hint: [
      "Define how students use AI today",
      "Share one personal study example",
      "State your final opinion on balance"
    ]
  },
  {
    topic: "Do you prefer studying at home or in the college library?",
    hint: [
      "Compare home vs library study environments",
      "Share your personal experience",
      "Conclude where you focus best"
    ]
  },
  {
    topic: "Why being a good team player matters more than just getting good grades.",
    hint: [
      "Explain why collaboration matters in projects",
      "Share a quick group work experience",
      "Conclude with the value of teamwork"
    ]
  },
  {
    topic: "Hostel life vs. Day scholar life: Which one is better?",
    hint: [
      "Define the core lifestyle difference",
      "Share a quick personal anecdote",
      "Conclude which builds better independence"
    ]
  },
  {
    topic: "Online shopping vs. Buying from local market stores",
    hint: [
      "List convenience vs hands-on shopping pros",
      "Share a recent shopping experience",
      "State your final preference"
    ]
  },
  {
    topic: "Should colleges give less homework and more practical projects?",
    hint: [
      "Explain why hands-on learning helps engineers",
      "Share a practical project experience",
      "Conclude with your recommendation"
    ]
  },
  {
    topic: "Why learning from failure is better than never trying",
    hint: [
      "Define how mistakes build resilience",
      "Describe a small setback you overcame",
      "Conclude with what it taught you"
    ]
  },
  {
    topic: "Early morning study sessions vs. Late night study sessions",
    hint: [
      "Define your peak energy times",
      "Share your current routine",
      "Conclude with your ideal timing"
    ]
  },
  {
    topic: "My favorite smartphone feature and why I cannot live without it",
    hint: [
      "Name your favorite smartphone feature",
      "Explain how it saves daily time",
      "Conclude why it is essential"
    ]
  },
  {
    topic: "Why every engineering student should learn basic public speaking",
    hint: [
      "Explain why technical skills need presentation",
      "Share how speaking boosts confidence",
      "Conclude with your recommendation"
    ]
  }
];

export const CATEGORY_POOL: Record<string, Record<string, TopicItem[]>> = {
  HR_Interviews: {
    Easy: [
      {
        topic: "Tell me about a time you worked on a team project in college.",
        hint: [
          "Introduce your college project goal",
          "Explain your specific team role",
          "Conclude with your team achievement"
        ]
      },
      {
        topic: "What is your dream job after completing your degree?",
        hint: [
          "Name your target job title",
          "Mention 2 key skills you apply",
          "Conclude with your career goal"
        ]
      },
      {
        topic: "How do you manage your time when exams are near?",
        hint: [
          "State how you prioritize subjects",
          "Share a daily timetable strategy",
          "Conclude how you avoid stress"
        ]
      }
    ],
    Medium: [
      {
        topic: "Describe a situation where you had to lead a group task.",
        hint: [
          "Explain the assigned group challenge",
          "Describe how you organized work",
          "Conclude with the final result"
        ]
      },
      {
        topic: "How do you react when someone gives you constructive feedback?",
        hint: [
          "Explain why feedback helps growth",
          "Give a personal advice example",
          "Conclude with your improvement"
        ]
      },
      {
        topic: "What is one personal habit you are actively trying to improve?",
        hint: [
          "Identify the specific personal habit",
          "Describe steps taken daily",
          "Conclude with positive changes seen"
        ]
      }
    ],
    Hard: [
      {
        topic: "Tell me about a project or exam that did not go well and what you learned.",
        hint: [
          "State what went wrong calmly",
          "Detail the key takeaway lesson",
          "Conclude with how you improved"
        ]
      },
      {
        topic: "How do you encourage a group partner who is not doing their work?",
        hint: [
          "Describe speaking to them privately",
          "Explain dividing tasks fairly",
          "Conclude with reaching the goal"
        ]
      },
      {
        topic: "What would you do if a teammate took credit for your work?",
        hint: [
          "Explain why staying calm helps",
          "Describe presenting proof professionally",
          "Conclude with maintaining team harmony"
        ]
      }
    ]
  },
  Core_Engineering: {
    Easy: [
      {
        topic: "Why safety rules in laboratories and workshops are super important.",
        hint: [
          "Define lab hazard prevention steps",
          "Mention key safety gear needed",
          "Conclude why discipline prevents accidents"
        ]
      },
      {
        topic: "Why fixing small equipment issues early saves big trouble later.",
        hint: [
          "Explain preventive equipment maintenance",
          "Share an example of minor issues",
          "Conclude with cost and safety"
        ]
      },
      {
        topic: "How to plan your engineering mini-project step by step.",
        hint: [
          "List topic selection and research",
          "Explain prototyping and testing steps",
          "Conclude with project presentation"
        ]
      }
    ],
    Medium: [
      {
        topic: "How smart sensors and smartphones are making daily life easier.",
        hint: [
          "Give everyday smart sensor examples",
          "Explain how sensors collect data",
          "Conclude with future convenience"
        ]
      },
      {
        topic: "Why 3D printing and quick prototypes are useful for students.",
        hint: [
          "Define 3D printing in engineering",
          "Explain testing physical models fast",
          "Conclude with cost and speed"
        ]
      },
      {
        topic: "Choosing between budget parts and high-quality materials in projects.",
        hint: [
          "Balance project budget vs durability",
          "Explain when high quality matters",
          "Conclude with making smart trade-offs"
        ]
      }
    ],
    Hard: [
      {
        topic: "How green energy like solar and wind power can reduce pollution.",
        hint: [
          "Define solar and wind power",
          "Share environmental and clean benefits",
          "Conclude with engineering green solutions"
        ]
      },
      {
        topic: "How smart electric vehicles are changing campus transportation.",
        hint: [
          "Discuss EV adoption on campus",
          "Mention zero emissions and noise",
          "Conclude with charging facility needs"
        ]
      },
      {
        topic: "Why recycling electronic waste is essential for modern engineers.",
        hint: [
          "Define e-waste pollution hazards",
          "Explain valuable metal recovery",
          "Conclude with eco-friendly design"
        ]
      }
    ]
  },
  Business_Management: {
    Easy: [
      {
        topic: "What makes your favorite brand or app stand out to you?",
        hint: [
          "Name the brand or app",
          "Describe its best user feature",
          "Conclude why customers stay loyal"
        ]
      },
      {
        topic: "Why listening to user reviews makes an app much better.",
        hint: [
          "Explain user feedback loops",
          "Share a fixed bug example",
          "Conclude how reviews guide updates"
        ]
      },
      {
        topic: "Simple habits to manage your daily college schedule.",
        hint: [
          "Name one habit (like to-do lists)",
          "Explain how you use it daily",
          "Conclude with how it reduces stress"
        ]
      }
    ],
    Medium: [
      {
        topic: "How to build a popular YouTube channel or Instagram page.",
        hint: [
          "Select a specific content niche",
          "Explain consistent weekly posting",
          "Conclude with audience value creation"
        ]
      },
      {
        topic: "Why ratings and data reviews help people make shopping choices.",
        hint: [
          "Explain social proof in buying",
          "Mention trust in star ratings",
          "Conclude how data guides decisions"
        ]
      },
      {
        topic: "How to speak clearly and confidently in group discussions.",
        hint: [
          "Emphasize active listening first",
          "Explain structuring points logically",
          "Conclude with calm body language"
        ]
      }
    ],
    Hard: [
      {
        topic: "How a company should handle a product recall or bad review online.",
        hint: [
          "Emphasize fast public honesty",
          "Explain fair customer refunds",
          "Conclude with rebuilding brand trust"
        ]
      },
      {
        topic: "What steps a college startup needs to take to get its first customer.",
        hint: [
          "Identify a real student problem",
          "Pitch directly to early users",
          "Conclude with securing first reviews"
        ]
      },
      {
        topic: "Why discount sales and flash deals make people buy things quickly.",
        hint: [
          "Define urgency in marketing",
          "Give a festival deal example",
          "Conclude with buyer psychology"
        ]
      }
    ]
  },
  General_Aptitude: {
    Easy: [
      {
        topic: "Why picking up new skills outside textbooks is important.",
        hint: [
          "Contrast textbooks with practical skills",
          "Share a skill learned online",
          "Conclude with career advantages"
        ]
      },
      {
        topic: "The fun and benefits of joining college clubs and events.",
        hint: [
          "Name your favorite college club",
          "Explain networking and event leadership",
          "Conclude with personal growth"
        ]
      },
      {
        topic: "How to prepare yourself for your very first job interview.",
        hint: [
          "Research basic company details",
          "Practice mock speaking questions",
          "Conclude with confident posture"
        ]
      }
    ],
    Medium: [
      {
        topic: "Why practical college internships help you get hired faster.",
        hint: [
          "Describe real workplace experience",
          "Explain how projects build confidence",
          "Conclude with full-time job offers"
        ]
      },
      {
        topic: "How to build a neat and professional LinkedIn profile as a student.",
        hint: [
          "Use a clean professional photo",
          "List projects and key skills",
          "Conclude with connecting with mentors"
        ]
      },
      {
        topic: "Why learning how to budget monthly pocket money is useful.",
        hint: [
          "Track essential vs extra expenses",
          "Share a simple savings habit",
          "Conclude with building financial discipline"
        ]
      }
    ],
    Hard: [
      {
        topic: "Written exams vs. Hands-on practical tests: Which is fairer?",
        hint: [
          "Compare memorization vs practical tests",
          "Evaluate fairness for students",
          "Conclude with a balanced approach"
        ]
      },
      {
        topic: "Why many graduates move to big cities for career growth.",
        hint: [
          "Discuss job market concentration",
          "Mention networking and opportunities",
          "Conclude with personal independence"
        ]
      },
      {
        topic: "Should college funding focus more on campus sports or research labs?",
        hint: [
          "Highlight physical fitness vs research",
          "Weigh long-term student benefits",
          "Conclude with your ideal balance"
        ]
      }
    ]
  }
};

const CATEGORIES = [
  { id: 'Random_Mix', label: 'Random Mix', icon: Shuffle },
  { id: 'HR_Interviews', label: 'HR & Behavioral', icon: Users },
  { id: 'Core_Engineering', label: 'Core Engineering', icon: Cpu },
  { id: 'Business_Management', label: 'Business & Mgmt', icon: Briefcase },
  { id: 'General_Aptitude', label: 'General & Logic', icon: Brain }
];

interface JamTopicSelectorProps {
  onTopicSelect: (topic: string) => void;
  apiKey?: string | null;
}

export default function JamTopicSelector({ onTopicSelect, apiKey }: JamTopicSelectorProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'deck' | 'custom'>('ai');
  const [moodTrack, setMoodTrack] = useState('Campus Standard');
  const [category, setCategory] = useState('Random_Mix');
  const [difficulty, setDifficulty] = useState('Medium');
  const [customInput, setCustomInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedHint, setSelectedHint] = useState<string[] | undefined>([]);
  const [aiTopicData, setAiTopicData] = useState<{ topic: string; category: string; hint: string[] } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const pickTopic = (item: string | TopicItem, hintParam?: string[] | string) => {
    let t = '';
    let h: string[] = [];
    if (typeof item === 'string') {
      t = item;
      if (Array.isArray(hintParam)) {
        h = hintParam;
      } else if (typeof hintParam === 'string' && hintParam) {
        h = [hintParam];
      }
    } else {
      t = item.topic;
      h = Array.isArray(item.hint) ? item.hint : [item.hint];
    }
    setSelectedTopic(t);
    setSelectedHint(h);
    onTopicSelect(t);
  };

  const handleGenerateAiTopic = async () => {
    setIsGeneratingAi(true);
    const key = apiKey || localStorage.getItem('app_gemini_api_key') || localStorage.getItem('app_api_key');

    const prompt = `You are an encouraging placement training coordinator helping beginner engineering students practice their English communication.

Selected Mood/Track: ${moodTrack}

Generate ONE simple, highly relatable Just-A-Minute (JAM) topic.

STRICT RULES:
1. TOPIC SIMPLICITY: The topic MUST be very easy, everyday, and universally relatable (e.g., "Online vs Offline Classes", "Hostel Life vs Day Scholar", "My favorite smartphone feature", "Early bird vs Night owl").
2. No complex jargon, abstract philosophy, or deep technical knowledge required. Keep the topic under 10 words.
3. ACTIONABLE HINT: The 'hint' must be an array of exactly 3 short, punchy steps (maximum 5-7 words per step). Step 1: Intro. Step 2: Body/Example. Step 3: Conclusion.
4. Output strictly valid JSON: { "topic": string, "category": string, "hint": string[] }`;

    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    let topicResult: { topic: string; category: string; hint: string[] } | null = null;

    for (const model of candidateModels) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7
            }
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
      pickTopic(topicResult.topic, topicResult.hint);
    } else {
      // Fallback topic if API key missing or network fails
      const fallback = {
        topic: "Online vs Offline Classes",
        category: moodTrack,
        hint: [
          "Compare online vs offline classes",
          "Share one personal learning experience",
          "Conclude with your preferred choice"
        ]
      };
      setAiTopicData(fallback);
      pickTopic(fallback.topic, fallback.hint);
    }

    setIsGeneratingAi(false);
  };

  const handleDrawTopic = () => {
    let pool: TopicItem[] = [];

    if (category === 'Random_Mix') {
      pool = [...MASTER_DECK];
      Object.values(CATEGORY_POOL).forEach((domainObj) => {
        if (domainObj[difficulty]) {
          pool.push(...domainObj[difficulty]);
        } else {
          Object.values(domainObj).forEach((arr) => pool.push(...arr));
        }
      });
    } else {
      pool = CATEGORY_POOL[category]?.[difficulty] || [];
      if (pool.length === 0) {
        pool = MASTER_DECK;
      }
    }

    if (pool.length > 0) {
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      pickTopic(chosen);
    }
  };

  return (
    <div className="bg-[#121212] border border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8">
      {/* Tab Switcher */}
      <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
        {[
          { id: 'ai', label: 'JAM AI', icon: Sparkles },
          { id: 'deck', label: 'Master Deck', icon: Layers },
          { id: 'custom', label: 'Custom Topic', icon: PenLine }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isActive 
                  ? 'bg-white text-black shadow-sm border border-transparent' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: JAM AI */}
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
                <span>Generating Topic...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Generate AI JAM Topic</span>
              </>
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
              {aiTopicData.hint && aiTopicData.hint.length > 0 && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2 mt-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                    3-Step Speaking Checklist
                  </span>
                  <div className="flex flex-col gap-2">
                    {(Array.isArray(aiTopicData.hint) ? aiTopicData.hint : [aiTopicData.hint]).map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="text-sm text-zinc-300 font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
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
            <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest block mb-3">
              Domain Filter
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`py-3 px-3.5 rounded-xl text-xs font-bold border text-left transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-white text-black border-transparent shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
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

          <div className="pt-2">
            <button
              onClick={handleDrawTopic}
              className="w-full bg-white text-black font-extrabold py-4 rounded-xl hover:bg-zinc-200 transition-all text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4 text-black" />
              <span>Draw Topic</span>
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
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
          />
          <button
            onClick={() => customInput.trim() && pickTopic(customInput.trim())}
            disabled={!customInput.trim()}
            className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span>Lock Custom Topic</span>
          </button>
        </div>
      )}

      {/* LOCKED TOPIC SUMMARY */}
      {selectedTopic && (
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl animate-fade-in space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block mb-1">
                Locked For 60s Session
              </span>
              <p className="text-sm font-bold text-white leading-snug">{selectedTopic}</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready</span>
            </span>
          </div>

          {selectedHint && selectedHint.length > 0 && (
            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">3-Step Speaking Checklist</span>
              </div>
              <div className="flex flex-col gap-2">
                {selectedHint.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-sm text-zinc-300 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
