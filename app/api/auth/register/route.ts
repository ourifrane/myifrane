import { NextRequest, NextResponse } from "next/server";
import { register } from "@/controllers/authController";
import { COOKIE_NAME } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await register(body);

    const verificationToken = crypto.randomUUID();

    await prisma.verificationToken.create({
      data: {
        email: result.user.email,
        token: verificationToken,
      },
    });

    await sendVerificationEmail(result.user.email, verificationToken);

    const res = NextResponse.json(
      { user: result.user, token: result.token },
      { status: 201 }
    );
    res.cookies.set(COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
