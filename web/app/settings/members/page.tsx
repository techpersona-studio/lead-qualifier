import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { MembersClient } from "./MembersClient";

export default async function MembersPage() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const orgId = cookieStore.get("active_org_id")?.value ?? null;
  if (!orgId) redirect("/");

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .single();

  if (!membership) redirect("/");

  const { data: members } = await supabase
    .from("org_members")
    .select("id, role, user_id, created_at")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: true });

  return (
    <main style={{ padding: "96px 40px 60px", maxWidth: 700, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 8,
          color: "var(--text-primary)",
        }}
      >
        Team members
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 48 }}>
        Manage who has access to your workspace.
      </p>
      <MembersClient
        members={members ?? []}
        isAdmin={membership.role === "admin"}
        currentUserId={user.id}
      />
    </main>
  );
}
