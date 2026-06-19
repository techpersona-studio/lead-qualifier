import { findLeadByEmail, saveLead } from "@/lib/leads";
import type { LeadFormData, QualificationResult } from "@/types/lead";

const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();

jest.mock("@/lib/supabase/admin", () => ({
  createAdminClient: jest.fn(() => ({
    from: () => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      }),
    }),
  })),
}));

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(async () => ({
    from: () => ({
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle,
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: mockSelect.mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      }),
    }),
  })),
}));

const formData: LeadFormData = {
  companyName: "Acme Corp",
  contactName: "Jane Smith",
  email: "  Jane@Acme.COM ",
  phone: "+1 555-0100",
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
        email: "jane@acme.com",
        phone: "+1 555-0100",
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

  it("updates an existing lead when an existing lead id is provided", async () => {
    mockSingle.mockResolvedValue({ data: { id: "lead-existing" }, error: null });

    const saved = await saveLead("user-1", "org-1", formData, result, "lead-existing");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        company_name: "Acme Corp",
        email: "jane@acme.com",
        score: 82,
        grade: "A",
      })
    );
    expect(mockInsert).not.toHaveBeenCalled();
    expect(saved).toEqual({ id: "lead-existing" });
  });
});

describe("findLeadByEmail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns a lead when the normalized email exists in the org", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "lead-1", company_name: "Acme", email: "jane@acme.com" },
      error: null,
    });

    const found = await findLeadByEmail("org-1", "  Jane@Acme.COM ");

    expect(found).toEqual({
      id: "lead-1",
      companyName: "Acme",
      email: "jane@acme.com",
    });
  });

  it("returns null when no lead matches", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const found = await findLeadByEmail("org-1", "new@acme.com");

    expect(found).toBeNull();
  });
});
