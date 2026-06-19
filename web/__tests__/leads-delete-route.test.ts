import { DELETE } from "@/app/api/leads/[id]/route";
import { NextRequest } from "next/server";

const mockDeleteLead = jest.fn();
const mockGetUser = jest.fn();
const mockMaybeSingle = jest.fn();

jest.mock("@/lib/leads", () => ({
  deleteLead: (...args: unknown[]) => mockDeleteLead(...args),
}));

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
  })),
}));

jest.mock("@/lib/supabase/admin", () => ({
  createAdminClient: jest.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    }),
  })),
}));

function makeRequest(id: string) {
  const req = new NextRequest(`http://localhost/api/leads/${id}`, { method: "DELETE" });
  req.cookies.set("active_org_id", "org-1");
  return req;
}

describe("DELETE /api/leads/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await DELETE(makeRequest("lead-1"), { params: Promise.resolve({ id: "lead-1" }) });

    expect(res.status).toBe(401);
    expect(mockDeleteLead).not.toHaveBeenCalled();
  });

  it("returns 404 when the lead is not in the active org", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const res = await DELETE(makeRequest("lead-1"), { params: Promise.resolve({ id: "lead-1" }) });

    expect(res.status).toBe(404);
    expect(mockDeleteLead).not.toHaveBeenCalled();
  });

  it("deletes the lead when it belongs to the active org", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockMaybeSingle.mockResolvedValue({
      data: { id: "lead-1", org_id: "org-1" },
      error: null,
    });
    mockDeleteLead.mockResolvedValue(undefined);

    const res = await DELETE(makeRequest("lead-1"), { params: Promise.resolve({ id: "lead-1" }) });

    expect(res.status).toBe(204);
    expect(mockDeleteLead).toHaveBeenCalledWith("org-1", "lead-1");
  });
});
