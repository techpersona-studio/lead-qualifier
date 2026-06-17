import { task, logger } from "@trigger.dev/sdk/v3";
import { qualifyLead } from "../lib/claude";
import { validateResult } from "../lib/scorer";
import { fetchWebsiteContext } from "../lib/website";
import type { LeadFormData, QualificationResult } from "../types/lead";

export const qualifyLeadTask = task({
  id: "qualify-lead",
  maxDuration: 60,
  run: async (payload: LeadFormData): Promise<QualificationResult> => {
    // Scrape the lead's website first so the model sees what the business
    // actually does, instead of guessing from form fields alone.
    const website = await fetchWebsiteContext(payload.websiteUrl);
    if (payload.websiteUrl) {
      logger.info("Website fetch", { url: payload.websiteUrl, ok: website.ok });
    }

    const raw = await qualifyLead(payload, website.ok ? website.text : undefined);
    return validateResult(raw);
  },
});
