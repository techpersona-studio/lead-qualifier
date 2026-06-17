import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId } = await req.json();
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const admin = createAdminClient();

  // Verify the caller is an admin of this org
  const { data: membership } = await admin
    .from("org_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .single();

  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });
  if (membership.role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const { error } = await admin.from("orgs").delete().eq("id", orgId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Clear the active_org_id cookie if it pointed at the deleted org
  const cookieStore = await cookies();
  const res = NextResponse.json({ ok: true });
  if (cookieStore.get("active_org_id")?.value === orgId) {
    res.cookies.set("active_org_id", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  }
  return res;
}
