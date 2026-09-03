import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

export async function POST(req: Request) {
  try {
    const { competency, difficulty = 'Medium', randomSeed, apiKey } = await req.json();

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ success: false, error: 'API key missing.' }, { status: 401 });
    }

    const seed = randomSeed || Math.random();

    const systemPrompt = `You are an expert tech interviewer. Generate a highly specific, B.Tech student-level behavioral interview scenario focused EXCLUSIVELY on: "${competency}".

DIFFICULTY LEVEL: ${difficulty}
You must strictly adapt the complexity of the scenario based on this difficulty:
- EASY: Clear scenario + obvious responsibility (e.g., a simple disagreement on a class presentation, managing time for midterms).
- MEDIUM: Ambiguous situation + competing priorities (e.g., a hackathon deadline, a failing club event, integrating APIs in a group project with uncooperative peers).
- HARD: Messy situation + incomplete information + stakeholder conflict (e.g., a catastrophic database failure during an internship, severe ethical dilemmas with a professor/manager, leading a hostile cross-functional team under extreme technical debt).
- EXPERT: High-stakes chaos + unexpected interviewer follow-up probes (e.g., severe multi-team breakdown, unannounced architecture failure, hostile lead review). Generate 2 sharp, realistic follow-up questions an interviewer would ask after the candidate answers (e.g., "Why didn't you ask your manager for help?", "What would you do differently?").

RANDOMIZATION SEED: ${seed}
(Ensure the environment is completely unique based on this seed).

CRITICAL RULE: Generate 4 specific evaluation keywords (e.g., 'Initiative', 'Ownership', 'Decision-making', 'Impact') that an interviewer would look for in this specific scenario. Return them in the evaluatingMetrics array.

CRITICAL RULE: NEVER use the same plot structure twice. Do NOT always use a hackathon, a capstone project, or a team member "ghosting." 

Depending on the random seed, force the setting to be one of the following radically different environments:
1. An everyday college group assignment (e.g., lab work, presentation).
2. A part-time tech internship or freelance gig.
3. An open-source contribution or online community project.
4. A conflict with a professor or mentor regarding a technical choice.

For "${competency}", ensure the core challenge is completely unique.

Make it feel like a completely new story every single time.

Also write a perfect 'Model Answer' story as if a top-tier student is answering the question. The model answer MUST be broken down exactly into Situation, Task, Action, and Result. Output strictly valid JSON matching this schema:
{
  "scenarioContext": "string",
  "actualQuestion": "string",
  "evaluatingMetrics": ["Initiative", "Ownership", "Decision-making", "Impact"],
  "followUpQuestions": ["string (e.g. Why didn't you ask your manager for help?)", "string (e.g. What would you do differently?)"],
  "modelAnswer": {
    "S": "string (1-2 sentences setting the scene)",
    "T": "string (1-2 sentences defining the goal)",
    "A": "string (Detailed story of the specific actions taken)",
    "R": "string (The final positive outcome and metric)"
  },
  "whyItWorks": "string (A 1-2 sentence explanation of why this answer succeeds, focusing on the action phase or outcome)"
}`;

    let lastErrorMsg = 'All model attempts failed.';

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        const response = await fetch(url, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.85
            }
          })
        });

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = data.candidates[0].content.parts[0].text;
          let cleaned = rawText.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
          }

          const resultJson = JSON.parse(cleaned);
          return NextResponse.json({ success: true, scenario: resultJson, modelUsed: model });
        }

        lastErrorMsg = data.error?.message || `Status ${response.status}`;
      } catch (err: any) {
        lastErrorMsg = err.message;
      }
    }

    return NextResponse.json({ success: false, error: lastErrorMsg }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
