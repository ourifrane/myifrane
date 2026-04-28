"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Loader2, HardHat, UserCircle } from "lucide-react";

const ROLES = [
  {
    value: "USER",
    icon: UserCircle,
    label: "Citizen",
    desc: "Report issues in the city",
  },
  {
    value: "WORKER",
    icon: HardHat,
    label: "Worker",
    desc: "Resolve issues (needs admin approval)",
  },
];

export default function RegisterPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("USER");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
        role,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) return setError(json.error ?? "Registration failed");

    setUser(json.user);
    if (json.user.role === "WORKER") router.replace("/worker/dashboard");
    else router.replace("/user/dashboard");
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
        <p className="text-text-secondary text-sm mt-1">Join the MyIfrane community</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <span className="shrink-0">⚠</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Full name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
            <input
              name="name"
              type="text"
              required
              placeholder="Ahmed El Mansouri"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition placeholder:text-text-tertiary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition placeholder:text-text-tertiary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition placeholder:text-text-tertiary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`flex flex-col items-start p-3.5 rounded-lg border-2 text-left transition ${
                  role === value
                    ? "border-brand-600 bg-brand-50"
                    : "border-border bg-white hover:border-border-strong"
                }`}
              >
                <Icon size={18} className={role === value ? "text-brand-700" : "text-text-secondary"} />
                <span className={`text-sm font-semibold mt-2 ${role === value ? "text-brand-800" : "text-text-primary"}`}>
                  {label}
                </span>
                <span className="text-xs text-text-secondary mt-0.5 leading-snug">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition disabled:opacity-60 mt-2"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? "Creating account…" : "Create account"}
          {!loading && <ArrowRight size={15} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-700 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
