import { POST } from "@/app/api/qualify/route";
import { NextRequest } from "next/server";

const mockTrigger = jest.fn();
const mockPoll = jest.fn();
const mockSaveLead = jest.fn();
const mockFindLeadByEmail = jest.fn();
const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock("@trigger.dev/sdk/v3", () => ({
  tasks: { trigger: (...args: unknown[]) => mockTrigger(...args) },
  runs: { poll: (...args: unknown[]) => mockPoll(...args) },
}));

jest.mock("@/lib/leads", () => ({
  saveLead: (...args: unknown[]) => mockSaveLead(...args),
  findLeadByEmail: (...args: unknown[]) => mockFindLeadByEmail(...args),
}));

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
    from: (...args: unknown[]) => mockFrom(...args),
  })),
}));

const formData = {
  companyName: "Acme",
  contactName: "Jane",
  email: "jane@acme.com",
  industry: "SaaS",
  companySize: "11-50",
  budgetRange: "$10k-$50k",
  urgency: "high",
  useCase: "Qualify leads",
};

const qualResult = {
  score: 80,
  grade: "A",
  summary: "Good fit.",
  fit: 80,
  intent: 80,
  budget: 80,
  urgency: 80,
  recommendedAction: "Demo",
  nextSteps: [],
  flags: [],
};

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/qualify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/qualify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindLeadByEmail.mockResolvedValue(null);
  });

  it("returns qualification result with id on success", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { org_id: "org-1" },
            error: null,
          }),
        }),
      }),
    });
    mockTrigger.mockResolvedValue({ id: "run-1" });
    mockPoll.mockResolvedValue({ status: "COMPLETED", output: qualResult });
    mockSaveLead.mockResolvedValue({ id: "lead-123" });

    const req = makeRequest(formData);
    req.cookies.set("active_org_id", "org-1");

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe("lead-123");
    expect(json.score).toBe(80);
    expect(mockSaveLead).toHaveBeenCalledWith(
      "user-1",
      "org-1",
      expect.objectContaining({ companyName: "Acme" }),
      qualResult,
      undefined,
    );
  });

  it("returns 500 when the trigger run does not complete", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { org_id: "org-1" },
            error: null,
          }),
        }),
      }),
    });
    mockTrigger.mockResolvedValue({ id: "run-1" });
    mockPoll.mockResolvedValue({ status: "FAILED" });

    const res = await POST(makeRequest(formData));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBeDefined();
    expect(mockSaveLead).not.toHaveBeenCalled();
  });

  it("returns 409 when a lead with the same email already exists and overwrite is not set", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockFindLeadByEmail.mockResolvedValue({
      id: "lead-existing",
      companyName: "Acme",
      email: "jane@acme.com",
    });

    const req = makeRequest(formData);
    req.cookies.set("active_org_id", "org-1");

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.exists).toBe(true);
    expect(json.leadId).toBe("lead-existing");
    expect(mockTrigger).not.toHaveBeenCalled();
    expect(mockSaveLead).not.toHaveBeenCalled();
  });

  it("overwrites an existing lead when overwrite is true", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockFindLeadByEmail.mockResolvedValue({
      id: "lead-existing",
      companyName: "Acme",
      email: "jane@acme.com",
    });
    mockTrigger.mockResolvedValue({ id: "run-1" });
    mockPoll.mockResolvedValue({ status: "COMPLETED", output: qualResult });
    mockSaveLead.mockResolvedValue({ id: "lead-existing" });

    const req = makeRequest({ ...formData, overwrite: true });
    req.cookies.set("active_org_id", "org-1");

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe("lead-existing");
    expect(mockSaveLead).toHaveBeenCalledWith(
      "user-1",
      "org-1",
      expect.objectContaining({ email: "jane@acme.com" }),
      qualResult,
      "lead-existing",
    );
  });
});
