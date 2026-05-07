import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware";
import { setIssueReward } from "@/controllers/issueController";
import { toStatusCode } from "@/lib/api-error";
import { Role } from "@prisma/client";

export const PATCH = withRole([Role.ADMIN], async (req: NextRequest, session) => {
  try {
    const id = req.nextUrl.pathname.split("/").at(-2)!;
    const { rewardPoints } = await req.json();

    if (typeof rewardPoints !== "number") {
      return NextResponse.json({ error: "rewardPoints must be a number" }, { status: 400 });
    }

    const updated = await setIssueReward(id, rewardPoints, session);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to set reward";
    return NextResponse.json({ error: message }, { status: toStatusCode(err) });
  }
});
