import { task, logger } from "@trigger.dev/sdk/v3";
import { generateOpportunityMap } from "../lib/opportunity-map-agent.js";
import { fetchWebsiteContext } from "../lib/website.js";
import type { OpportunityMapTaskInput } from "../types/opportunity-map.js";

export const generateOpportunityMapTask = task({
  id: "generate-opportunity-map",
  maxDuration: 120,
  run: async (payload: OpportunityMapTaskInput) => {
    logger.info("Opportunity map payload", {
      companyName: payload.lead.companyName,
      conversationLength: payload.conversation.length,
    });

    const website = await fetchWebsiteContext(payload.lead.websiteUrl);
    const websiteText = website.ok ? website.text : payload.websiteText;

    const result = await generateOpportunityMap({
      ...payload,
      websiteText,
    });

    logger.info("Opportunity map result", { result });
    return result;
  },
});
