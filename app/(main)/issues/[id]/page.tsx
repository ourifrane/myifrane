"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import IssueMap from "@/components/IssueMap";
import Image from "next/image";
import { ArrowLeft, User, Calendar, Wrench, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

type Issue = {
  id: string;
  type: string;
  description: string;
  imageUrl: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  reportedBy: { id: string; name: string; email: string };
  assignedTo: { id: string; name: string } | null;
};

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [fetching, setFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

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

  if (loading || fetching) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-text-tertiary" /></div>;
  }
  if (!issue) return <p className="text-red-500 text-sm">Issue not found.</p>;

  const isAssignedWorker = user?.role === "WORKER" && issue.assignedTo?.id === user.id;
  const isOpenWorker = user?.role === "WORKER" && issue.status === "OPEN" && user.approved;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {/* Hero image */}
        <div className="relative h-56 w-full bg-surface-overlay">
          <Image src={issue.imageUrl} alt={issue.type} fill className="object-cover" />
          <div className="absolute top-3 right-3">
            <StatusBadge status={issue.status} />
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-text-primary">{issue.type}</h1>
            <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">{issue.description}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 bg-surface-raised rounded-lg p-3">
              <User size={14} className="text-text-tertiary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-text-tertiary tracking-wide">Reported by</p>
                <p className="text-sm font-medium text-text-primary">{issue.reportedBy.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-surface-raised rounded-lg p-3">
              <Calendar size={14} className="text-text-tertiary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-text-tertiary tracking-wide">Date</p>
                <p className="text-sm font-medium text-text-primary">
                  {new Date(issue.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            {issue.assignedTo && (
              <div className="col-span-2 flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-lg p-3">
                <Wrench size={14} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-amber-400 tracking-wide">Assigned to</p>
                  <p className="text-sm font-medium text-amber-800">{issue.assignedTo.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <IssueMap lat={issue.latitude} lng={issue.longitude} />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5 pt-1">
            {isOpenWorker && (
              <button
                onClick={assign}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition disabled:opacity-60"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />}
                Take this issue
              </button>
            )}

            {isAssignedWorker && issue.status === "ASSIGNED" && (
              <div className="flex gap-2.5">
                <button
                  onClick={() => updateStatus("COMPLETED")}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition disabled:opacity-60"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Mark completed
                </button>
                <button
                  onClick={() => updateStatus("OPEN")}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border text-text-secondary text-sm font-semibold rounded-lg hover:bg-surface-overlay transition disabled:opacity-60"
                >
                  <XCircle size={14} /> Cancel assignment
                </button>
              </div>
            )}

            {user?.role === "ADMIN" && !["COMPLETED", "CANCELLED"].includes(issue.status) && (
              <button
                onClick={() => updateStatus("CANCELLED")}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition disabled:opacity-60"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Cancel issue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
