/**
 * API ROUTE — PATCH /api/admin/users/[id]/approve
 *
 * Admin: approve or reject a worker.
 * Body: { approved: boolean }
 * No business logic here — delegate to controller.
 */

import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware";
import { setWorkerApproval } from "@/controllers/userController";
import { toStatusCode } from "@/lib/api-error";
import { Role } from "@prisma/client";

export const PATCH = withRole([Role.ADMIN], async (req: NextRequest) => {
  try {
    const id = req.nextUrl.pathname.split("/").at(-2)!;
    const { approved } = await req.json();

    if (typeof approved !== "boolean") {
      return NextResponse.json({ error: "approved must be a boolean" }, { status: 400 });
    }

    const user = await setWorkerApproval(id, approved);
    return NextResponse.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update approval";
    return NextResponse.json({ error: message }, { status: toStatusCode(err) });
  }
});
