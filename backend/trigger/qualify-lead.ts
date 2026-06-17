import { task, logger } from "@trigger.dev/sdk/v3";
import { qualifyLead } from "../lib/claude.js";
import { validateResult } from "../lib/scorer.js";
import { fetchWebsiteContext } from "../lib/website.js";
import type { LeadFormData, QualificationResult } from "../types/lead.js";

export const qualifyLeadTask = task({
  id: "qualify-lead",
  maxDuration: 60,
  run: async (payload: LeadFormData): Promise<QualificationResult> => {
    logger.info("Lead payload", { payload });

    // Scrape the lead's website first so the model sees what the business
    // actually does, instead of guessing from form fields alone.
    const website = await fetchWebsiteContext(payload.websiteUrl);
    if (payload.websiteUrl) {
      logger.info("Website fetch result", {
        url: payload.websiteUrl,
        ok: website.ok,
        length: website.text.length,
        text: website.text,
      });
    }

    const raw = await qualifyLead(payload, website.ok ? website.text : undefined);
    const validated = validateResult(raw);
    logger.info("Validated result", { result: validated });
    return validated;
  },
});
