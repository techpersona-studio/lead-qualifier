import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { LeadFormData, QualificationResult } from "../types/lead";

const SYSTEM_PROMPT = `You are an expert B2B sales qualification assistant. Analyze the lead below and return a JSON object matching the schema exactly.

Evaluate the lead across four dimensions:
1. Fit — Does this lead match a typical B2B SaaS buyer?
2. Intent — How strong is the buying signal?
3. Budget — Is the budget range realistic?
4. Urgency — How time-sensitive is the need?

Return ONLY valid JSON. No prose, no markdown, no explanation outside the JSON. Schema:
{
  "score": number (0-100),
  "grade": "A" | "B" | "C" | "D",
  "summary": string,
  "fit": number (0-10),
  "intent": number (0-10),
  "budget": number (0-10),
  "urgency": number (0-10),
  "recommendedAction": string,
  "flags": string[]
}`;

function buildUserMessage(lead: LeadFormData): string {
  return `Company: ${lead.companyName}
Contact: ${lead.contactName}
Industry: ${lead.industry}
Company size: ${lead.companySize}
Budget range: ${lead.budgetRange}
Use case: ${lead.useCase}
${lead.websiteUrl ? `Website: ${lead.websiteUrl}` : ""}`.trim();
}

async function qualifyWithClaude(lead: LeadFormData): Promise<string> {
  const client = new Anthropic();
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(lead) }],
  });
  return message.content[0].type === "text" ? message.content[0].text : "";
}

async function qualifyWithGPT4o(lead: LeadFormData): Promise<string> {
  const client = new OpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1024,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(lead) },
    ],
  });
  return response.choices[0].message.content ?? "";
}

export async function qualifyLead(lead: LeadFormData): Promise<QualificationResult> {
  const text = process.env.ANTHROPIC_API_KEY
    ? await qualifyWithClaude(lead)
    : await qualifyWithGPT4o(lead);
  return JSON.parse(text) as QualificationResult;
}
