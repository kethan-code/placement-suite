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
    const { competency, randomSeed, apiKey } = await req.json();

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ success: false, error: 'API key missing.' }, { status: 401 });
    }

    const seed = randomSeed || Math.random();

    const systemPrompt = `You are an expert tech interviewer. Generate a highly specific, B.Tech student-level behavioral interview scenario focused EXCLUSIVELY on the category: "${competency}".

RANDOMIZATION SEED: ${seed}
Use this seed to radically change the environment, the problem, and the characters involved. 

CRITICAL RULE: NEVER use the same plot structure twice. Do NOT always use a hackathon, a capstone project, or a team member "ghosting." 

Depending on the random seed, force the setting to be one of the following radically different environments:
1. An everyday college group assignment (e.g., lab work, presentation).
2. A part-time tech internship or freelance gig.
3. An open-source contribution or online community project.
4. A conflict with a professor or mentor regarding a technical choice.

For "${competency}", ensure the core challenge is completely unique. For example, if Leadership & Ownership, do NOT just make someone step down. Instead, make the user have to pitch a new idea to a hostile group, or take charge of a project where everyone is doing the wrong task, or volunteer for something they have no experience in. 

Make it feel like a completely new story every single time.

Also write a perfect 'Model Answer' story as if a top-tier student is answering the question. The model answer MUST be broken down exactly into Situation, Task, Action, and Result. Output strictly valid JSON matching this schema:
{
  "scenarioContext": "string",
  "actualQuestion": "string",
  "modelAnswer": {
    "S": "string (1-2 sentences setting the scene)",
    "T": "string (1-2 sentences defining the goal)",
    "A": "string (Detailed story of the specific actions taken)",
    "R": "string (The final positive outcome and metric)"
  }
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
