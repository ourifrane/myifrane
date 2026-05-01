import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { UserModel, UpdateProfileInput } from "@/models/user.model";
import { signToken } from "@/lib/auth";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
  workerNotes?: string;
};

export type AuthResult = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    approved: boolean;
    avatarUrl?: string | null;
    displayName?: string | null;
  };
};

export async function register(input: RegisterInput): Promise<AuthResult> {
  const { name, email, password, role = Role.USER, workerNotes } = input;

  if (!name || !email || !password) throw new Error("All fields are required");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const existing = await UserModel.findByEmail(email);
  if (existing) throw new Error("Email already in use");

  if (role === Role.ADMIN) throw new Error("Cannot self-register as admin");

  const hashed = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    name,
    email,
    password: hashed,
    role,
    workerNotes: role === Role.WORKER ? workerNotes : undefined,
  });

  const token = await signToken({ userId: user.id, role: user.role, approved: user.approved });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      avatarUrl: user.avatarUrl,
      displayName: user.displayName,
    },
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
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      avatarUrl: user.avatarUrl,
      displayName: user.displayName,
    },
  };
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  return UserModel.updateProfile(userId, data);
}

