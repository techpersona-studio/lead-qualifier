import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LeadFormData, QualificationResult } from "@/types/lead";
import type { OpportunityMap, SavedOpportunityMap } from "@/types/opportunity-map";

export interface LeadRecord {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  formData: LeadFormData;
  qualification: QualificationResult;
}

export async function getLeadById(orgId: string, leadId: string): Promise<LeadRecord | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", leadId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const qualification = data.result as QualificationResult;
  const formData: LeadFormData = {
    companyName: data.company_name,
    contactName: data.contact_name,
    email: data.email ?? "",
    phone: data.phone ?? undefined,
    industry: data.industry ?? "",
    companySize: data.company_size ?? "",
    budgetRange: data.budget_range ?? "",
    urgency: data.urgency ?? "",
    useCase: data.use_case ?? "",
    websiteUrl: data.website_url ?? undefined,
  };

  return {
    id: data.id,
    companyName: data.company_name,
    contactName: data.contact_name,
    email: data.email ?? "",
    formData,
    qualification,
  };
}

export async function listLeadsForOrg(orgId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("leads")
    .select("id, company_name, contact_name, grade, score, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveOpportunityMap(
  userId: string,
  orgId: string,
  leadId: string,
  conversation: string,
  result: OpportunityMap,
): Promise<{ id: string }> {
  const supabase = await createServerClient();
  const top = result.opportunities[0];

  const { data, error } = await supabase
    .from("opportunity_maps")
    .insert({
      user_id: userId,
      org_id: orgId,
      lead_id: leadId,
      conversation,
      result,
      top_ice: top?.iceScore ?? null,
      top_grade: top?.grade ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function listOpportunityMapsForLead(
  orgId: string,
  leadId: string,
): Promise<SavedOpportunityMap[]> {
  // Use the admin client to match the lead detail page, which can't rely on
  // auth.uid() being present in the RSC request.
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("opportunity_maps")
    .select("id, lead_id, conversation, result, top_ice, top_grade, created_at")
    .eq("org_id", orgId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    leadId: row.lead_id,
    conversation: row.conversation,
    result: row.result as OpportunityMap,
    topIce: Number(row.top_ice ?? 0),
    topGrade: row.top_grade ?? "",
    createdAt: row.created_at,
  }));
}

export async function getOpportunityMapById(
  orgId: string,
  mapId: string,
): Promise<SavedOpportunityMap | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("opportunity_maps")
    .select("id, lead_id, conversation, result, top_ice, top_grade, created_at")
    .eq("org_id", orgId)
    .eq("id", mapId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    leadId: data.lead_id,
    conversation: data.conversation,
    result: data.result as OpportunityMap,
    topIce: Number(data.top_ice ?? 0),
    topGrade: data.top_grade ?? "",
    createdAt: data.created_at,
  };
}
