/**
 * CONTROLLER — Issue
 *
 * All business rules for issues live here:
 *   - Who can create, view, assign, update, or cancel
 *   - Which status transitions are valid
 *   - What data is required
 *
 * Calls IssueModel for DB access.
 * Returns plain objects — no HTTP concerns (no NextResponse here).
 */

import { IssueStatus, Role } from "@prisma/client";
import { IssueModel, CreateIssueInput } from "@/models/issue.model";
import { TokenPayload } from "@/lib/auth";

// ─── Status transition table ──────────────────────────────────────────────────
//
// OPEN       → ASSIGNED    (approved WORKER only, via assign endpoint)
// ASSIGNED   → COMPLETED   (the assigned WORKER only)
// ASSIGNED   → OPEN        (the assigned WORKER only — cancels their assignment)
// ANY(!COMPLETED) → CANCELLED  (ADMIN only)

const WORKER_TRANSITIONS: Partial<Record<IssueStatus, IssueStatus[]>> = {
  ASSIGNED: ["COMPLETED", "OPEN"],
};

const ADMIN_TRANSITIONS: Partial<Record<IssueStatus, IssueStatus[]>> = {
  OPEN: ["CANCELLED"],
  ASSIGNED: ["CANCELLED"],
};

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createIssue(
  input: Omit<CreateIssueInput, "reportedById">,
  session: TokenPayload
) {
  const { type, description, imageUrl, latitude, longitude } = input;

  if (!type || !description || !imageUrl) throw new Error("type, description, and imageUrl are required");
  if (latitude == null || longitude == null) throw new Error("Geolocation is required");

  return IssueModel.create({ ...input, reportedById: session.userId });
}

// ─── Read ─────────────────────────────────────────────────────────────────────

// Returns issues scoped by role:
//   USER   → only their own issues
//   WORKER → all OPEN issues + issues assigned to them
//   ADMIN  → everything
export async function getIssuesForSession(session: TokenPayload) {
  if (session.role === Role.ADMIN) {
    return IssueModel.findAll();
  }
  if (session.role === Role.WORKER) {
    const [open, mine] = await Promise.all([
      IssueModel.findByStatus("OPEN"),
      IssueModel.findByWorker(session.userId),
    ]);
    // Deduplicate (worker may appear in both if they just assigned themselves)
    const seen = new Set<string>();
    return [...open, ...mine].filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
  }
  // USER
  return IssueModel.findByReporter(session.userId);
}

export async function getIssueById(id: string, session: TokenPayload) {
  const issue = await IssueModel.findById(id);
  if (!issue) throw new Error("Issue not found");

  // USERs can only see their own issues
  if (session.role === Role.USER && issue.reportedById !== session.userId) {
    throw new Error("Not authorised to view this issue");
  }

  return issue;
}

// ─── Assign ───────────────────────────────────────────────────────────────────

export async function assignIssue(issueId: string, session: TokenPayload) {
  if (!session.approved) throw new Error("Your worker account is not approved yet");

  const issue = await IssueModel.findById(issueId);
  if (!issue) throw new Error("Issue not found");
  if (issue.status !== "OPEN") throw new Error("Only OPEN issues can be assigned");

  return IssueModel.assign(issueId, session.userId);
}

// ─── Update status ────────────────────────────────────────────────────────────

export async function updateIssueStatus(
  issueId: string,
  newStatus: IssueStatus,
  session: TokenPayload
) {
  const issue = await IssueModel.findById(issueId);
  if (!issue) throw new Error("Issue not found");

  if (session.role === Role.WORKER) {
    // Workers can only update issues assigned to them
    if (issue.assignedToId !== session.userId) {
      throw new Error("You can only update issues assigned to you");
    }

    const allowed = WORKER_TRANSITIONS[issue.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition: ${issue.status} → ${newStatus}`);
    }

    // Returning to OPEN means removing the assignment
    const extra = newStatus === "OPEN" ? { assignedToId: null } : {};
    return IssueModel.updateStatus(issueId, newStatus, extra);
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
