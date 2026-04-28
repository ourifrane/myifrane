/**
 * API ROUTE — /api/issues/[id]
 *
 * GET   → get a single issue
 * PATCH → update issue status (WORKER or ADMIN)
 *
 * No business logic here — parse, delegate, respond.
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth, withRole } from "@/lib/middleware";
import { getIssueById, updateIssueStatus } from "@/controllers/issueController";
import { IssueStatus, Role } from "@prisma/client";

export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const id = req.nextUrl.pathname.split("/").at(-1)!;
    const issue = await getIssueById(id, session);
    return NextResponse.json(issue);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch issue";
    const status = message.includes("not found") ? 404 : message.includes("authorised") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
});

export const PATCH = withRole([Role.WORKER, Role.ADMIN], async (req: NextRequest, session) => {
  try {
    const id = req.nextUrl.pathname.split("/").at(-1)!;
    const { status } = await req.json();

    if (!Object.values(IssueStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updated = await updateIssueStatus(id, status as IssueStatus, session);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update issue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
