import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeOverallScore,
  gradeFromScore,
  validateResult,
} from "../lib/scorer.js";

describe("computeOverallScore", () => {
  it("averages the four dimensions onto a 0-100 scale", () => {
    assert.equal(computeOverallScore(8, 9, 6, 8), 78);
  });
});

describe("gradeFromScore", () => {
  it("maps 79 to B and 80 to A", () => {
    assert.equal(gradeFromScore(79), "B");
    assert.equal(gradeFromScore(80), "A");
  });
});

describe("validateResult", () => {
  it("recomputes score and grade from sub-scores", () => {
    const result = validateResult({
      summary: "Test",
      strengths: ["Strong intent"],
      watchouts: ["Budget thin for scope"],
      fit: 8,
      intent: 9,
      budget: 6,
      urgency: 8,
      score: 99,
      grade: "A",
      recommendedAction: "Schedule discovery call.",
      nextSteps: ["Confirm budget"],
      flags: [],
    });

    assert.equal(result.score, 78);
    assert.equal(result.grade, "B");
  });
});
