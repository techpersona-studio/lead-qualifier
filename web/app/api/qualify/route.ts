import { NextRequest, NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { LeadFormData } from "@/types/lead";
import { createServerClient } from "@/lib/supabase/server";
import { findLeadByEmail, saveLead } from "@/lib/leads";

export const maxDuration = 60;

interface QualifyRequestBody extends LeadFormData {
  overwrite?: boolean;
  checkOnly?: boolean;
}

export async function POST(req: NextRequest) {
  const body: QualifyRequestBody = await req.json();
  const { overwrite, checkOnly, ...leadData } = body;

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const orgId = req.cookies.get("active_org_id")?.value ?? null;

  if (user && orgId) {
    const existing = await findLeadByEmail(orgId, leadData.email);
    if (existing && !overwrite) {
      return NextResponse.json(
        {
          exists: true,
          companyName: existing.companyName,
          email: existing.email,
          leadId: existing.id,
        },
        { status: 409 },
      );
    }

    if (checkOnly) {
      return NextResponse.json({ ok: true });
    }
  }

  const handle = await tasks.trigger("qualify-lead", leadData, {
    tags: ["lead-qualifier"],
  });

  const result = await runs.poll(handle.id, { pollIntervalMs: 1000 });

  if (result.status !== "COMPLETED") {
    return NextResponse.json({ error: "Qualification failed" }, { status: 500 });
  }

  if (user && orgId) {
    const existing = await findLeadByEmail(orgId, leadData.email);
    const { id } = await saveLead(
      user.id,
      orgId,
      leadData,
      result.output,
      existing?.id,
    );
    return NextResponse.json({ ...result.output, id });
  }

  return NextResponse.json(result.output);
}
