import { NextResponse } from "next/server";
import {
  enforceEvaluationRules,
  generateFallbackEvaluation,
  extractQAPairs,
  detectQuestionEcho
} from "@/lib/interviewEvaluation";

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
    const { action, conversation = [], candidateAnswer = "", jobRole, persona, sessionQuestions = [], recentQuestions = [], apiKey } = await req.json();

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

      // Identify last question asked to candidate
      const qaPairs = extractQAPairs(conversation || []);
      const latestQuestion = sessionQuestions[sessionQuestions.length - 1] || (qaPairs.length > 0 ? qaPairs[qaPairs.length - 1].question : "Tell me about your background.");
      const echoCheck = detectQuestionEcho(latestQuestion, candidateAnswer || "");

      const systemPrompt = `You are a professional human recruiter conducting a live, interactive 2-way job interview for a candidate applying for: ${jobRoleTitle}.
Recruiter Persona: ${personaTone}.

CRITICAL ANSWER-AWARE INTERVIEWING RULES:
1. ACTIVELY EVALUATE THE CANDIDATE'S LATEST ANSWER:
   Original Question Asked: "${latestQuestion}"
   Candidate's Transcribed Answer: "${candidateAnswer || ""}"

2. DETECT ANSWER TYPE AND RESPOND ACCORDINGLY:
   - PARROT (Question Repeated): If candidate repeated or echoed the question without giving an answer, your reaction MUST politely point out that they repeated the question, e.g.:
     "It sounds like you repeated the question. Could you give your actual response in your own words?"
     And your followUpQuestion MUST directly prompt for a concrete answer or skill:
     "In your own words, what is a specific tool or skill you learned, and how did you use it?"
   - IRRELEVANT (Off-Topic): If the answer has nothing to do with the question, acknowledge and politely redirect them back to the original topic:
     "I see, though let's focus on the question. Could you tell me specifically about your experience with...?"
   - PARTIAL (Too brief or lacking detail): Encourage them to elaborate on specific details:
     "Good start. Could you walk me through a specific project or example where you applied that?"
   - MEANINGFUL (Concrete answer): Ask ONE focused follow-up question (8 to 18 words) drilling into specific technologies, tools, trade-offs, or measurable outcomes they mentioned.

3. CONVERSATIONAL CONTINUITY & SINGLE QUESTION:
   - Do NOT ask unrelated questions.
   - Do NOT repeat questions already asked:
${askedHistoryStr}
   - Ask ONLY ONE focused question.

Respond ONLY with a valid JSON object matching this schema:
{
  "interviewerReaction": "Brief 1-sentence acknowledging or redirecting comment.",
  "followUpQuestion": "ONE focused context-aware follow-up question (8-18 words).",
  "isFinalTurn": false
}`;

      const userPrompt = `ORIGINAL QUESTION ASKED:
"${latestQuestion}"

CANDIDATE'S ACTUAL TRANSCRIBED ANSWER:
"${candidateAnswer}"

FULL TRANSCRIPT SO FAR:
${historyFormatted}

Generate the next recruiter turn adhering strictly to the answer evaluation rules above.`;

      const { text: rawText, modelUsed } = await callGeminiWithFallback(apiKey, systemPrompt, userPrompt);
      const cleaned = cleanJsonResponse(rawText);
      let resultJson = JSON.parse(cleaned);

      // Deterministic check override if candidate purely echoed the question
      if (echoCheck.isEcho && !echoCheck.hasSubstantiveAnswer) {
        resultJson = {
          interviewerReaction: "It sounds like you repeated the interview question. I would love to hear your actual thoughts in your own words.",
          followUpQuestion: "In your own words, what is a specific tool or project you worked on recently?",
          isFinalTurn: false
        };
      }

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
      const qaPairs = extractQAPairs(conversation || []);
      const structuredQandA = qaPairs.map((p, i) => 
        `Turn ${i + 1}:\n[ORIGINAL QUESTION]: "${p.question}"\n[CANDIDATE'S ACTUAL TRANSCRIBED ANSWER]: "${p.answer}"`
      ).join("\n\n");

      const systemPrompt = `You are an expert HR interview evaluator. You must evaluate the candidate's actual answer against the original interview question.

First validate the answer, then score it. Never award marks simply because the candidate speaks.

If the response is a pure repetition or echo of the question without an actual answer, classify it as PARROT. If it is completely unrelated, classify it as IRRELEVANT.

For both PARROT and IRRELEVANT, all four evaluation categories and the overall rating must be exactly 1/10. Do not award baseline participation points, engagement marks, or unsupported strengths.

If the student repeats part of the question but also provides a meaningful answer, evaluate the meaningful content fairly.

For PARTIAL and MEANINGFUL responses, use the existing scoring rubric and award marks only for skills demonstrated by the response.

Never fabricate examples, achievements, skills, strengths, or evidence that the student did not provide.

Feedback must be specific, constructive, and directly related to the student's actual response.

Respond ONLY with a valid JSON object matching this schema:
{
  "answerValidation": "PARROT | IRRELEVANT | PARTIAL | MEANINGFUL",
  "validationReason": "Clear 1-2 sentence explanation of why this classification was assigned.",
  "overallScore": 1.0,
  "scores": {
    "communication": 1,
    "confidence": 1,
    "problemSolving": 1,
    "behavioralFit": 1
  },
  "feedbackSummary": "Comprehensive, honest 3-4 sentence performance summary directly based on their actual answers.",
  "strengths": ["Demonstrated strength 1", "Demonstrated strength 2"],
  "areasForImprovement": ["Growth area 1", "Growth area 2"],
  "proTipForNextInterview": "One actionable high-impact tip.",
  "questionEvaluations": [
    {
      "question": "Original interview question",
      "answer": "Candidate's transcribed response",
      "classification": "PARROT | IRRELEVANT | PARTIAL | MEANINGFUL",
      "critique": "Specific feedback evaluating this answer"
    }
  ]
}`;

      const userPrompt = `Target Job Role: ${jobRole || "General Campus Placement"}
Recruiter Persona: ${persona || "balanced"}

INTERVIEW QUESTIONS AND CANDIDATE ANSWERS TO EVALUATE:
${structuredQandA || "No Q&A turns recorded."}

Provide the complete interview diagnostic evaluation following the strict validation and scoring rules.`;

      let rawEvalJson: any = null;
      let modelUsed: string | undefined = undefined;

      try {
        const { text: rawText, modelUsed: usedModel } = await callGeminiWithFallback(apiKey, systemPrompt, userPrompt);
        modelUsed = usedModel;
        const cleaned = cleanJsonResponse(rawText);
        rawEvalJson = JSON.parse(cleaned);
      } catch (aiErr: any) {
        console.warn("AI evaluation model failed or returned malformed output, falling back to deterministic evaluation:", aiErr.message);
      }

      // Backend independent validation & strict score enforcement (failsafe against prompt deviations or malformed outputs)
      const finalEvaluation = rawEvalJson 
        ? enforceEvaluationRules(rawEvalJson, conversation || [])
        : generateFallbackEvaluation(conversation || []);

      return NextResponse.json({ success: true, evaluation: finalEvaluation, modelUsed });
    }

    return NextResponse.json({ success: false, error: "Invalid action parameter" }, { status: 400 });

  } catch (err: any) {
    console.error("Mock-HR Route uncaught error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}