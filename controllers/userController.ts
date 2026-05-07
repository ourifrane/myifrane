/**
 * CONTROLLER — User (Admin operations)
 *
 * Business logic for admin user management.
 * Calls UserModel for DB access.
 * Returns plain objects — no HTTP concerns (no NextResponse here).
 */

import { Role } from "@prisma/client";
import { UserModel } from "@/models/user.model";

// ─── Admin: list all users ────────────────────────────────────────────────────

export async function getAllUsers() {
  return UserModel.findAll();
}

// ─── Admin: approve or reject a worker ───────────────────────────────────────

export async function setWorkerApproval(targetId: string, approved: boolean) {
  const user = await UserModel.findById(targetId);
  if (!user) throw new Error("User not found");
  if (user.role !== Role.WORKER) throw new Error("Target user is not a worker");

  return UserModel.setApproved(targetId, approved);
}

// ─── Admin: change a user's role ─────────────────────────────────────────────

export async function changeUserRole(targetId: string, role: Role) {
  if (role === Role.ADMIN) throw new Error("Cannot promote users to admin via API");

  const user = await UserModel.findById(targetId);
  if (!user) throw new Error("User not found");

  // When demoting a worker back to user, clear their approval flag
  const extra = role === Role.USER ? { approved: false } : {};
  return UserModel.setRole(targetId, role, extra);
}
