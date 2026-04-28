"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import dynamic from "next/dynamic";
import MediaUpload from "@/app/(main)/components/MediaUpload";
import { STATUS_CONFIG } from "@/app/(main)/components/DataTable";
import {
  ArrowLeftBigIcon,
  UserCircleIcon,
  Calendar01Icon,
  Wrench01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Alert01Icon,
  Camera01Icon,
} from "hugeicons-react";

const MapView = dynamic(() => import("@/app/(main)/components/MapView"), { ssr: false });

type Issue = {
  id: string;
  type: string;
  description: string;
  imageUrl: string;
  completionImageUrl: string | null;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  rewardPoints: number | null;
  reportedBy: { id: string; name: string; email: string; displayName?: string | null; avatarUrl?: string | null };
  assignedTo: { id: string; name: string; displayName?: string | null } | null;
};

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [fetching, setFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [completionImageUrl, setCompletionImageUrl] = useState("");
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    fetch(`/api/issues/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.id) setIssue(data); })
      .finally(() => setFetching(false));
  }, [id, user, loading, router]);

  async function assign() {
    setActionLoading(true);
    setError("");
    const res = await fetch(`/api/issues/${id}/assign`, { method: "POST" });
    const json = await res.json();
    setActionLoading(false);
    if (!res.ok) return setError(json.error);
    setIssue(json);
  }

  async function complete() {
    if (!completionImageUrl) return setError("Please take or upload a completion photo.");
    setActionLoading(true);
    setError("");
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED", completionImageUrl }),
    });
    const json = await res.json();
    setActionLoading(false);
    if (!res.ok) return setError(json.error);
    setIssue(json);
    setShowCompletionForm(false);
  }

  async function updateStatus(status: string) {
    setActionLoading(true);
    setError("");
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    setActionLoading(false);
    if (!res.ok) return setError(json.error);
    setIssue(json);
  }

  if (loading || fetching) return (
    <div className="flex items-center justify-center py-20 text-text-tertiary text-sm">Loading…</div>
  );
  if (!issue) return <p className="text-red-500 text-sm">Issue not found.</p>;

  const isAssignedWorker = user?.role === "WORKER" && issue.assignedTo?.id === user.id;
  const isOpenWorker = user?.role === "WORKER" && issue.status === "OPEN" && user.approved;
  const cfg = STATUS_CONFIG[issue.status];
  const StatusIcon = cfg?.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition cursor-pointer select-none"
      >
        <ArrowLeftBigIcon size={14} /> Back
      </button>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-border dark:border-neutral-800 overflow-hidden">
        {/* Hero image */}
        <div className="relative h-64 w-full bg-surface-overlay dark:bg-neutral-800">
          <Image src={issue.imageUrl} alt={issue.type} fill className="object-cover" />
          {cfg && StatusIcon && (
            <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
              <StatusIcon size={11} /> {cfg.label}
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-text-primary dark:text-neutral-100">{issue.type}</h1>
            <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">{issue.description}</p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 bg-surface-raised dark:bg-neutral-800 rounded-xl p-3">
              <UserCircleIcon size={14} className="text-text-tertiary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-text-tertiary tracking-wide">Reported by</p>
                <p className="text-sm font-medium text-text-primary dark:text-neutral-100">{issue.reportedBy.displayName || issue.reportedBy.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-surface-raised dark:bg-neutral-800 rounded-xl p-3">
              <Calendar01Icon size={14} className="text-text-tertiary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-text-tertiary tracking-wide">Reported</p>
                <p className="text-sm font-medium text-text-primary dark:text-neutral-100">
                  {new Date(issue.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            {issue.assignedTo && (
              <div className="col-span-2 flex items-center gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-3">
                <Wrench01Icon size={14} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-amber-400 tracking-wide">Assigned to</p>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{issue.assignedTo.displayName || issue.assignedTo.name}</p>
                </div>
              </div>
            )}
            {issue.rewardPoints != null && (
              <div className="col-span-2 flex items-center gap-2.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl p-3">
                <CheckmarkCircle01Icon size={14} className="text-brand-600 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-brand-500 tracking-wide">Reward</p>
                  <p className="text-sm font-bold text-brand-700 dark:text-brand-400">{issue.rewardPoints} pts</p>
                </div>
              </div>
            )}
          </div>

          {/* Completion photo */}
          {issue.completionImageUrl && (
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Camera01Icon size={12} /> Completion photo
              </p>
              <div className="relative h-48 w-full rounded-xl overflow-hidden border border-border dark:border-neutral-700">
                <Image src={issue.completionImageUrl} alt="Completion" fill className="object-cover" />
              </div>
            </div>
          )}

          {/* Map */}
          <MapView single={{ lat: issue.latitude, lng: issue.longitude, status: issue.status }} zoom={16} />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
              <Alert01Icon size={14} /> {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-1">
            {isOpenWorker && (
              <button
                onClick={assign}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60"
              >
                {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wrench01Icon size={14} />}
                Take this issue
              </button>
            )}

            {isAssignedWorker && issue.status === "ASSIGNED" && (
              <>
                {!showCompletionForm ? (
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setShowCompletionForm(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition cursor-pointer select-none"
                    >
                      <CheckmarkCircle01Icon size={14} /> Mark completed
                    </button>
                    <button
                      onClick={() => updateStatus("OPEN")}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border dark:border-neutral-700 text-text-secondary text-sm font-semibold rounded-xl hover:bg-surface-overlay transition cursor-pointer select-none disabled:opacity-60"
                    >
                      <Cancel01Icon size={14} /> Unassign
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800 p-4">
                    <p className="text-sm font-semibold text-brand-800 dark:text-brand-300 flex items-center gap-2">
                      <Camera01Icon size={15} /> Upload completion photo
                    </p>
                    <MediaUpload onUploaded={setCompletionImageUrl} label="completion photo" />
                    <div className="flex gap-2.5 pt-1">
                      <button
                        onClick={complete}
                        disabled={actionLoading || !completionImageUrl}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60"
                      >
                        {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckmarkCircle01Icon size={14} />}
                        Confirm completion
                      </button>
                      <button
                        onClick={() => { setShowCompletionForm(false); setCompletionImageUrl(""); }}
                        className="px-4 py-2.5 border border-border dark:border-neutral-700 text-text-secondary text-sm font-semibold rounded-xl hover:bg-surface-overlay transition cursor-pointer select-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {user?.role === "ADMIN" && !["COMPLETED", "CANCELLED"].includes(issue.status) && (
              <button
                onClick={() => updateStatus("CANCELLED")}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer select-none disabled:opacity-60"
              >
                {actionLoading ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Cancel01Icon size={14} />}
                Cancel issue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
