import { NextRequest, NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import { createServerClient } from "@/lib/supabase/server";
import { getLeadById, saveOpportunityMap } from "@/lib/opportunity-maps";
import type { OpportunityMap } from "@/types/opportunity-map";

export const maxDuration = 90;

interface OpportunityMapRequest {
  leadId: string;
  conversation: string;
}

export async function POST(req: NextRequest) {
  const body: OpportunityMapRequest = await req.json();

  if (!body.leadId || !body.conversation?.trim()) {
    return NextResponse.json({ error: "leadId and conversation are required" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = req.cookies.get("active_org_id")?.value ?? null;

  if (!user || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await getLeadById(orgId, body.leadId);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const handle = await tasks.trigger(
    "generate-opportunity-map",
    {
      lead: {
        companyName: lead.formData.companyName,
        contactName: lead.formData.contactName,
        email: lead.formData.email,
        phone: lead.formData.phone,
        industry: lead.formData.industry,
        companySize: lead.formData.companySize,
        budgetRange: lead.formData.budgetRange,
        urgency: lead.formData.urgency,
        useCase: lead.formData.useCase,
        websiteUrl: lead.formData.websiteUrl,
        qualification: {
          score: lead.qualification.score,
          grade: lead.qualification.grade,
          summary: lead.qualification.summary,
          recommendedAction: lead.qualification.recommendedAction,
        },
      },
      conversation: body.conversation.trim(),
    },
    { tags: ["opportunity-map"] },
  );

  const result = await runs.poll(handle.id, { pollIntervalMs: 1000 });

  if (result.status !== "COMPLETED") {
    return NextResponse.json({ error: "Opportunity map generation failed" }, { status: 500 });
  }

  const map = result.output as OpportunityMap;
  const { id } = await saveOpportunityMap(
    user.id,
    orgId,
    lead.id,
    body.conversation.trim(),
    map,
  );

  return NextResponse.json({ id, ...map });
}
