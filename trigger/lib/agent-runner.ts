import OpenAI from "openai";
import { logger } from "@trigger.dev/sdk/v3";

export type ModelTier = "cheap" | "reasoning";

const MODELS = {
  cheap: {
    openai: "gpt-4o-mini",
    maxTokens: 4096,
  },
  reasoning: {
    openai: "gpt-4o-mini",
    maxTokens: 2048,
  },
} as const;

export async function completeText(
  systemPrompt: string,
  userMessage: string,
  tier: ModelTier = "reasoning",
): Promise<string> {
  const config = MODELS[tier];
  const client = new OpenAI();

  logger.info("LLM request (OpenAI)", {
    tier,
    model: config.openai,
    systemPrompt,
    userMessage,
  });

  const response = await client.chat.completions.create({
    model: config.openai,
    max_tokens: config.maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const output = response.choices[0].message.content ?? "";
  logger.info("LLM response (OpenAI)", { tier, rawOutput: output, usage: response.usage });
  return output;
}

export async function completeJson(
  systemPrompt: string,
  userMessage: string,
  tier: ModelTier = "reasoning",
): Promise<string> {
  return completeText(systemPrompt, userMessage, tier);
}

export function parseJsonResponse<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    logger.error("LLM output was not valid JSON", { rawOutput: text });
    throw err;
  }
}
