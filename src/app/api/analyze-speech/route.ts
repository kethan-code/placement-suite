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
    const { transcript, topic, durationSeconds, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key is missing. Please reconnect it.' }, { status: 401 });
    }
    if (!transcript) {
      return NextResponse.json({ success: false, error: 'Transcript is empty. Please speak into the mic.' }, { status: 400 });
    }

    const systemPrompt = `Evaluate this 60-second Just A Minute (JAM) speech. Respond ONLY with a valid JSON object matching this schema:
    { 
      "overallScore": 8, 
      "scores": { "fluency": 8, "grammar": 8, "relevance": 8, "vocabulary": 8 }, 
      "feedback": "2-3 sentences evaluating the speech.", 
      "primaryWeakness": "Fluency", 
      "fillerWordsDetected": ["um", "uh"], 
      "strengths": ["Clear voice"], 
      "areasForImprovement": ["Pacing"], 
      "improvedSampleSnippet": "An example of better phrasing." 
    }`;

    const userPrompt = `Topic: "${topic}"\nDuration: ${durationSeconds}s\nTranscript: "${transcript}"`;

    let lastErrorMsg = 'All model attempts failed.';

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: { responseMimeType: 'application/json' }
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
          return NextResponse.json({ success: true, analysis: resultJson, modelUsed: model });
        }

        lastErrorMsg = data.error?.message || `Status ${response.status}`;
        console.warn(`Model ${model} unavailable (${lastErrorMsg}). Retrying fallback...`);
      } catch (err: any) {
        lastErrorMsg = err.message;
        console.warn(`Error calling model ${model}:`, err.message);
      }
    }

    return NextResponse.json({ success: false, error: `Model overloaded. Last error: ${lastErrorMsg}` }, { status: 503 });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}




