import { saveLead } from "@/lib/leads";
import type { LeadFormData, QualificationResult } from "@/types/lead";

const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(() => ({
    from: () => ({
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle,
        }),
      }),
    }),
  })),
}));

const formData: LeadFormData = {
  companyName: "Acme Corp",
  contactName: "Jane Smith",
  industry: "SaaS",
  companySize: "11-50",
  budgetRange: "$10k-$50k",
  urgency: "high",
  useCase: "Automate lead qualification",
};

const result: QualificationResult = {
  score: 82,
  grade: "A",
  summary: "Strong fit.",
  fit: 85,
  intent: 80,
  budget: 75,
  urgency: 90,
  recommendedAction: "Schedule a demo",
  nextSteps: ["Send proposal"],
  flags: [],
};

describe("saveLead", () => {
  beforeEach(() => jest.clearAllMocks());

  it("inserts a lead row and returns the new id", async () => {
    mockSingle.mockResolvedValue({ data: { id: "lead-123" }, error: null });

    const saved = await saveLead("user-1", "org-1", formData, result);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        org_id: "org-1",
        company_name: "Acme Corp",
        score: 82,
        grade: "A",
      })
    );
    expect(saved).toEqual({ id: "lead-123" });
  });

  it("throws when the insert fails", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "db error" } });

    await expect(saveLead("user-1", "org-1", formData, result)).rejects.toThrow(
      "db error"
    );
  });
});
