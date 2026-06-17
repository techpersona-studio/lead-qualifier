import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const orgId = searchParams.get("org_id");

  if (code) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

    // Invited user: add them to the org if not already a member
    if (user && orgId) {
      const admin = createAdminClient();
      const { data: existing } = await admin
        .from("org_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("org_id", orgId)
        .single();

      if (!existing) {
        await admin
          .from("org_members")
          .insert({ org_id: orgId, user_id: user.id, role: "member" });
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
