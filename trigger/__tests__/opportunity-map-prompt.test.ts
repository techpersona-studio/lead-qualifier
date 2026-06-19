import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildUserMessage } from "../prompts/opportunity-map.js";
import { buildSummaryUserMessage } from "../prompts/opportunity-map-summary.js";

const baseLead = {
  companyName: "Acme",
  contactName: "Jane",
  email: "jane@acme.com",
  industry: "SaaS",
  companySize: "11-50",
  budgetRange: "$5k-$10k",
  urgency: "Q3",
  useCase: "Automation",
  qualification: {
    score: 80,
    grade: "A",
    summary: "Strong fit",
    recommendedAction: "Book discovery call",
  },
};

describe("buildUserMessage", () => {
  it("includes the full call briefing without truncation", () => {
    const longBriefing = "x".repeat(25000);
    const message = buildUserMessage({
      lead: baseLead,
      conversationSummary: longBriefing,
    });

    assert.ok(message.includes(longBriefing));
    assert.ok(message.includes("BEGIN CALL BRIEFING"));
  });
});

describe("buildSummaryUserMessage", () => {
  it("includes the full conversation without truncation", () => {
    const longConversation = "Owner said: " + "y".repeat(30000);
    const message = buildSummaryUserMessage(longConversation);

    assert.ok(message.includes(longConversation));
    assert.ok(message.includes("BEGIN CALL CONVERSATION"));
  });
});
