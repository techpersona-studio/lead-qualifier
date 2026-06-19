import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import OpenAI from "openai";
import { logger } from "@trigger.dev/sdk/v3";

export type ModelTier = "cheap" | "reasoning";

const MODELS = {
  cheap: {
    claude: "anthropic.claude-haiku-4-5",
    openai: "gpt-4o-mini",
    maxTokens: 4096,
  },
  reasoning: {
    claude: "anthropic.claude-sonnet-4-6",
    openai: "gpt-4o-mini",
    maxTokens: 2048,
  },
} as const;

function useClaude(): boolean {
  return !!(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE);
}

export async function completeText(
  systemPrompt: string,
  userMessage: string,
  tier: ModelTier = "reasoning",
): Promise<string> {
  const config = MODELS[tier];

  if (useClaude()) {
    const client = new AnthropicBedrock();
    logger.info("LLM request (Claude)", {
      tier,
      model: config.claude,
      systemPrompt,
      userMessage,
    });

    const message = await client.messages.create({
      model: config.claude,
      max_tokens: config.maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const output = message.content[0].type === "text" ? message.content[0].text : "";
    logger.info("LLM response (Claude)", { tier, rawOutput: output, usage: message.usage });
    return output;
  }

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
