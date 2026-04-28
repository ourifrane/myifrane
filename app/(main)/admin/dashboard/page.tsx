"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Alert01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Coins01Icon,
  ArrowRightBigIcon,
  UserGroupIcon,
  Task01Icon,
} from "hugeicons-react";
import { STATUS_CONFIG, relativeTime, exactTime } from "@/app/(main)/components/DataTable";

const MapView = dynamic(() => import("@/app/(main)/components/MapView"), { ssr: false });

type IssueSummary = {
  id: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  rewardPoints: number | null;
  completionImageUrl: string | null;
  reportedBy: { name: string; displayName?: string | null };
  assignedTo: { id: string; name: string; displayName?: string | null } | null;
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [rewardId, setRewardId] = useState<string | null>(null);
  const [rewardInput, setRewardInput] = useState<Record<string, string>>({});
  const [savingReward, setSavingReward] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    fetch("/api/issues").then((r) => r.json()).then(setIssues).finally(() => setFetching(false));
  }, [user, loading, router]);

  async function saveReward(id: string) {
    const pts = parseInt(rewardInput[id] ?? "0", 10);
    if (isNaN(pts)) return;
    setSavingReward(id);
    await fetch(`/api/admin/issues/${id}/reward`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardPoints: pts }),
    });
    setSavingReward(null);
    setRewardId(null);
    setIssues((prev) => prev.map((i) => i.id === id ? { ...i, rewardPoints: pts } : i));
  }

  if (loading || fetching) return (
    <div className="flex items-center justify-center py-20 text-text-tertiary text-sm">Loading…</div>
  );

  const counts = {
    OPEN: issues.filter((i) => i.status === "OPEN").length,
    ASSIGNED: issues.filter((i) => i.status === "ASSIGNED").length,
    COMPLETED: issues.filter((i) => i.status === "COMPLETED").length,
    CANCELLED: issues.filter((i) => i.status === "CANCELLED").length,
  };

  const completed = issues.filter((i) => i.status === "COMPLETED");
  const mapPins = issues.map((i) => ({ id: i.id, lat: i.latitude, lng: i.longitude, status: i.status, type: i.type }));

  const STATS = [
    { key: "OPEN", icon: Alert01Icon },
    { key: "ASSIGNED", icon: Clock01Icon },
    { key: "COMPLETED", icon: CheckmarkCircle01Icon },
    { key: "CANCELLED", icon: Cancel01Icon },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">Overview</h1>
          <p className="text-text-secondary text-sm mt-0.5">{issues.length} total issues tracked</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2 border border-border dark:border-neutral-700 text-text-secondary text-sm font-semibold rounded-xl hover:bg-surface-overlay transition cursor-pointer select-none">
            <UserGroupIcon size={15} /> Users
          </Link>
          <Link href="/admin/issues" className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition cursor-pointer select-none">
            <Task01Icon size={15} /> All issues <ArrowRightBigIcon size={13} />
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map(({ key, icon: Icon }) => {
          const cfg = STATUS_CONFIG[key];
          return (
            <div key={key} className={`${cfg.bg} rounded-xl p-4 border ${key === "OPEN" ? "border-blue-200 dark:border-blue-800" : key === "ASSIGNED" ? "border-amber-200 dark:border-amber-800" : key === "COMPLETED" ? "border-brand-200 dark:border-brand-800" : "border-gray-200 dark:border-gray-700"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary dark:text-neutral-400">{cfg.label}</span>
                <Icon size={14} className={cfg.text} />
              </div>
              <p className={`text-3xl font-bold ${cfg.text}`}>{counts[key]}</p>
            </div>
          );
        })}
      </div>

      {/* Map */}
      <div>
        <h2 className="font-semibold text-text-primary dark:text-neutral-100 text-sm mb-3">Issues map</h2>
        <MapView issues={mapPins} height={440} />
      </div>

      {/* Completed issues + rewards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary dark:text-neutral-100 text-sm">
            Completed issues
            <span className="ml-2 text-xs text-text-tertiary font-normal">— set reward points for workers</span>
          </h2>
        </div>

        {completed.length === 0 ? (
          <div className="text-center py-10 text-text-tertiary text-sm bg-white dark:bg-neutral-900 rounded-xl border border-border dark:border-neutral-800">
            No completed issues yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border dark:border-neutral-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-raised dark:bg-neutral-800 border-b border-border dark:border-neutral-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary dark:text-neutral-400 uppercase tracking-wide">Issue</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary dark:text-neutral-400 uppercase tracking-wide">Worker</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary dark:text-neutral-400 uppercase tracking-wide">Completed</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary dark:text-neutral-400 uppercase tracking-wide">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-neutral-800">
                {completed.map((issue) => (
                  <tr key={issue.id} className="hover:bg-surface-raised dark:hover:bg-neutral-800/60 transition">
                    <td className="px-4 py-3">
                      <Link href={`/issues/${issue.id}`} className="font-medium text-text-primary dark:text-neutral-200 hover:text-brand-700 transition text-sm">
                        {issue.type}
                      </Link>
                      <p className="text-xs text-text-tertiary mt-0.5">by {issue.reportedBy.displayName || issue.reportedBy.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-neutral-400">
                      {issue.assignedTo ? (issue.assignedTo.displayName || issue.assignedTo.name) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span title={exactTime(issue.updatedAt)} className="text-xs text-text-secondary dark:text-neutral-400 cursor-default">
                        {relativeTime(issue.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {rewardId === issue.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={10000}
                            placeholder="pts"
                            value={rewardInput[issue.id] ?? (issue.rewardPoints?.toString() ?? "")}
                            onChange={(e) => setRewardInput((p) => ({ ...p, [issue.id]: e.target.value }))}
                            className="w-20 border border-border dark:border-neutral-600 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white dark:bg-neutral-800 dark:text-neutral-100"
                          />
                          <button
                            onClick={() => saveReward(issue.id)}
                            disabled={savingReward === issue.id}
                            className="px-2.5 py-1 bg-brand-700 text-white text-xs font-semibold rounded-lg hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60"
                          >
                            {savingReward === issue.id ? "…" : "Save"}
                          </button>
                          <button
                            onClick={() => setRewardId(null)}
                            className="px-2.5 py-1 border border-border text-text-secondary text-xs font-semibold rounded-lg hover:bg-surface-overlay transition cursor-pointer select-none"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setRewardId(issue.id); setRewardInput((p) => ({ ...p, [issue.id]: issue.rewardPoints?.toString() ?? "" })); }}
                          className="flex items-center gap-1.5 px-3 py-1 border border-border dark:border-neutral-700 text-text-secondary text-xs font-semibold rounded-lg hover:border-brand-400 hover:text-brand-700 transition cursor-pointer select-none"
                        >
                          <Coins01Icon size={12} />
                          {issue.rewardPoints != null ? `${issue.rewardPoints} pts` : "Set reward"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
