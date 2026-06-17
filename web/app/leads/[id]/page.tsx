import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { QualificationResultCard } from "@/components/QualificationResult";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) notFound();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, org_id, result")
    .eq("id", id)
    .single();

  if (!lead || lead.org_id !== membership.org_id) notFound();

  return (
    <main style={{ padding: "96px 24px 60px", maxWidth: 600, margin: "0 auto" }}>
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
      <QualificationResultCard result={lead.result} onReset={() => {}} />
    </main>
  );
}
