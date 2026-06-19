export interface ScoredOpportunity {
  title: string;
  problem: string;
  proposedService: string;
  expectedOutcome: string;
  impact: number;
  confidence: number;
  ease: number;
  effort: string;
  risks: string;
  nextAction: string;
  iceScore: number;
  grade: "A" | "B" | "C" | "D";
  rank: number;
}

export interface OpportunityMapClient {
  businessName: string;
  websiteUrl: string | null;
  statedGoals: string[];
}

export interface OpportunityMapRaw {
  summary: string;
  client: OpportunityMapClient;
  recommendedFirstMove: string;
  opportunities: Array<Omit<ScoredOpportunity, "iceScore" | "grade" | "rank">>;
  flags: string[];
}

export interface OpportunityMap {
  summary: string;
  client: OpportunityMapClient;
  recommendedFirstMove: string;
  opportunities: ScoredOpportunity[];
  flags: string[];
}

export interface OpportunityMapTaskInput {
  lead: {
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
    qualification: {
      score: number;
      grade: string;
      summary: string;
      recommendedAction: string;
    };
  };
  conversation: string;
  websiteText?: string;
}

export interface SavedOpportunityMap {
  id: string;
  leadId: string;
  conversation: string;
  result: OpportunityMap;
  topIce: number;
  topGrade: string;
  createdAt: string;
}
