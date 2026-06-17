import { z } from "zod";
import type { QualificationResult } from "../types/lead";

const QualificationResultSchema = z.object({
  score: z.number().min(0).max(100),
  grade: z.enum(["A", "B", "C", "D"]),
  summary: z.string(),
  fit: z.number().min(0).max(10),
  intent: z.number().min(0).max(10),
  budget: z.number().min(0).max(10),
  urgency: z.number().min(0).max(10),
  recommendedAction: z.string(),
  nextSteps: z.array(z.string()).default([]),
  flags: z.array(z.string()),
});

export function validateResult(raw: unknown): QualificationResult {
  return QualificationResultSchema.parse(raw);
}
