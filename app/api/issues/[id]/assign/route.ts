/**
 * API ROUTE — POST /api/issues/[id]/assign
 *
 * Worker self-assigns an OPEN issue.
 * No business logic here — delegate to controller.
 */

import { NextRequest, NextResponse } from "next/server";
import { withApprovedWorker } from "@/lib/middleware";
import { assignIssue } from "@/controllers/issueController";

export const POST = withApprovedWorker(async (req: NextRequest, session) => {
  try {
    const id = req.nextUrl.pathname.split("/").at(-2)!;
    const issue = await assignIssue(id, session);
    return NextResponse.json(issue);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign issue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
