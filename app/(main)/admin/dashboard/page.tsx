"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import IssueCard, { IssueSummary } from "@/components/IssueCard";
import { Loader2, ArrowRight, Circle, Wrench, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [fetching, setFetching] = useState(true);

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

  const stats = [
    { label: "Open",      icon: Circle,       value: issues.filter((i) => i.status === "OPEN").length,      color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-100" },
    { label: "Assigned",  icon: Wrench,       value: issues.filter((i) => i.status === "ASSIGNED").length,  color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Completed", icon: CheckCircle,  value: issues.filter((i) => i.status === "COMPLETED").length, color: "text-brand-600", bg: "bg-brand-50", border: "border-brand-100" },
    { label: "Cancelled", icon: XCircle,      value: issues.filter((i) => i.status === "CANCELLED").length, color: "text-gray-400",  bg: "bg-gray-50",  border: "border-gray-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Overview</h1>
        <p className="text-text-secondary text-sm mt-0.5">{issues.length} total issues tracked</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, icon: Icon, value, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-secondary">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent issues */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary text-sm">Recent Issues</h2>
          <button
            onClick={() => router.push("/admin/issues")}
            className="flex items-center gap-1 text-xs text-brand-700 font-semibold hover:underline"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2.5">
          {issues.slice(0, 6).map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      </div>
    </div>
  );
}
