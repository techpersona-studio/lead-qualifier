import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import OpenAI from "openai";
import { logger } from "@trigger.dev/sdk/v3";

export async function completeJson(systemPrompt: string, userMessage: string): Promise<string> {
  const useClaude = !!(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE);

  if (useClaude) {
    const client = new AnthropicBedrock();
    logger.info("LLM request (Claude)", {
      model: "anthropic.claude-sonnet-4-6",
      systemPrompt,
      userMessage,
    });

    const message = await client.messages.create({
      model: "anthropic.claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const output = message.content[0].type === "text" ? message.content[0].text : "";
    logger.info("LLM response (Claude)", { rawOutput: output, usage: message.usage });
    return output;
  }

  const client = new OpenAI();
  logger.info("LLM request (GPT-4o)", {
    model: "gpt-4o-mini",
    systemPrompt,
    userMessage,
  });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const output = response.choices[0].message.content ?? "";
  logger.info("LLM response (GPT-4o)", { rawOutput: output, usage: response.usage });
  return output;
}

export function parseJsonResponse<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    logger.error("LLM output was not valid JSON", { rawOutput: text });
    throw err;
  }
}
