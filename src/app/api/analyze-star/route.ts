import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { transcript, question, durationSeconds, apiKey } = await req.json();

    if (!apiKey) return NextResponse.json({ error: 'API key missing.' }, { status: 401 });
    if (!transcript) return NextResponse.json({ error: 'Transcript empty.' }, { status: 400 });

    const systemPrompt = `Evaluate this behavioral interview answer using the STAR method. Respond ONLY with a valid JSON object matching this schema:
    { "overallScore": 8, "starScores": { "situation": 8, "task": 8, "action": 8, "result": 8 }, "feedback": "2 sentences evaluating the answer.", "missingElements": ["string"], "strengths": ["string"], "idealAnswerSnippet": "string" }`;

    const userPrompt = `Question: "${question}"\nDuration: ${durationSeconds}s\nTranscript: "${transcript}"`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message || 'Failed to reach Gemini' }, { status: response.status });

    const rawText = data.candidates[0].content.parts[0].text;
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    }

    const resultJson = JSON.parse(cleaned);
    return NextResponse.json({ success: true, analysis: resultJson });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}




