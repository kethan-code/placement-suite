import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

async function callGeminiWithFallback(apiKey: string, systemPrompt: string, userPrompt: string) {
  let lastError = 'All candidate models failed.';
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
        return { text: data.candidates[0].content.parts[0].text, modelUsed: model };
      }
      lastError = data.error?.message || `Status ${response.status}`;
      console.warn(`Mock-HR model ${model} unavailable (${lastError}). Trying fallback...`);
    } catch (err: any) {
      lastError = err.message;
      console.warn(`Mock-HR error on model ${model}:`, err.message);
    }
  }
  throw new Error(`Service temporarily busy across all candidate models. (${lastError})`);
}

export async function POST(req: Request) {
  try {
    const { action, conversation, candidateAnswer, jobRole, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key is missing. Please reconnect it.' }, { status: 401 });
    }

    if (action === 'turn') {
      const systemPrompt = `You are a professional HR interviewer conducting a realistic 2-way job interview for a ${jobRole || 'Campus Placement Candidate'}.
Your task is to ask sharp, realistic, and relevant follow-up questions based on the candidate's last answer.
Keep your response concise (1 to 3 sentences maximum) so that it can be spoken out loud clearly via Text-To-Speech.
Respond ONLY with a valid JSON object matching this schema:
{
  "interviewerReaction": "Short natural acknowledging comment (e.g. 'That makes sense.', 'Thank you for sharing that.')",
  "followUpQuestion": "The next clear follow-up interview question to ask the candidate.",
  "isFinalTurn": false
}`;

      const historyFormatted = (conversation || [])
        .map((c: any) => `${c.speaker === 'interviewer' ? 'Interviewer' : 'Candidate'}: "${c.text}"`)
        .join('\n');

      const userPrompt = `Interview History:\n${historyFormatted}\n\nCandidate's latest answer: "${candidateAnswer}"\n\nGenerate the next follow-up question.`;

      const { text: rawText, modelUsed } = await callGeminiWithFallback(apiKey, systemPrompt, userPrompt);

      let cleaned = rawText.trim();
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      const resultJson = JSON.parse(cleaned);

      const spokenText = `${resultJson.interviewerReaction} ${resultJson.followUpQuestion}`;

      // Step 2: Generate TTS Audio using Gemini Audio output or fallback audio generator
      let audioBase64 = null;
      for (const ttsModel of ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']) {
        try {
          const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/${ttsModel}:generateContent?key=${apiKey}`;
          const ttsRes = await fetch(ttsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [{ text: `Speak the following text aloud with a professional HR interviewer tone: "${spokenText}"` }]
              }],
              generationConfig: {
                responseMimeType: 'audio/mp3'
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
          console.warn(`TTS generation error on model ${ttsModel}:`, ttsErr);
        }
      }

      return NextResponse.json({ success: true, turn: resultJson, audioBase64, modelUsed });
    }

    if (action === 'evaluate') {
      const systemPrompt = `You are a Senior Talent Acquisition Manager evaluating a candidate's complete 2-way HR interview.
Analyze the candidate's communication style, confidence, technical/behavioral depth, and relevance.
Respond ONLY with a valid JSON object matching this schema:
{
  "overallScore": 8.5,
  "scores": {
    "communication": 8,
    "confidence": 9,
    "problemSolving": 8,
    "behavioralFit": 9
  },
  "feedbackSummary": "Comprehensive 3-4 sentence performance summary.",
  "strengths": ["Strong articulate answers", "Good STAR structure"],
  "areasForImprovement": ["Can be more concise in technical details"],
  "proTipForNextInterview": "One actionable high-impact tip."
}`;

      const historyFormatted = (conversation || [])
        .map((c: any) => `${c.speaker === 'interviewer' ? 'Interviewer' : 'Candidate'}: "${c.text}"`)
        .join('\n');

      const userPrompt = `Target Job Role: ${jobRole}\nFull Interview Transcript:\n${historyFormatted}\n\nProvide the complete interview diagnostic evaluation.`;

      const { text: rawText, modelUsed } = await callGeminiWithFallback(apiKey, systemPrompt, userPrompt);

      let cleaned = rawText.trim();
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      const evalJson = JSON.parse(cleaned);

      return NextResponse.json({ success: true, evaluation: evalJson, modelUsed });
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
