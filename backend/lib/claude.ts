import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import OpenAI from "openai";
import { logger } from "@trigger.dev/sdk/v3";
import type { LeadFormData, QualificationResult } from "../types/lead";
import { SYSTEM_PROMPT, buildUserMessage } from "../prompts/lead-qualifier";

async function qualifyWithClaude(lead: LeadFormData, websiteText?: string): Promise<string> {
  const client = new AnthropicBedrock();
  const userMessage = buildUserMessage(lead, websiteText);

  // Log the exact text sent to the model so the prompt is auditable in the run view.
  logger.info("LLM request (Claude)", {
    model: "anthropic.claude-sonnet-4-6",
    systemPrompt: SYSTEM_PROMPT,
    userMessage,
  });

  const message = await client.messages.create({
    model: "anthropic.claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const output = message.content[0].type === "text" ? message.content[0].text : "";
  logger.info("LLM response (Claude)", { rawOutput: output, usage: message.usage });
  return output;
}

async function qualifyWithGPT4o(lead: LeadFormData, websiteText?: string): Promise<string> {
  const client = new OpenAI();
  const userMessage = buildUserMessage(lead, websiteText);

  logger.info("LLM request (GPT-4o)", {
    model: "gpt-4o-mini",
    systemPrompt: SYSTEM_PROMPT,
    userMessage,
  });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1024,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const output = response.choices[0].message.content ?? "";
  logger.info("LLM response (GPT-4o)", { rawOutput: output, usage: response.usage });
  return output;
}

export async function qualifyLead(
  lead: LeadFormData,
  websiteText?: string,
): Promise<QualificationResult> {
  const useClaude = !!(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE);
  const text = useClaude
    ? await qualifyWithClaude(lead, websiteText)
    : await qualifyWithGPT4o(lead, websiteText);

  // Parse defensively so a malformed model response shows up as a clear log,
  // not an opaque JSON.parse stack trace.
  try {
    const parsed = JSON.parse(text) as QualificationResult;
    logger.info("LLM parsed result", { result: parsed });
    return parsed;
  } catch (err) {
    logger.error("LLM output was not valid JSON", { rawOutput: text });
    throw err;
  }
}
