/**
 * API ROUTE — POST /api/auth/logout
 *
 * Responsibility: clear the session cookie.
 * No business logic here.
 */

import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
