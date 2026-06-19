import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listLeadsForOrg } from "@/lib/opportunity-maps";
import { OpportunityMapForm } from "@/components/OpportunityMapForm";

export default async function OpportunityMapPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const cookieStore = await cookies();
  let orgId = cookieStore.get("active_org_id")?.value ?? null;

  if (!orgId) {
    const { data: memberships } = await admin
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1);
    orgId = memberships?.[0]?.org_id ?? null;
  }

  const leads = orgId ? await listLeadsForOrg(orgId) : [];

  return (
    <>
      <div aria-hidden="true" className="page-spotlight" />
      <main style={{ padding: "144px 40px 80px", maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            marginBottom: 12,
            color: "var(--text-primary)",
          }}
        >
          Opportunity map
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 40, lineHeight: 1.6 }}>
          Select a lead and add the discovery call. Drop transcript files or paste directly; long conversations are supported.
        </p>
        <OpportunityMapForm leads={leads} />
      </main>
    </>
  );
}
