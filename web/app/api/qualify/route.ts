import { NextRequest, NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { LeadFormData } from "@/types/lead";
import { createServerClient } from "@/lib/supabase/server";
import { saveLead } from "@/lib/leads";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body: LeadFormData = await req.json();

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let orgId: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();
    orgId = data?.org_id ?? null;
  }

  const handle = await tasks.trigger("qualify-lead", body, {
    tags: ["lead-qualifier"],
  });

  const result = await runs.poll(handle.id, { pollIntervalMs: 1000 });

  if (result.status !== "COMPLETED") {
    return NextResponse.json({ error: "Qualification failed" }, { status: 500 });
  }

  if (user && orgId) {
    const { id } = await saveLead(user.id, orgId, body, result.output);
    return NextResponse.json({ ...result.output, id });
  }

  return NextResponse.json(result.output);
}
