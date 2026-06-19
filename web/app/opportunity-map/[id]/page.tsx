import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOpportunityMapById } from "@/lib/opportunity-maps";
import { OpportunityMapReportActions } from "@/components/OpportunityMapReportActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OpportunityMapDetailPage({ params }: Props) {
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

  const saved = await getOpportunityMapById(orgId, id);
  if (!saved) notFound();

  return (
    <main className="opportunity-map-page">
      <OpportunityMapReportActions map={saved.result} />
    </main>
  );
}
