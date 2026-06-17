import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { LeadFormData } from "@/types/lead";

export async function POST(req: NextRequest) {
  const body: LeadFormData = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handle = await tasks.triggerAndWait<any>("qualify-lead", body, {
    tags: ["lead-qualifier"],
  });

  if (!handle.ok) {
    return NextResponse.json({ error: "Qualification failed" }, { status: 500 });
  }

  return NextResponse.json(handle.output);
}
