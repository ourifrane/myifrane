/**
 * MODEL — Issue
 *
 * This file ONLY performs database queries via Prisma.
 * No business logic, no validation, no HTTP concerns.
 * Controllers call these functions; nothing else does.
 */

import { prisma } from "@/lib/prisma";
import { IssueStatus } from "@prisma/client";

export type CreateIssueInput = {
  type: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  reportedById: string;
};

// Shared include shape used by all queries so the UI always gets the same shape.
const issueInclude = {
  reportedBy: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
};

export const IssueModel = {
  create(data: CreateIssueInput) {
    return prisma.issue.create({ data, include: issueInclude });
  },

  findById(id: string) {
    return prisma.issue.findUnique({ where: { id }, include: issueInclude });
  },

  findByReporter(reportedById: string) {
    return prisma.issue.findMany({
      where: { reportedById },
      orderBy: { createdAt: "desc" },
      include: issueInclude,
    });
  },

  findByStatus(status: IssueStatus) {
    return prisma.issue.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      include: issueInclude,
    });
  },

  findByWorker(assignedToId: string) {
    return prisma.issue.findMany({
      where: { assignedToId },
      orderBy: { updatedAt: "desc" },
      include: issueInclude,
    });
  },

  findAll() {
    return prisma.issue.findMany({
      orderBy: { createdAt: "desc" },
      include: issueInclude,
    });
  },

  // Assign a worker to an issue and flip status to ASSIGNED atomically.
  assign(id: string, workerId: string) {
    return prisma.issue.update({
      where: { id },
      data: { assignedToId: workerId, status: "ASSIGNED" },
      include: issueInclude,
    });
  },

  // Generic status update (transition rules are enforced in the controller).
  updateStatus(id: string, status: IssueStatus, extra?: { assignedToId?: string | null }) {
    return prisma.issue.update({
      where: { id },
      data: { status, ...extra },
      include: issueInclude,
    });
  },
};
