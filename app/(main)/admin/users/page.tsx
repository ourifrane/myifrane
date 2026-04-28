"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Clock, ShieldCheck, Wrench, UserCircle } from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "WORKER" | "ADMIN";
  approved: boolean;
  createdAt: string;
};

const ROLE_CONFIG: Record<string, { icon: React.ElementType; cls: string; label: string }> = {
  USER:   { icon: UserCircle,  cls: "bg-gray-100 text-gray-600",    label: "Citizen" },
  WORKER: { icon: Wrench,      cls: "bg-amber-100 text-amber-700",  label: "Worker" },
  ADMIN:  { icon: ShieldCheck, cls: "bg-brand-100 text-brand-700",  label: "Admin" },
};

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }

    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  async function setApproval(id: string, approved: boolean) {
    setActionId(id);
    const res = await fetch(`/api/admin/users/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    setActionId(null);
    if (!res.ok) return;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, approved } : u)));
  }

  if (loading || fetching) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-text-tertiary" /></div>;
  }

  const pending = users.filter((u) => u.role === "WORKER" && !u.approved);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-text-primary">User Management</h1>
        <p className="text-text-secondary text-sm mt-0.5">{users.length} registered users</p>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-amber-500" />
            <h2 className="font-semibold text-amber-800 text-sm">
              {pending.length} worker{pending.length !== 1 ? "s" : ""} awaiting approval
            </h2>
          </div>
          <div className="space-y-2">
            {pending.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-white rounded-lg border border-amber-100 px-4 py-3 gap-4">
                <div>
                  <p className="font-semibold text-text-primary text-sm">{u.name}</p>
                  <p className="text-xs text-text-secondary">{u.email}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setApproval(u.id, true)}
                    disabled={actionId === u.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white text-xs font-semibold rounded-lg hover:bg-brand-800 transition disabled:opacity-60"
                  >
                    {actionId === u.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                    Approve
                  </button>
                  <button
                    onClick={() => setApproval(u.id, false)}
                    disabled={actionId === u.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-surface-raised">
          <h2 className="font-semibold text-text-primary text-sm">All users</h2>
        </div>
        <div className="divide-y divide-border">
          {users.map((u) => {
            const cfg = ROLE_CONFIG[u.role];
            const Icon = cfg.icon;
            return (
              <div key={u.id} className="flex items-center justify-between px-5 py-3.5 gap-4 hover:bg-surface-raised transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full ${cfg.cls} flex items-center justify-center shrink-0`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary text-sm truncate">{u.name}</p>
                    <p className="text-xs text-text-secondary truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                    <Icon size={10} /> {cfg.label}
                  </span>

                  {u.role === "WORKER" && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${u.approved ? "text-brand-600" : "text-red-500"}`}>
                        {u.approved ? "Approved" : "Rejected"}
                      </span>
                      <button
                        onClick={() => setApproval(u.id, !u.approved)}
                        disabled={actionId === u.id}
                        className="text-xs text-text-secondary hover:text-brand-700 underline disabled:opacity-60 transition"
                      >
                        {u.approved ? "Revoke" : "Approve"}
                      </button>
                    </div>
                  )}

                  <span className="text-xs text-text-tertiary hidden sm:block">
                    {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
