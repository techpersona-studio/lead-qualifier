import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId } = await req.json();
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  // Verify the user is actually a member of this org
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data } = await admin
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .limit(1);

  if (!data?.[0]) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("active_org_id", orgId, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
