"use client";

import ProgressBar from "../../(main)/components/ProgressBar";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import {
  Mail01Icon,
  LockPasswordIcon,
  UserCircleIcon,
  ArrowRightBigIcon,
  Wrench01Icon,
  Alert01Icon,
} from "hugeicons-react";

const ROLES = [
  { value: "USER", icon: UserCircleIcon, label: "Citizen", desc: "Report issues in the city" },
  { value: "WORKER", icon: Wrench01Icon, label: "Worker", desc: "Resolve issues (needs admin approval)" },
];


export default function RegisterPage() {
  const { setUser, addAccount } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("USER");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [progress, setProgress] = useState(0);

  function updateProgress(form: HTMLFormElement) {
    const data = new FormData(form);
    let completed = 0;
    if (data.get("name")) completed++;
    if (data.get("email")) completed++;
    if (data.get("password")) completed++;
    setProgress((completed / 3) * 100);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email,
        password,
        role,
        workerNotes: role === "WORKER" ? data.get("workerNotes") : undefined,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) return setError(json.error ?? "Registration failed");

    setUser(json.user);
    addAccount(json.token, json.user);
    if (json.user.role === "WORKER") router.replace("/worker/dashboard");
    else router.replace("/user/dashboard");
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">Create account</h1>
        <p className="text-text-secondary text-sm mt-1">Join the MyIfrane community</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
          <span className="shrink-0">⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary dark:text-neutral-200">Full name</label>
          <div className="relative">
            <UserCircleIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
            <input name="name" type="text" required placeholder="Ahmed El Mansouri"   
              onChange={(e) => updateProgress(e.currentTarget.form!)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-white dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 transition placeholder:text-text-tertiary ${
                fieldErrors.name ? "border-red-500 focus:ring-red-500" : "border-border dark:border-neutral-700 focus:ring-brand-500"
              }`} />
          </div>
          {fieldErrors.name && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <Alert01Icon size={12} /> {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary dark:text-neutral-200">Email</label>
          <div className="relative">
            <Mail01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
            <input name="email" type="email" required placeholder="you@example.com"
              onChange={(e) => updateProgress(e.currentTarget.form!)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-white dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 transition placeholder:text-text-tertiary ${
                fieldErrors.email ? "border-red-500 focus:ring-red-500" : "border-border dark:border-neutral-700 focus:ring-brand-500"
              }`} />
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
            <input name="password" type="password" required minLength={6} placeholder="At least 6 characters"
                onChange={(e) => updateProgress(e.currentTarget.form!)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-white dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 transition placeholder:text-text-tertiary ${
                fieldErrors.password ? "border-red-500 focus:ring-red-500" : "border-border dark:border-neutral-700 focus:ring-brand-500"
              }`} />
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <Alert01Icon size={12} /> {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary dark:text-neutral-200">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(({ value, icon: Icon, label, desc }) => (
              <button key={value} type="button" onClick={() => setRole(value)}
                className={`flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition cursor-pointer select-none ${
                  role === value ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20" : "border-border dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-border-strong"
                }`}
              >
                <Icon size={18} className={role === value ? "text-brand-700 dark:text-brand-400" : "text-text-secondary"} />
                <span className={`text-sm font-semibold mt-2 ${role === value ? "text-brand-800 dark:text-brand-300" : "text-text-primary dark:text-neutral-100"}`}>{label}</span>
                <span className="text-xs text-text-secondary mt-0.5 leading-snug">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {role === "WORKER" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary dark:text-neutral-200">
              Application notes <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              name="workerNotes"
              rows={4}
              placeholder="Tell us about yourself, your experience, portfolio, or anything else that helps us verify your application — e.g. &quot;I called this morning and spoke with Mohammed&quot;."
              className="w-full border border-border dark:border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none placeholder:text-text-tertiary bg-white dark:bg-neutral-800 dark:text-neutral-100"
            />
            <p className="text-xs text-amber-600 dark:text-amber-400">Your account will need admin approval before you can take issues.</p>
          </div>
        )}
          <ProgressBar progress={progress} />

        <button type="submit" disabled={loading}
          onClick={() => setProgress(100)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60 mt-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          {loading ? "Creating account…" : "Create account"}
          {!loading && <ArrowRightBigIcon size={15} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-700 dark:text-brand-400 font-semibold hover:underline">Sign in</Link>
      </p>
    </>
  );
}
