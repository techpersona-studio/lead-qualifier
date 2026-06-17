import { NextRequest, NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { LeadFormData } from "@/types/lead";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body: LeadFormData = await req.json();

  const handle = await tasks.trigger("qualify-lead", body, {
    tags: ["lead-qualifier"],
  });

  const result = await runs.poll(handle.id, { pollIntervalMs: 1000 });

  if (result.status !== "COMPLETED") {
    return NextResponse.json({ error: "Qualification failed" }, { status: 500 });
  }

  return NextResponse.json(result.output);
}
