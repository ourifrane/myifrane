/**
 * API ROUTE — /api/issues
 *
 * GET  → list issues (scope depends on role, handled in controller)
 * POST → create a new issue (USER only)
 *
 * No business logic here — parse, delegate, respond.
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth, withRole } from "@/lib/middleware";
import { getIssuesForSession, createIssue } from "@/controllers/issueController";
import { Role } from "@prisma/client";

export const GET = withAuth(async (_req: NextRequest, session) => {
  try {
    const issues = await getIssuesForSession(session);
    return NextResponse.json(issues);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch issues";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const POST = withRole([Role.USER], async (req: NextRequest, session) => {
  try {
    const body = await req.json();
    const issue = await createIssue(body, session);
    return NextResponse.json(issue, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create issue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
