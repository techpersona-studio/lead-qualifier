import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/lead-email";
import type { LeadFormData, QualificationResult } from "@/types/lead";

export interface ExistingLead {
  id: string;
  companyName: string;
  email: string;
}

export async function findLeadByEmail(
  orgId: string,
  email: string,
): Promise<ExistingLead | null> {
  // Use the service-role client for lookups. The user-scoped client can miss rows
  // when auth.uid() is unavailable in the API route, which would skip the dedup gate.
  const supabase = createAdminClient();
  const normalized = normalizeEmail(email);

  const { data, error } = await supabase
    .from("leads")
    .select("id, company_name, email")
    .eq("org_id", orgId)
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    companyName: data.company_name,
    email: data.email,
  };
}

export async function deleteLead(orgId: string, leadId: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId)
    .eq("org_id", orgId);

  if (error) throw new Error(error.message);
}

export async function saveLead(
  userId: string,
  orgId: string,
  formData: LeadFormData,
  result: QualificationResult,
  existingLeadId?: string,
): Promise<{ id: string }> {
  const supabase = await createServerClient();
  const row = {
    user_id: userId,
    org_id: orgId,
    company_name: formData.companyName,
    contact_name: formData.contactName,
    email: normalizeEmail(formData.email),
    phone: formData.phone ?? null,
    industry: formData.industry,
    company_size: formData.companySize,
    budget_range: formData.budgetRange,
    urgency: formData.urgency,
    use_case: formData.useCase,
    website_url: formData.websiteUrl ?? null,
    score: result.score,
    grade: result.grade,
    result,
    updated_at: new Date().toISOString(),
  };

  if (existingLeadId) {
    const { data, error } = await supabase
      .from("leads")
      .update(row)
      .eq("id", existingLeadId)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { id: data.id };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}
