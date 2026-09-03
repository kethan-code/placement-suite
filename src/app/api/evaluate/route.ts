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
    const { transcript, timings, apiKey } = await req.json();

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ success: false, error: 'API key missing.' }, { status: 401 });
    }

    if (!transcript) {
      return NextResponse.json({ success: false, error: 'Transcript missing.' }, { status: 400 });
    }

    const systemPrompt = `You are a ruthless but constructive tier-1 technical interviewer. Analyze the provided interview transcript and timing data.

You must output a JSON object with:
1. "overallScore": number (0 to 100).
2. "breakdown": {
    "Situation": { "score": number (0-10), "outOf": 10 },
    "Task": { "score": number (0-10), "outOf": 10 },
    "Action": { "score": number (0-20), "outOf": 20 },
    "Result": { "score": number (0-20), "outOf": 20 },
    "Ownership": { "score": number (0-10), "outOf": 10 },
    "Specificity": { "score": number (0-10), "outOf": 10 },
    "Communication": { "score": number (0-10), "outOf": 10 }
  }
3. "feedback": {
    "biggestImprovement": string (1 sentence),
    "whatWorked": string (1 sentence),
    "tryAgain": string (1 sentence)
  }
4. "coverage": {
    "S_score": number (0-100),
    "T_score": number (0-100),
    "A_score": number (0-100),
    "R_score": number (0-100)
  }
5. "pacingWarning": string or null
6. "warnings": array of { type: string, message: string }

Check for these specific failures:
1. Team Language: If the user says "we" frequently during the Action phase instead of "I".
2. Weak Result: If the final sentences lack measurable outcomes, metrics, or concrete learnings.
3. Vague Action: If the transcript lacks specific technical decisions, obstacles faced, or concrete steps.
4. Time Mismanagement: If the 'S' or 'T' timing exceeds 20 seconds, or if 'A' is less than 50 seconds.

Output format:
{
  "overallScore": 82,
  "breakdown": {
    "Situation": { "score": 8, "outOf": 10 },
    "Task": { "score": 9, "outOf": 10 },
    "Action": { "score": 18, "outOf": 20 },
    "Result": { "score": 13, "outOf": 20 },
    "Ownership": { "score": 9, "outOf": 10 },
    "Specificity": { "score": 8, "outOf": 10 },
    "Communication": { "score": 9, "outOf": 10 }
  },
  "feedback": {
    "biggestImprovement": "Your actions were clear, but the result wasn't quantified.",
    "whatWorked": "You clearly explained what you personally owned rather than describing what the team did.",
    "tryAgain": "Add a measurable outcome and explain how you knew the solution worked."
  },
  "coverage": {
    "S_score": 100,
    "T_score": 80,
    "A_score": 95,
    "R_score": 30
  },
  "pacingWarning": "Your answer spent a lot of time describing the situation. Your Result section was heavily truncated. Interviewers need to hear the concrete impact of your work.",
  "warnings": [
    { "type": "Too much team language", "message": "You said 'we' 6 times. Try emphasizing what you personally did." }
  ]
}`;

    const timingStr = timings 
      ? `Timings -> S: ${timings.S ?? 0}s, T: ${timings.T ?? 0}s, A: ${timings.A ?? 0}s, R: ${timings.R ?? 0}s` 
      : 'Timings not explicitly broken down.';

    const userPrompt = `Transcript: "${transcript}"\n${timingStr}`;

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
          return NextResponse.json({ 
            success: true, 
            overallScore: resultJson.overallScore || 82,
            breakdown: resultJson.breakdown || {
              "Situation": { "score": 8, "outOf": 10 },
              "Task": { "score": 9, "outOf": 10 },
              "Action": { "score": 18, "outOf": 20 },
              "Result": { "score": 13, "outOf": 20 },
              "Ownership": { "score": 9, "outOf": 10 },
              "Specificity": { "score": 8, "outOf": 10 },
              "Communication": { "score": 9, "outOf": 10 }
            },
            feedback: resultJson.feedback || {
              biggestImprovement: "Your actions were clear, but the result wasn't quantified.",
              whatWorked: "You clearly explained what you personally owned rather than describing what the team did.",
              tryAgain: "Add a measurable outcome and explain how you knew the solution worked."
            },
            warnings: resultJson.warnings || [],
            coverage: resultJson.coverage || { S_score: 100, T_score: 80, A_score: 95, R_score: 40 },
            pacingWarning: resultJson.pacingWarning || null,
            modelUsed: model 
          });
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
