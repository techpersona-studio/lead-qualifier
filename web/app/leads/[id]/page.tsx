import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listOpportunityMapsForLead } from "@/lib/opportunity-maps";
import { QualificationResultCard } from "@/components/QualificationResult";
import { OpportunityMapReport } from "@/components/OpportunityMapForm";

const mapDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  let orgId = cookieStore.get("active_org_id")?.value ?? null;

  if (!orgId) {
    const admin = createAdminClient();
    const { data: memberships } = await admin
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1);
    orgId = memberships?.[0]?.org_id ?? null;
  }

  if (!orgId) notFound();

  const admin = createAdminClient();
  const { data: lead } = await admin
    .from("leads")
    .select("id, org_id, company_name, result")
    .eq("id", id)
    .single();

  if (!lead || lead.org_id !== orgId) notFound();

  const maps = await listOpportunityMapsForLead(orgId, lead.id);

  return (
    <>
      <div aria-hidden="true" className="page-spotlight" />
    <main style={{ padding: "144px 24px 80px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <Link
          href="/leads"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: 48,
          }}
        >
          ← Back to leads
        </Link>
        <QualificationResultCard result={lead.result} />
      </div>

      {maps.length > 0 && (
        <section style={{ maxWidth: 900, margin: "72px auto 0" }}>
          <h2
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 28,
              paddingBottom: 16,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Opportunity maps · {maps.length}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {maps.map((map) => (
              <div key={map.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {mapDateFormat.format(new Date(map.createdAt))}
                    {map.topGrade ? ` · Top ${map.topGrade}` : ""}
                    {map.topIce ? ` · ICE ${map.topIce}` : ""}
                  </span>
                  <Link
                    href={`/opportunity-map/${map.id}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Open report →
                  </Link>
                </div>
                <OpportunityMapReport map={map.result} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
    </>
  );
}
