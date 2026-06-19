import { logger } from "@trigger.dev/sdk/v3";
import { completeText } from "./agent-runner.js";
import {
  SUMMARY_SYSTEM_PROMPT,
  buildSummaryUserMessage,
} from "../prompts/opportunity-map-summary.js";

export async function summarizeConversation(conversation: string): Promise<string> {
  const trimmed = conversation.trim();
  if (!trimmed) {
    throw new Error("Conversation is required for opportunity map generation");
  }

  logger.info("Summarizing call conversation", { length: trimmed.length });

  const summary = await completeText(
    SUMMARY_SYSTEM_PROMPT,
    buildSummaryUserMessage(trimmed),
    "cheap",
  );

  logger.info("Call conversation summarized", {
    inputLength: trimmed.length,
    summaryLength: summary.length,
  });

  return summary.trim();
}
