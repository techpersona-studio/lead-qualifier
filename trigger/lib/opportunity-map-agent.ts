import { completeJson, parseJsonResponse } from "./agent-runner.js";
import { validateOpportunityMap } from "./opportunity-scorer.js";
import { SYSTEM_PROMPT, buildUserMessage } from "../prompts/opportunity-map.js";
import type { OpportunityMap, OpportunityMapTaskInput } from "../types/opportunity-map.js";

export async function generateOpportunityMap(
  input: OpportunityMapTaskInput,
): Promise<OpportunityMap> {
  const userMessage = buildUserMessage(input);
  const text = await completeJson(SYSTEM_PROMPT, userMessage);
  const raw = parseJsonResponse<unknown>(text);
  const validated = validateOpportunityMap(raw);
  return validated;
}
