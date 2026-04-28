/**
 * API ROUTE — POST /api/auth/register
 *
 * Responsibility: parse request body, call authController.register, set cookie, return response.
 * No business logic here.
 */

import { NextRequest, NextResponse } from "next/server";
import { register } from "@/controllers/authController";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await register(body);

    const res = NextResponse.json({ user: result.user }, { status: 201 });
    res.cookies.set(COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
