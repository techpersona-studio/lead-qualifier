import { createServerClient } from "@/lib/supabase/server";
import type { LeadFormData, QualificationResult } from "@/types/lead";

export async function saveLead(
  userId: string,
  orgId: string,
  formData: LeadFormData,
  result: QualificationResult
): Promise<{ id: string }> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      user_id: userId,
      org_id: orgId,
      company_name: formData.companyName,
      contact_name: formData.contactName,
      industry: formData.industry,
      company_size: formData.companySize,
      budget_range: formData.budgetRange,
      urgency: formData.urgency,
      use_case: formData.useCase,
      website_url: formData.websiteUrl ?? null,
      score: result.score,
      grade: result.grade,
      result,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}
