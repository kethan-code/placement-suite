import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

const DOMAIN_FALLBACK_QUESTIONS: Record<string, string[]> = {
  SoftwareEngineers: [
    "Tell me about a complex technical project you built recently.",
    "How do you approach debugging a critical production bug under pressure?",
    "What is a technical decision you made that you later regretted?",
    "How do you ensure code quality when sprint deadlines are tight?",
    "Tell me about a time you had to push back against a technical spec.",
    "What strategy do you use for designing clean APIs?",
    "How do you handle race conditions or async state issues in code?",
    "Tell me about a time you mentored or reviewed code for your team.",
    "How do you choose between new frameworks and battle-tested tools?",
    "How do you handle security and input validation in your web apps?"
  ],
  FrontendUI: [
    "Tell me about a complex frontend architecture or component hierarchy you built.",
    "How do you optimize web performance, LCP, and layout stability?",
    "Describe how you handle state management across large web applications.",
    "How do you ensure cross-browser compatibility and responsive layout design?",
    "Tell me about a time you resolved a difficult web performance or CSS rendering issue."
  ],
  SystemDesign: [
    "How do you approach designing a high-throughput, low-latency microservice system?",
    "How do you handle database sharding, caching, and data consistency trade-offs?",
    "Tell me about a time you designed a system to withstand peak traffic spikes.",
    "How do you choose between SQL and NoSQL storage engines for complex workloads?",
    "How do you design fallback mechanisms for external service failures?"
  ],
  BusinessManagement: [
    "Tell me about a strategic initiative or project you led.",
    "Describe a time when data contradicted your business intuition.",
    "How do you make critical decisions when market data is incomplete?",
    "Share an instance where a client was dissatisfied with a deliverable.",
    "How do you prioritize competing deadlines across different teams?",
    "Tell me about a time an unexpected shift disrupted your roadmap.",
    "How do you keep team morale high during high-stress periods?",
    "Tell me about a negotiation where you had to secure buy-in from leadership.",
    "How do you define key performance indicators for a new project?",
    "Tell me about a time you managed an underperforming team member."
  ],
  GeneralCampusPlacement: [
    "Introduce yourself and highlight why you are a great fit for this role.",
    "Tell me about a challenging group project from your university coursework.",
    "Describe a time you received constructive feedback from a mentor.",
    "How do you manage your time when facing multiple tight deadlines?",
    "Share an example of a goal you set but failed to achieve.",
    "Where do you see yourself growing professionally over the next 3 years?",
    "Tell me about a time you had to learn a brand new tool quickly.",
    "Describe a situation where you took initiative outside your assigned duties.",
    "How do you work alongside people with different communication styles?",
    "What uniquely motivates you to join our company?"
  ]
};

function getFallbackQuestion(jobRole: string, sessionQuestions: string[] = [], recentQuestions: string[] = []): string {
  const pool = DOMAIN_FALLBACK_QUESTIONS[jobRole] || DOMAIN_FALLBACK_QUESTIONS.GeneralCampusPlacement;
  const used = new Set([...sessionQuestions, ...recentQuestions].map(q => q.toLowerCase().trim()));
  
  const available = pool.filter(q => !used.has(q.toLowerCase().trim()));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

async function callGeminiWithFallback(apiKey: string, systemPrompt: string, userPrompt: string) {
  let lastError = "All candidate models failed.";
  for (const model of CANDIDATE_MODELS) {
    try {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { text: data.candidates[0].content.parts[0].text, modelUsed: model };
      }
      lastError = data.error?.message || ("Status " + response.status);
      console.warn("Mock-HR model " + model + " unavailable (" + lastError + "). Trying fallback...");
    } catch (err: any) {
      lastError = err.message;
      console.warn("Mock-HR error on model " + model + ":", err.message);
    }
  }
  throw new Error("Service temporarily busy across all candidate models. (" + lastError + ")");
}

function cleanJsonResponse(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const { action, conversation, candidateAnswer, jobRole, persona, sessionQuestions = [], recentQuestions = [], apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key is missing. Please reconnect it." }, { status: 401 });
    }

    if (action === "start_session" || action === "generate_question") {
      const personaTone = persona === "strict"
        ? "demanding, direct, challenging, and formal"
        : persona === "friendly"
        ? "warm, encouraging, supportive, and conversational"
        : "balanced, realistic, professional, and clear";

      const askedHistoryStr = sessionQuestions.length > 0 ? sessionQuestions.map((q: string) => '- "' + q + '"').join("\n") : "None";
      const recentHistoryStr = recentQuestions.length > 0 ? recentQuestions.map((q: string) => '- "' + q + '"').join("\n") : "None";

      const systemPrompt = "You are a professional HR interviewer conducting a realistic 1-on-1 job interview for a candidate targeting the " + (jobRole || "General Campus Placement") + " role with a " + personaTone + " recruiter style.\n\nSTRICT OPENING QUESTION RULES:\n1. Ask ONLY ONE single opening question tailored to the " + (jobRole || "General Campus Placement") + " domain.\n2. Keep the question concise, natural, and conversational (approx 8 to 20 words, maximum 1 to 2 short sentences).\n3. VARY THE OPENING QUESTION! Do NOT always ask a generic self-introduction. You can ask about a favorite project, technical interest, team experience, or background relevant to the domain.\n4. Do NOT ask multi-part questions or combine multiple questions.\n5. The question must sound natural and effortless when spoken aloud via Text-To-Speech.\n\nQuestions already asked in this session:\n" + askedHistoryStr + "\n\nRecently used questions from previous sessions:\n" + recentHistoryStr + "\n\nCreate ONE short opening question that is meaningfully different from all questions listed above.\nRespond ONLY with a valid JSON object matching this schema:\n{\n  \"question\": \"The short 8-20 word opening interview question.\"\n}";

      const userPrompt = "Generate a fresh, concise 8-20 word opening question for a new interview session targeting " + (jobRole || "General Campus Placement") + ". Ensure it is ONE clear question.";

      try {
        const { text: rawText, modelUsed } = await callGeminiWithFallback(apiKey, systemPrompt, userPrompt);
        const cleaned = cleanJsonResponse(rawText);
        const resultJson = JSON.parse(cleaned);

        return NextResponse.json({ success: true, question: resultJson.question, modelUsed });
      } catch (err: any) {
        console.warn("AI initial question generation failed, utilizing smart fallback pool:", err.message);
        const fallbackQ = getFallbackQuestion(jobRole, sessionQuestions, recentQuestions);
        return NextResponse.json({ success: true, question: fallbackQ, isFallback: true });
      }
    }

    if (action === "turn") {
      const personaTone = persona === "strict"
        ? "demanding, direct, rigorous, probing, and analytical"
        : persona === "friendly"
        ? "encouraging, warm, supportive, empathetic, and conversational"
        : "balanced, professional, clear, insightful, and realistic";

      const jobRoleTitle = 
        jobRole === "SoftwareEngineers" ? "Software Engineering & DSA Specialist" :
        jobRole === "FrontendUI" ? "UI/UX & Frontend Architect" :
        jobRole === "SystemDesign" ? "System Design & Technical Lead" :
        jobRole === "BusinessManagement" ? "Business & Management Associate" :
        "Campus Placement / Graduate Candidate";

      const historyFormatted = (conversation || [])
        .map((c: any) => (c.speaker === "interviewer" ? "Interviewer" : "Candidate") + ': "' + c.text + '"')
        .join("\n");

      const askedHistoryStr = sessionQuestions.length > 0 ? sessionQuestions.map((q: string) => '- "' + q + '"').join("\n") : "None";

      const systemPrompt = "You are a professional human recruiter conducting a live, interactive 2-way job interview for a candidate applying for: " + jobRoleTitle + ".\nRecruiter Persona: " + personaTone + ".\n\nCRITICAL INTERVIEWING INSTRUCTIONS:\n1. ACTIVELY LISTEN TO THE CANDIDATE: Read the candidate's latest response carefully: \"" + (candidateAnswer || "") + "\"\n2. GENERATE A CONTEXT-AWARE FOLLOW-UP QUESTION: Ask ONE natural follow-up question (8 to 18 words) that directly probes into specific details, projects, technologies, tools, decisions, challenges, or metrics mentioned in the candidate's latest response.\n3. CONVERSATIONAL LOGIC & CONTINUITY: The next question MUST logically continue from what the candidate just said. NEVER ask an unrelated generic question (such as hobbies, 5-year plans, or general strengths) when the candidate is discussing specific experiences or technical details.\n4. DRILL DEEPER STEP-BY-STEP:\n   - If candidate mentioned a specific project/system (e.g. attendance management, backend, website), ask about their specific role, technical choices, or challenges in that project.\n   - If candidate mentioned a problem (e.g. slow database queries, team disagreement), ask what specific steps they took to fix or optimize it.\n   - If candidate mentioned a solution (e.g. added indexes, optimized queries), ask how they measured or verified the performance improvement.\n5. DO NOT REPEAT QUESTIONS: Never repeat any question from previous turns:\n" + askedHistoryStr + "\n6. SHORT ACKNOWLEDGING REACTION: Begin with a brief 1-sentence natural reaction acknowledging what the candidate said (e.g., \"That makes sense.\", \"I see, handling that backend must have required careful planning.\", \"Good approach to query optimization.\").\n7. SINGLE FOCUSED QUESTION ONLY: Ask ONLY ONE question. Do NOT combine multiple questions.\n\nRespond ONLY with a valid JSON object matching this schema:\n{\n  \"interviewerReaction\": \"Brief 1-sentence acknowledging comment.\",\n  \"followUpQuestion\": \"ONE focused context-aware follow-up question (8-18 words) probing candidate's latest answer.\",\n  \"isFinalTurn\": false\n}";

      const userPrompt = "COMPLETE INTERVIEW CONVERSATION TRANSCRIPT SO FAR:\n" + historyFormatted + "\n\nCANDIDATE'S LATEST ANSWER TO LISTEN TO:\n\"" + candidateAnswer + "\"\n\nTASK:\nExamine the candidate's latest answer above. Identify the specific project, technology, decision, challenge, or outcome they described. Ask ONE direct, natural follow-up question probing deeper into that exact point.";

      const { text: rawText, modelUsed } = await callGeminiWithFallback(apiKey, systemPrompt, userPrompt);
      const cleaned = cleanJsonResponse(rawText);
      const resultJson = JSON.parse(cleaned);

      const spokenText = resultJson.interviewerReaction + " " + resultJson.followUpQuestion;

      let audioBase64 = null;
      for (const ttsModel of ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]) {
        try {
          const ttsUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + ttsModel + ":generateContent?key=" + apiKey;
          const ttsRes = await fetch(ttsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{ text: "Speak the following text aloud with a professional HR interviewer tone: \"" + spokenText + "\"" }]
              }],
              generationConfig: {
                responseMimeType: "audio/mp3"
              }
            })
          });

          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            const candidatePart = ttsData.candidates?.[0]?.content?.parts?.[0];
            if (candidatePart?.inlineData?.data) {
              audioBase64 = candidatePart.inlineData.data;
              break;
            }
          }
        } catch (ttsErr) {
          console.warn("TTS generation error on model " + ttsModel + ":", ttsErr);
        }
      }

      return NextResponse.json({ success: true, turn: resultJson, audioBase64, modelUsed });
    }

    if (action === "evaluate") {
      const systemPrompt = "You are a Senior Talent Acquisition Manager evaluating a candidate's complete 2-way HR interview.\nAnalyze the candidate's communication style, confidence, technical/behavioral depth, and relevance across their answers.\nRespond ONLY with a valid JSON object matching this schema:\n{\n  \"overallScore\": 8.5,\n  \"scores\": {\n    \"communication\": 8,\n    \"confidence\": 9,\n    \"problemSolving\": 8,\n    \"behavioralFit\": 9\n  },\n  \"feedbackSummary\": \"Comprehensive 3-4 sentence performance summary.\",\n  \"strengths\": [\"Strong articulate answers\", \"Good STAR structure\"],\n  \"areasForImprovement\": [\"Can be more concise in technical details\"],\n  \"proTipForNextInterview\": \"One actionable high-impact tip.\"\n}";

      const historyFormatted = (conversation || [])
        .map((c: any) => (c.speaker === "interviewer" ? "Interviewer" : "Candidate") + ': "' + c.text + '"')
        .join("\n");

      const userPrompt = "Target Job Role: " + jobRole + "\nRecruiter Persona: " + (persona || "balanced") + "\nFull Interview Transcript:\n" + historyFormatted + "\n\nProvide the complete interview diagnostic evaluation.";

      const { text: rawText, modelUsed } = await callGeminiWithFallback(apiKey, systemPrompt, userPrompt);
      const cleaned = cleanJsonResponse(rawText);
      const evalJson = JSON.parse(cleaned);

      return NextResponse.json({ success: true, evaluation: evalJson, modelUsed });
    }

    return NextResponse.json({ success: false, error: "Invalid action parameter" }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}