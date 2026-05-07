import { NextRequest, NextResponse } from "next/server";
import { withAuth, withRole } from "@/lib/middleware";
import { getIssueById, updateIssueStatus } from "@/controllers/issueController";
import { toStatusCode } from "@/lib/api-error";
import { IssueStatus, Role } from "@prisma/client";

export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const id = req.nextUrl.pathname.split("/").at(-1)!;
    const issue = await getIssueById(id, session);
    return NextResponse.json(issue);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch issue";
    return NextResponse.json({ error: message }, { status: toStatusCode(err, 500) });
  }
});

export const PATCH = withRole([Role.WORKER, Role.ADMIN], async (req: NextRequest, session) => {
  try {
    const id = req.nextUrl.pathname.split("/").at(-1)!;
    const body = await req.json();
    const { status, completionImageUrl } = body;

    if (!Object.values(IssueStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updated = await updateIssueStatus(
      id,
      status as IssueStatus,
      session,
      completionImageUrl ? { completionImageUrl } : undefined
    );
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update issue";
    return NextResponse.json({ error: message }, { status: toStatusCode(err) });
  }
});
