"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import MediaUpload from "@/app/(main)/components/MediaUpload";
import { UserCircleIcon, Edit01Icon, CheckmarkCircle01Icon, Alert01Icon } from "hugeicons-react";

export default function ProfilePage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    setDisplayName(user.displayName || user.name);
    setAvatarUrl(user.avatarUrl ?? null);
  }, [user, loading, router]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
      }),
    });

    const json = await res.json();
    setSaving(false);
    if (!res.ok) return setError(json.error ?? "Failed to save");

    setUser(json);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading || !user) return (
    <div className="flex items-center justify-center py-20 text-text-tertiary text-sm">Loading…</div>
  );

  const initials = (user.displayName || user.name).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">Profile</h1>
        <p className="text-text-secondary text-sm mt-0.5">Manage your display name and photo</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-border dark:border-neutral-800 p-6 space-y-6">
        {/* Avatar preview */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={72} height={72} className="w-18 h-18 rounded-2xl object-cover" />
            ) : (
              <div className="w-18 h-18 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 flex items-center justify-center text-2xl font-bold" style={{ width: 72, height: 72 }}>
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-text-primary dark:text-neutral-100 text-lg">{user.displayName || user.name}</p>
            <p className="text-text-secondary text-sm">{user.email}</p>
            <span className="inline-block text-xs font-semibold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full mt-1">
              {user.role === "ADMIN" ? "Admin" : user.role === "WORKER" ? "Worker" : "Citizen"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Display name</label>
            <div className="relative">
              <Edit01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user.name}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>
            <p className="text-xs text-text-tertiary">This is shown instead of your full name throughout the app.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Profile picture</label>
            <MediaUpload onUploaded={(url) => setAvatarUrl(url)} label="profile photo" />
            {!avatarUrl && user.avatarUrl && (
              <div className="flex items-center gap-2 mt-2">
                <Image src={user.avatarUrl} alt="Current" width={32} height={32} className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-xs text-text-secondary">Current photo</span>
                <button
                  type="button"
                  onClick={() => setAvatarUrl(user.avatarUrl ?? null)}
                  className="text-xs text-brand-700 hover:underline cursor-pointer select-none"
                >
                  Keep it
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
              <Alert01Icon size={14} /> {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl px-3 py-2.5">
              <CheckmarkCircle01Icon size={14} /> Profile updated!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserCircleIcon size={15} />}
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
