import { task } from "@trigger.dev/sdk/v3";
import { qualifyLead } from "../lib/claude";
import { validateResult } from "../lib/scorer";
import type { LeadFormData, QualificationResult } from "../types/lead";

export const qualifyLeadTask = task({
  id: "qualify-lead",
  maxDuration: 60,
  run: async (payload: LeadFormData): Promise<QualificationResult> => {
    const raw = await qualifyLead(payload);
    return validateResult(raw);
  },
});
