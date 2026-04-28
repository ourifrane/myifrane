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

const issueInclude = {
  reportedBy: { select: { id: true, name: true, email: true, avatarUrl: true, displayName: true } },
  assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true, displayName: true } },
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

  assign(id: string, workerId: string) {
    return prisma.issue.update({
      where: { id },
      data: { assignedToId: workerId, status: "ASSIGNED" },
      include: issueInclude,
    });
  },

  updateStatus(
    id: string,
    status: IssueStatus,
    extra?: { assignedToId?: string | null; completionImageUrl?: string }
  ) {
    return prisma.issue.update({
      where: { id },
      data: { status, ...extra },
      include: issueInclude,
    });
  },

  setReward(id: string, rewardPoints: number) {
    return prisma.issue.update({
      where: { id },
      data: { rewardPoints },
      include: issueInclude,
    });
  },
};
