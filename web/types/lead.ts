export interface LeadFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  industry: string;
  companySize: string;
  budgetRange: string;
  urgency: string;
  useCase: string;
  websiteUrl?: string;
}

export interface QualificationResult {
  score: number;
  grade: "A" | "B" | "C" | "D";
  summary: string;
  strengths?: string[];
  watchouts?: string[];
  fit: number;
  intent: number;
  budget: number;
  urgency: number;
  recommendedAction: string;
  nextSteps: string[];
  flags: string[];
}
