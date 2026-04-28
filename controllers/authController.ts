/**
 * CONTROLLER — Auth
 *
 * Business logic for registration and login.
 * Calls UserModel for DB access, calls lib/auth for token signing.
 * Returns plain objects — no HTTP concerns (no NextResponse here).
 */

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { UserModel } from "@/models/user.model";
import { signToken } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

export type AuthResult = {
  token: string;
  user: { id: string; name: string; email: string; role: Role; approved: boolean };
};

// ─── Controller functions ─────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<AuthResult> {
  const { name, email, password, role = Role.USER } = input;

  if (!name || !email || !password) throw new Error("All fields are required");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const existing = await UserModel.findByEmail(email);
  if (existing) throw new Error("Email already in use");

  // Only USER and WORKER roles are self-registerable. Admins are seeded.
  if (role === Role.ADMIN) throw new Error("Cannot self-register as admin");

  const hashed = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, password: hashed, role });

  const token = await signToken({ userId: user.id, role: user.role, approved: user.approved });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, approved: user.approved },
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (!email || !password) throw new Error("Email and password are required");

  const user = await UserModel.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = await signToken({ userId: user.id, role: user.role, approved: user.approved });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, approved: user.approved },
  };
}
