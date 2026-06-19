import { POST } from "@/app/api/opportunity-map/route";
import { NextRequest } from "next/server";

const mockTrigger = jest.fn();
const mockPoll = jest.fn();
const mockGetLeadById = jest.fn();
const mockSaveOpportunityMap = jest.fn();
const mockGetUser = jest.fn();

jest.mock("@trigger.dev/sdk/v3", () => ({
  tasks: { trigger: (...args: unknown[]) => mockTrigger(...args) },
  runs: { poll: (...args: unknown[]) => mockPoll(...args) },
}));

jest.mock("@/lib/opportunity-maps", () => ({
  getLeadById: (...args: unknown[]) => mockGetLeadById(...args),
  saveOpportunityMap: (...args: unknown[]) => mockSaveOpportunityMap(...args),
}));

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
  })),
}));

const mapResult = {
  summary: "Strong opportunities.",
  client: { businessName: "Acme", websiteUrl: null, statedGoals: ["Cut no-shows"] },
  recommendedFirstMove: "Start with booking automation.",
  opportunities: [
    {
      title: "Booking automation",
      problem: "Manual booking",
      proposedService: "Online booking flow",
      expectedOutcome: "Save 8 hours/week",
      impact: 9,
      confidence: 8,
      ease: 7,
      iceScore: 8,
      grade: "A",
      rank: 1,
      effort: "2 weeks",
      risks: "Adoption",
      nextAction: "Scope integration",
    },
  ],
  flags: [],
};

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/opportunity-map", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/opportunity-map", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = makeRequest({ leadId: "lead-1", conversation: "Owner wants automation." });
    req.cookies.set("active_org_id", "org-1");

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it("generates and saves an opportunity map", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetLeadById.mockResolvedValue({
      id: "lead-1",
      formData: {
        companyName: "Acme",
        contactName: "Jane",
        email: "jane@acme.com",
        industry: "SaaS",
        companySize: "11-50",
        budgetRange: "$1k",
        urgency: "ASAP",
        useCase: "Automation",
      },
      qualification: {
        score: 80,
        grade: "A",
        summary: "Good fit",
        recommendedAction: "Call",
      },
    });
    mockTrigger.mockResolvedValue({ id: "run-1" });
    mockPoll.mockResolvedValue({ status: "COMPLETED", output: mapResult });
    mockSaveOpportunityMap.mockResolvedValue({ id: "map-1" });

    const req = makeRequest({ leadId: "lead-1", conversation: "Owner wants automation." });
    req.cookies.set("active_org_id", "org-1");

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe("map-1");
    expect(json.summary).toBe("Strong opportunities.");
    expect(mockTrigger).toHaveBeenCalledWith(
      "generate-opportunity-map",
      expect.objectContaining({
        conversation: "Owner wants automation.",
      }),
      { tags: ["opportunity-map"] },
    );
  });
});
