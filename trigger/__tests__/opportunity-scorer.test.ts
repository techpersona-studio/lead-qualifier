import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { finalizeOpportunityMap, gradeFromIceScore } from "../lib/opportunity-scorer.js";

describe("gradeFromIceScore", () => {
  it("returns A for scores at or above 8.0", () => {
    assert.equal(gradeFromIceScore(8.0), "A");
  });

  it("returns B for scores from 6.5 to 7.9", () => {
    assert.equal(gradeFromIceScore(7.0), "B");
  });
});

describe("finalizeOpportunityMap", () => {
  it("computes iceScore, grade, and rank from sub-scores and sorts descending", () => {
    const result = finalizeOpportunityMap({
      summary: "Test summary",
      client: {
        businessName: "Acme",
        websiteUrl: null,
        statedGoals: ["Grow"],
      },
      recommendedFirstMove: "Start with booking automation",
      opportunities: [
        {
          title: "Lower priority",
          problem: "Problem B",
          proposedService: "Service B",
          expectedOutcome: "Outcome B",
          impact: 5,
          confidence: 5,
          ease: 5,
          effort: "2 weeks",
          risks: "Low adoption",
          nextAction: "Confirm scope",
        },
        {
          title: "Top priority",
          problem: "Problem A",
          proposedService: "Service A",
          expectedOutcome: "Outcome A",
          impact: 9,
          confidence: 8,
          ease: 7,
          effort: "1 week",
          risks: "None",
          nextAction: "Book kickoff",
        },
      ],
      flags: [],
    });

    assert.equal(result.opportunities[0].title, "Top priority");
    assert.equal(result.opportunities[0].rank, 1);
    assert.equal(result.opportunities[0].iceScore, 8);
    assert.equal(result.opportunities[0].grade, "A");
    assert.equal(result.opportunities[1].rank, 2);
  });
});
