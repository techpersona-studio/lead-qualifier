import { z } from "zod";
import type {
  OpportunityMap,
  OpportunityMapRaw,
  ScoredOpportunity,
} from "../types/opportunity-map.js";

const OpportunityRawSchema = z.object({
  title: z.string(),
  problem: z.string(),
  proposedService: z.string(),
  expectedOutcome: z.string(),
  impact: z.number().min(0).max(10),
  confidence: z.number().min(0).max(10),
  ease: z.number().min(0).max(10),
  effort: z.string(),
  risks: z.string(),
  nextAction: z.string(),
});

const OpportunityMapRawSchema = z.object({
  summary: z.string(),
  client: z.object({
    businessName: z.string(),
    websiteUrl: z.string().nullable(),
    statedGoals: z.array(z.string()),
  }),
  recommendedFirstMove: z.string(),
  opportunities: z.array(OpportunityRawSchema).min(1),
  flags: z.array(z.string()),
});

export function gradeFromIceScore(iceScore: number): ScoredOpportunity["grade"] {
  if (iceScore >= 8.0) return "A";
  if (iceScore >= 6.5) return "B";
  if (iceScore >= 4.5) return "C";
  return "D";
}

export function computeIceScore(impact: number, confidence: number, ease: number): number {
  return Math.round(((impact + confidence + ease) / 3) * 10) / 10;
}

export function scoreOpportunity(
  opportunity: z.infer<typeof OpportunityRawSchema>,
): ScoredOpportunity {
  const iceScore = computeIceScore(
    opportunity.impact,
    opportunity.confidence,
    opportunity.ease,
  );

  return {
    ...opportunity,
    iceScore,
    grade: gradeFromIceScore(iceScore),
    rank: 0,
  };
}

export function finalizeOpportunityMap(raw: unknown): OpportunityMap {
  const parsed = OpportunityMapRawSchema.parse(raw) as OpportunityMapRaw;
  const scored = parsed.opportunities
    .map(scoreOpportunity)
    .sort((a, b) => b.iceScore - a.iceScore)
    .map((opportunity, index) => ({
      ...opportunity,
      rank: index + 1,
    }));

  return {
    summary: parsed.summary,
    client: parsed.client,
    recommendedFirstMove: parsed.recommendedFirstMove,
    opportunities: scored,
    flags: parsed.flags,
  };
}

export function validateOpportunityMap(raw: unknown): OpportunityMap {
  return finalizeOpportunityMap(raw);
}
