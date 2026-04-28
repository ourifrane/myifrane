import { IssueStatus, Role } from "@prisma/client";
import { IssueModel, CreateIssueInput } from "@/models/issue.model";
import { TokenPayload } from "@/lib/auth";

const WORKER_TRANSITIONS: Partial<Record<IssueStatus, IssueStatus[]>> = {
  ASSIGNED: ["COMPLETED", "OPEN"],
};

const ADMIN_TRANSITIONS: Partial<Record<IssueStatus, IssueStatus[]>> = {
  OPEN: ["CANCELLED"],
  ASSIGNED: ["CANCELLED"],
};

export async function createIssue(
  input: Omit<CreateIssueInput, "reportedById">,
  session: TokenPayload
) {
  const { type, description, imageUrl, latitude, longitude } = input;

  if (!type || !description || !imageUrl) throw new Error("type, description, and imageUrl are required");
  if (latitude == null || longitude == null) throw new Error("Geolocation is required");

  return IssueModel.create({ ...input, reportedById: session.userId });
}

export async function getIssuesForSession(session: TokenPayload) {
  if (session.role === Role.ADMIN) return IssueModel.findAll();

  if (session.role === Role.WORKER) {
    const [open, mine] = await Promise.all([
      IssueModel.findByStatus("OPEN"),
      IssueModel.findByWorker(session.userId),
    ]);
    const seen = new Set<string>();
    return [...open, ...mine].filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
  }

  return IssueModel.findByReporter(session.userId);
}

export async function getIssueById(id: string, session: TokenPayload) {
  const issue = await IssueModel.findById(id);
  if (!issue) throw new Error("Issue not found");

  if (session.role === Role.USER && issue.reportedById !== session.userId) {
    throw new Error("Not authorised to view this issue");
  }

  return issue;
}

export async function assignIssue(issueId: string, session: TokenPayload) {
  if (!session.approved) throw new Error("Your worker account is not approved yet");

  const issue = await IssueModel.findById(issueId);
  if (!issue) throw new Error("Issue not found");
  if (issue.status !== "OPEN") throw new Error("Only OPEN issues can be assigned");

  return IssueModel.assign(issueId, session.userId);
}

export async function updateIssueStatus(
  issueId: string,
  newStatus: IssueStatus,
  session: TokenPayload,
  extra?: { completionImageUrl?: string }
) {
  const issue = await IssueModel.findById(issueId);
  if (!issue) throw new Error("Issue not found");

  if (session.role === Role.WORKER) {
    if (issue.assignedToId !== session.userId) {
      throw new Error("You can only update issues assigned to you");
    }

    const allowed = WORKER_TRANSITIONS[issue.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition: ${issue.status} → ${newStatus}`);
    }

    if (newStatus === "COMPLETED" && !extra?.completionImageUrl) {
      throw new Error("A completion photo is required to mark this issue as done");
    }

    const updateExtra = newStatus === "OPEN"
      ? { assignedToId: null }
      : { completionImageUrl: extra?.completionImageUrl };

    return IssueModel.updateStatus(issueId, newStatus, updateExtra);
  }

  if (session.role === Role.ADMIN) {
    const allowed = ADMIN_TRANSITIONS[issue.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition: ${issue.status} → ${newStatus}`);
    }
    return IssueModel.updateStatus(issueId, newStatus);
  }

  throw new Error("Not authorised to update issue status");
}

export async function setIssueReward(issueId: string, rewardPoints: number, session: TokenPayload) {
  if (session.role !== Role.ADMIN) throw new Error("Only admins can set rewards");

  const issue = await IssueModel.findById(issueId);
  if (!issue) throw new Error("Issue not found");
  if (issue.status !== "COMPLETED") throw new Error("Can only reward completed issues");

  if (rewardPoints < 0 || rewardPoints > 10000) throw new Error("Points must be between 0 and 10000");

  return IssueModel.setReward(issueId, rewardPoints);
}
