import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { summary, totalMonthlySavings, totalAnnualSavings, useCase, teamSize } =
      await req.json();

    const prompt = `You are a financial advisor specializing in AI tool optimization for startups and engineering teams.

A user has completed an AI spend audit. Here are their results:
- Team size: ${teamSize}
- Primary use case: ${useCase}
- Potential monthly savings: $${totalMonthlySavings}
- Potential annual savings: $${totalAnnualSavings}
- Audit summary: ${summary}

Write a personalized 100-word summary paragraph for this user. Be specific, encouraging, and actionable. 
Mention their exact savings figures. Reference their use case. End with one concrete next step.
Do not use bullet points. Write in second person ("you"). Be direct and confident, not salesy.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("Anthropic API error:", error);
    // Fallback to templated summary
    return NextResponse.json({
      summary: null,
      error: "API unavailable",
    });
  }
}