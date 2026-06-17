import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LeadRow } from "@/components/LeadRow";

export default async function LeadsPage() {
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

  const leads = orgId
    ? (await admin
        .from("leads")
        .select("id, company_name, contact_name, grade, score, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
      ).data ?? []
    : [];

  return (
    <main style={{ padding: "96px 40px 60px", maxWidth: 900, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 40,
          color: "var(--text-primary)",
        }}
      >
        Lead history
      </h1>

      {leads.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          No leads yet. Submit your first lead.
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Company", "Grade", "Score", "Contact", "Date"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0 0 12px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    textAlign: h === "Date" ? "right" : "left",
                    paddingRight: h === "Date" ? 0 : 16,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} href={`/leads/${lead.id}`} />
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
