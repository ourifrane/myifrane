import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
  workerNotes?: string;
};

export type UpdateProfileInput = {
  displayName?: string;
  avatarUrl?: string;
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
        avatarUrl: true,
        displayName: true,
        workerNotes: true,
        createdAt: true,
      },
    });
  },

  setApproved(id: string, approved: boolean) {
    return prisma.user.update({ where: { id }, data: { approved } });
  },

  setRole(id: string, role: Role, extra?: Record<string, unknown>) {
    return prisma.user.update({ where: { id }, data: { role, ...extra } });
  },

  updateProfile(id: string, data: UpdateProfileInput) {
    return prisma.user.update({ where: { id }, data });
  },
};
