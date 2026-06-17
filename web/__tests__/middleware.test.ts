import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

const mockGetUser = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
  })),
}));

function makeRequest(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

describe("middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  it("redirects unauthenticated requests to /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await middleware(makeRequest("/"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects unauthenticated /leads to /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await middleware(makeRequest("/leads"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("passes through /login without redirecting", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await middleware(makeRequest("/login"));

    expect(res.status).not.toBe(307);
  });

  it("passes through /auth/callback without redirecting", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await middleware(makeRequest("/auth/callback"));

    expect(res.status).not.toBe(307);
  });

  it("passes through authenticated requests", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const res = await middleware(makeRequest("/"));

    expect(res.status).not.toBe(307);
  });
});
