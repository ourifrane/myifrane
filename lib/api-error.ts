/**
 * Safe error extraction for API route catch blocks.
 * Prisma / DB errors are logged server-side and replaced with a generic message.
 * Business logic errors (thrown from controllers) pass through as-is.
 */

const INTERNAL_PATTERNS = [
  "prisma",
  "database",
  "authentication failed against",
  "econnrefused",
  "connection refused",
  "p1001",
  "p1002",
  "p1003",
  "p2",
];

export function toStatusCode(err: unknown, defaultStatus = 400): number {
  if (!(err instanceof Error)) return defaultStatus;
  const msg = err.message.toLowerCase();
  if (msg.includes("not found")) return 404;
  if (
    msg.includes("not authoris") ||
    msg.includes("not approved") ||
    msg.includes("only admin")
  ) return 403;
  return defaultStatus;
}

export function apiError(err: unknown, fallback = "Something went wrong"): string {
  if (!(err instanceof Error)) return fallback;

  const lower = err.message.toLowerCase();
  const isInternal = INTERNAL_PATTERNS.some((p) => lower.includes(p));

  if (isInternal) {
    console.error("[internal]", err.message);
    return fallback;
  }

  return err.message;
}
