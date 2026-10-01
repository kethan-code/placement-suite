import { NextResponse } from "next/server";
import { POST as mockHrPost } from "@/app/api/mock-hr/route";

export const dynamic = "force-dynamic";

/**
 * Dedicated route handler for interview turn intent classification and follow-up generation.
 * Accepts direct { currentQuestion, transcript, apiKey, ... } or wraps into the turn action.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Normalize payload to mock-hr turn schema if needed
    const normalizedPayload = {
      action: "turn",
      conversation: body.conversation || [],
      candidateAnswer: body.transcript || body.candidateAnswer || "",
      jobRole: body.jobRole || "GeneralCampusPlacement",
      persona: body.persona || "balanced",
      sessionQuestions: body.sessionQuestions || (body.currentQuestion ? [body.currentQuestion] : []),
      recentQuestions: body.recentQuestions || [],
      apiKey: body.apiKey
    };

    const simulatedReq = new Request(req.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizedPayload)
    });

    return await mockHrPost(simulatedReq);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
