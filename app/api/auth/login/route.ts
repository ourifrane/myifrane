/**
 * API ROUTE — POST /api/auth/login
 *
 * Responsibility: parse credentials, call authController.login, set cookie, return response.
 * No business logic here.
 */

import { NextRequest, NextResponse } from "next/server";
import { login } from "@/controllers/authController";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const result = await login(email, password);

    const res = NextResponse.json({ user: result.user });
    res.cookies.set(COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
