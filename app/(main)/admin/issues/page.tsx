"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import IssueCard, { IssueSummary } from "@/components/IssueCard";
import { Loader2, SearchXIcon } from "lucide-react";

type Filter = "ALL" | "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminIssuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }

    fetch("/api/issues")
      .then((r) => r.json())
      .then(setIssues)
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  if (loading || fetching) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-text-tertiary" /></div>;
  }

  const displayed = filter === "ALL" ? issues : issues.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">All Issues</h1>
        <p className="text-text-secondary text-sm mt-0.5">{issues.length} total</p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => {
          const count = value === "ALL" ? issues.length : issues.filter((i) => i.status === value).length;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                filter === value
                  ? "bg-brand-700 text-white shadow-sm"
                  : "bg-white border border-border text-text-secondary hover:border-border-strong"
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                filter === value ? "bg-white/20 text-white" : "bg-surface-overlay text-text-tertiary"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Issues */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 text-text-tertiary flex flex-col items-center">
          <p className="text-3xl mb-2"><SearchXIcon className="size-18"/></p>
          <p className="text-sm">No {filter !== "ALL" ? filter.toLowerCase() : ""} issues found.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayed.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      )}
    </div>
  );
}
