"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import IssueCard, { IssueSummary } from "@/components/IssueCard";
import { Loader2, Clock } from "lucide-react";

type Tab = "open" | "mine";

export default function WorkerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<Tab>("open");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "WORKER") { router.replace("/"); return; }

    fetch("/api/issues")
      .then((r) => r.json())
      .then(setIssues)
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  if (loading || fetching) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-text-tertiary" /></div>;
  }

  if (!user?.approved) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
          <Clock size={28} className="text-amber-500" />
        </div>
        <div>
          <h2 className="font-bold text-text-primary text-lg">Awaiting approval</h2>
          <p className="text-text-secondary text-sm mt-1 max-w-xs">
            An admin needs to approve your worker account before you can take on issues.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-700 font-medium">
          Account status: <span className="font-bold">Pending</span>
        </div>
      </div>
    );
  }

  const openIssues = issues.filter((i) => i.status === "OPEN");
  const myIssues = issues.filter((i) => i.assignedTo?.name === user?.name && i.status !== "OPEN");

  const TABS: { value: Tab; label: string; count: number }[] = [
    { value: "open", label: "Open issues", count: openIssues.length },
    { value: "mine", label: "My issues", count: myIssues.length },
  ];

  const list = tab === "open" ? openIssues : myIssues;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Worker Dashboard</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          {openIssues.length} open · {myIssues.length} assigned to you
        </p>
      </div>

      {/* Stat pills */}
      <div className="flex gap-3">
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex-1 text-center">
          <p className="text-2xl font-bold text-blue-600">{openIssues.length}</p>
          <p className="text-xs text-blue-400 font-medium mt-0.5">Open</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex-1 text-center">
          <p className="text-2xl font-bold text-amber-600">{myIssues.length}</p>
          <p className="text-xs text-amber-400 font-medium mt-0.5">Assigned to me</p>
        </div>
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex-1 text-center">
          <p className="text-2xl font-bold text-brand-600">
            {issues.filter((i) => i.assignedTo?.name === user?.name && i.status === "COMPLETED").length}
          </p>
          <p className="text-xs text-brand-400 font-medium mt-0.5">Completed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === value
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              tab === value ? "bg-brand-100 text-brand-700" : "bg-surface-overlay text-text-tertiary"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="text-center py-16 text-text-tertiary">
          <p className="text-3xl mb-2">{tab === "open" ? "🎉" : "📋"}</p>
          <p className="text-sm">{tab === "open" ? "All clear — no open issues right now." : "You haven't taken any issues yet."}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      )}
    </div>
  );
}
