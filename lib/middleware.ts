import { NextRequest, NextResponse } from "next/server";
import { verifyToken, TokenPayload, COOKIE_NAME } from "@/lib/auth";
import { Role } from "@prisma/client";

// ─── Typed API handler that receives an authenticated session ────────────────
export type AuthedRequest = NextRequest & { session: TokenPayload };

type Handler = (req: NextRequest, session: TokenPayload) => Promise<NextResponse>;

// Wraps an API handler: verifies the JWT cookie, then calls the handler.
// If the token is missing or invalid → 401.
export function withAuth(handler: Handler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const token = req.cookies.get(COOKIE_NAME)?.value;
      if (!token) return unauthorized("Not authenticated");

      const session = await verifyToken(token);
      return await handler(req, session);
    } catch {
      return unauthorized("Invalid or expired session");
    }
  };
}

// Requires a specific role (or one of several roles).
// Builds on top of withAuth so the token check only happens once.
export function withRole(roles: Role[], handler: Handler) {
  return withAuth(async (req, session) => {
    if (!roles.includes(session.role)) return forbidden("Insufficient role");
    return handler(req, session);
  });
}

// Requires WORKER role AND approved === true.
export function withApprovedWorker(handler: Handler) {
  return withAuth(async (req, session) => {
    if (session.role !== Role.WORKER) return forbidden("Insufficient role");
    if (!session.approved) return forbidden("Worker account not approved yet");
    return handler(req, session);
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}
