import { getNavVisibility } from "@/lib/nav";

describe("nav visibility", () => {
  it("hides nav on /login", () => {
    expect(getNavVisibility("/login", null)).toEqual({
      showNav: false,
      showSignOut: false,
    });
  });

  it("hides sign out when no session", () => {
    expect(getNavVisibility("/", null)).toEqual({
      showNav: true,
      showSignOut: false,
    });
  });

  it("shows sign out when session exists", () => {
    expect(getNavVisibility("/", { id: "user-1" })).toEqual({
      showNav: true,
      showSignOut: true,
    });
  });
});
