export interface LeadFormData {
  companyName: string;
  contactName: string;
  industry: string;
  companySize: string;
  budgetRange: string;
  useCase: string;
  websiteUrl?: string;
}

export interface QualificationResult {
  score: number;
  grade: "A" | "B" | "C" | "D";
  summary: string;
  fit: number;
  intent: number;
  budget: number;
  urgency: number;
  recommendedAction: string;
  flags: string[];
}
