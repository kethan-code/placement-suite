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
    const { transcript, question, apiKey } = await req.json();

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ success: false, error: 'API key missing.' }, { status: 401 });
    }

    if (!transcript) {
      return NextResponse.json({ success: false, error: 'Transcript missing.' }, { status: 400 });
    }

    const systemPrompt = `You are an expert technical interview coach. Take the candidate's actual recorded interview transcript and transform it into a polished, high-impact STAR response (Situation, Task, Action, Result).

CRITICAL MANDATE: PRESERVE THE USER'S ACTUAL EXPERIENCE. Do NOT invent fake achievements, technologies, company names, or fabricated metric numbers that the user did not mention or imply. Only restructure their existing facts, replace passive/team language ("we") with active personal ownership ("I"), organize their narrative into clear STAR phases, and highlight 55% of the story on concrete personal Actions.

Output strictly valid JSON matching this schema:
{
  "situation": "string (1-2 sentences scene setting strictly based on candidate's words)",
  "task": "string (1-2 sentences setting the personal goal/obstacle strictly based on candidate's words)",
  "action": "string (Detailed active steps using 'I' instead of 'we', spending 55% of the response detail on specific personal decisions)",
  "result": "string (Outcome and metrics stated or implied by candidate)",
  "keyImprovements": ["string (e.g. Converted team language 'we' into personal action 'I')", "string (e.g. Structured narrative cleanly into STAR phases)"]
}`;

    const userPrompt = `Question: "${question || 'Behavioral Question'}"\nCandidate's Recorded Transcript: "${transcript}"`;

    let lastErrorMsg = 'All model attempts failed.';

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        const response = await fetch(url, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7
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
          return NextResponse.json({ success: true, improvedAnswer: resultJson, modelUsed: model });
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
