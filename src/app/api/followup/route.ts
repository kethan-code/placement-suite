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
    const { originalQuestion, userTranscript, apiKey } = await req.json();

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ success: false, error: 'API key missing.' }, { status: 401 });
    }

    if (!originalQuestion || !userTranscript) {
      return NextResponse.json({ success: false, error: 'Question or transcript missing.' }, { status: 400 });
    }

    const systemPrompt = `You are a sharp, analytical technical interviewer. The candidate was asked: "${originalQuestion}". 
Here is the transcript of their 2-minute answer: "${userTranscript}".

Task: Generate ONE challenging follow-up question based EXACTLY on what they just said. 
- If they mentioned a specific technology, ask why they didn't use an alternative.
- If their result was vague, ask them to clarify the exact metrics.
- If they blamed a teammate, ask how they could have prevented the breakdown earlier.

Rule: Keep the question under 25 words. Make it direct and conversational. Return strictly as JSON: { "followUpQuestion": "string" }`;

    let lastErrorMsg = 'All model attempts failed.';

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        const response = await fetch(url, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
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
          return NextResponse.json({ 
            success: true, 
            followUpQuestion: resultJson.followUpQuestion || "Could you elaborate on the specific metrics and key trade-offs of your decision?",
            modelUsed: model 
          });
        }

        lastErrorMsg = data.error?.message || `Status ${response.status}`;
      } catch (err: any) {
        lastErrorMsg = err.message;
      }
    }

    // Fallback if API fails
    return NextResponse.json({ 
      success: true, 
      followUpQuestion: "Could you walk me through the specific metrics you used to measure that outcome?",
      modelUsed: 'fallback' 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
