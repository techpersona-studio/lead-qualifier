import { completeJson, parseJsonResponse } from "./agent-runner.js";
import { summarizeConversation } from "./conversation-summarizer.js";
import { validateOpportunityMap } from "./opportunity-scorer.js";
import { SYSTEM_PROMPT, buildUserMessage } from "../prompts/opportunity-map.js";
import type { OpportunityMap, OpportunityMapTaskInput } from "../types/opportunity-map.js";

export async function generateOpportunityMap(
  input: OpportunityMapTaskInput,
): Promise<OpportunityMap> {
  const conversationSummary = await summarizeConversation(input.conversation);
  const userMessage = buildUserMessage({
    ...input,
    conversationSummary,
  });
  const text = await completeJson(SYSTEM_PROMPT, userMessage, "reasoning");
  const raw = parseJsonResponse<unknown>(text);
  const validated = validateOpportunityMap(raw);
  return validated;
}
