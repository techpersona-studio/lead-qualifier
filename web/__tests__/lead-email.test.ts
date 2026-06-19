import { normalizeEmail } from "@/lib/lead-email";

describe("normalizeEmail", () => {
  it("trims and lowercases an email address", () => {
    expect(normalizeEmail("  Joe@Example.COM  ")).toBe("joe@example.com");
  });
});
