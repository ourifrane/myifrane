"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Mail01Icon, LockPasswordIcon, ArrowRightBigIcon, Alert01Icon } from "hugeicons-react";

export default function LoginPage() {
  const { setUser, addAccount } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const data = new FormData(e.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) return setError(json.error ?? "Login failed");

    setUser(json.user);
    addAccount(json.token, json.user);
    if (json.user.role === "ADMIN") router.replace("/admin/dashboard");
    else if (json.user.role === "WORKER") router.replace("/worker/dashboard");
    else router.replace("/user/dashboard");
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">Welcome back</h1>
        <p className="text-text-secondary text-sm mt-1">Sign in to continue to MyIfrane</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
          <span className="shrink-0">⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary dark:text-neutral-200">Email</label>
          <div className="relative">
            <Mail01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-white dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 transition placeholder:text-text-tertiary ${
                fieldErrors.email ? "border-red-500 focus:ring-red-500" : "border-border dark:border-neutral-700 focus:ring-brand-500"
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <Alert01Icon size={12} /> {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary dark:text-neutral-200">Password</label>
          <div className="relative">
            <LockPasswordIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-white dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 transition placeholder:text-text-tertiary ${
                fieldErrors.password ? "border-red-500 focus:ring-red-500" : "border-border dark:border-neutral-700 focus:ring-brand-500"
              }`}
            />
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <Alert01Icon size={12} /> {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60 mt-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <ArrowRightBigIcon size={15} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        No account?{" "}
        <Link href="/register" className="text-brand-700 dark:text-brand-400 font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
