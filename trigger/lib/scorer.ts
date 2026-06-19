import { z } from "zod";
import type { QualificationResult } from "../types/lead.js";

const QualificationResultSchema = z.object({
  score: z.number().min(0).max(100),
  grade: z.enum(["A", "B", "C", "D"]),
  summary: z.string(),
  strengths: z.array(z.string()).default([]),
  watchouts: z.array(z.string()).default([]),
  fit: z.number().min(0).max(10),
  intent: z.number().min(0).max(10),
  budget: z.number().min(0).max(10),
  urgency: z.number().min(0).max(10),
  recommendedAction: z.string(),
  nextSteps: z.array(z.string()).default([]),
  flags: z.array(z.string()),
});

export function computeOverallScore(
  fit: number,
  intent: number,
  budget: number,
  urgency: number,
): number {
  return Math.round(((fit + intent + budget + urgency) / 40) * 100);
}

export function gradeFromScore(score: number): QualificationResult["grade"] {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 45) return "C";
  return "D";
}

export function validateResult(raw: unknown): QualificationResult {
  const parsed = QualificationResultSchema.parse(raw);
  const score = computeOverallScore(parsed.fit, parsed.intent, parsed.budget, parsed.urgency);
  const grade = gradeFromScore(score);

  return {
    ...parsed,
    score,
    grade,
  };
}
