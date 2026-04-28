import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { updateProfile } from "@/controllers/authController";

export const PATCH = withAuth(async (req: NextRequest, session) => {
  try {
    const { displayName, avatarUrl } = await req.json();

    const updated = await updateProfile(session.userId, {
      displayName: displayName?.trim() || undefined,
      avatarUrl: avatarUrl || undefined,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      approved: updated.approved,
      avatarUrl: updated.avatarUrl ?? null,
      displayName: updated.displayName ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
