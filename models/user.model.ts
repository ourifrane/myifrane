/**
 * MODEL — User
 *
 * This file ONLY performs database queries via Prisma.
 * No business logic, no validation, no HTTP concerns.
 * Controllers call these functions; nothing else does.
 */

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string; // already hashed before it reaches here
  role?: Role;
};

export const UserModel = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: CreateUserInput) {
    return prisma.user.create({ data });
  },

  findAll() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approved: true,
        createdAt: true,
      },
    });
  },

  // Admin: approve or reject a worker
  setApproved(id: string, approved: boolean) {
    return prisma.user.update({ where: { id }, data: { approved } });
  },

  // Admin: change a user's role
  setRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } });
  },
};
