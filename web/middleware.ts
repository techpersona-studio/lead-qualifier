import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback"];
// Authenticated but pre-org — don't redirect back to /onboarding in a loop
const PRE_ORG_PATHS = ["/onboarding", "/api/org/create"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Forward request headers into the response so refreshed session tokens
  // are visible to both the response cookies AND subsequent queries in this
  // same middleware run. Without this, a token refresh writes to the response
  // but auth.uid() is still null when PostgREST evaluates the RLS policy.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          // Write refreshed tokens into the request so the DB query below
          // runs with the new JWT, then mirror them to the response.
          for (const { name, value, options } of toSet) {
            request.cookies.set(name, value, options);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of toSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) console.error("[middleware] getUser error:", userError.message);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (PRE_ORG_PATHS.some((p) => pathname.startsWith(p))) {
    return response;
  }

  // Redirect to onboarding if the user has no org yet
  const { data: membership, error: membershipError } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (membershipError && membershipError.code !== "PGRST116") {
    console.error("[middleware] org_members query error:", membershipError.message, membershipError.code);
  }

  if (!membership) {
    console.warn("[middleware] no membership for user", user.id, "on path", pathname);
    const onboardingUrl = new URL("/onboarding", request.url);
    return NextResponse.redirect(onboardingUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
