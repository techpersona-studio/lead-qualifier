import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import OpenAI from "openai";
import type { LeadFormData, QualificationResult } from "../types/lead";
import { SYSTEM_PROMPT, buildUserMessage } from "../prompts/lead-qualifier";

async function qualifyWithClaude(lead: LeadFormData, websiteText?: string): Promise<string> {
  const client = new AnthropicBedrock();
  const message = await client.messages.create({
    model: "anthropic.claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(lead, websiteText) }],
  });
  return message.content[0].type === "text" ? message.content[0].text : "";
}

async function qualifyWithGPT4o(lead: LeadFormData, websiteText?: string): Promise<string> {
  const client = new OpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1024,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(lead, websiteText) },
    ],
  });
  return response.choices[0].message.content ?? "";
}

export async function qualifyLead(
  lead: LeadFormData,
  websiteText?: string,
): Promise<QualificationResult> {
  const text = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE
    ? await qualifyWithClaude(lead, websiteText)
    : await qualifyWithGPT4o(lead, websiteText);
  return JSON.parse(text) as QualificationResult;
}
