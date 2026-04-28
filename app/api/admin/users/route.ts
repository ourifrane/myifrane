/**
 * API ROUTE — GET /api/admin/users
 *
 * Admin: list all users.
 * No business logic here — delegate to controller.
 */

import { NextResponse } from "next/server";
import { withRole } from "@/lib/middleware";
import { getAllUsers } from "@/controllers/userController";
import { Role } from "@prisma/client";

export const GET = withRole([Role.ADMIN], async () => {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
