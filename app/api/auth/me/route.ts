/**
 * API ROUTE — GET /api/auth/me
 *
 * Responsibility: return the current user's session data.
 * Used by the client to rehydrate auth state on page load.
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { UserModel } from "@/models/user.model";

export const GET = withAuth(async (_req: NextRequest, session) => {
  const user = await UserModel.findById(session.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    approved: user.approved,
  });
});
