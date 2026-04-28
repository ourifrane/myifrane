"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import DataTable, { ROLE_CONFIG, ColumnDef } from "@/app/(main)/components/DataTable";
import { CheckmarkCircle01Icon, Cancel01Icon, Clock01Icon } from "hugeicons-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "WORKER" | "ADMIN";
  approved: boolean;
  avatarUrl: string | null;
  displayName: string | null;
  workerNotes: string | null;
  createdAt: string;
};

type FlatRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  avatarUrl: string | null;
  displayName: string | null;
  workerNotes: string | null;
  createdAt: string;
  approvedLabel: string;
};

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers).finally(() => setFetching(false));
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
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, approved } : u));
  }

  const pending = users.filter((u) => u.role === "WORKER" && !u.approved);

  const rows: FlatRow[] = users.map((u) => ({
    ...u,
    approvedLabel: u.role === "WORKER" ? (u.approved ? "Approved" : "Pending") : "—",
  }));

  const COLUMNS: ColumnDef<FlatRow>[] = [
    {
      type: "user",
      label: "Name",
      nameKey: "name",
      emailKey: "email",
      roleKey: "role",
      avatarKey: "avatarUrl",
      displayNameKey: "displayName",
    },
    {
      type: "enum",
      label: "Role",
      key: "role",
      config: ROLE_CONFIG,
      options: ["USER", "WORKER", "ADMIN"],
    },
    { type: "date", label: "Joined", key: "createdAt", sortable: true },
    {
      type: "actions",
      label: "Actions",
      render: (row) => {
        if (row.role !== "WORKER") return <span className="text-xs text-text-tertiary">—</span>;
        return (
          <div className="flex items-center gap-2">
            {row.approved ? (
              <button
                onClick={() => setApproval(row.id, false)}
                disabled={actionId === row.id}
                className="flex items-center gap-1.5 px-2.5 py-1 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition cursor-pointer select-none disabled:opacity-60"
              >
                <Cancel01Icon size={11} /> Revoke
              </button>
            ) : (
              <>
                <button
                  onClick={() => setApproval(row.id, true)}
                  disabled={actionId === row.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-700 text-white text-xs font-semibold rounded-lg hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60"
                >
                  <CheckmarkCircle01Icon size={11} /> Approve
                </button>
                {row.workerNotes && (
                  <button
                    onClick={() => setExpandedNotes(expandedNotes === row.id ? null : row.id)}
                    className="px-2.5 py-1 border border-border text-text-secondary text-xs font-semibold rounded-lg hover:bg-surface-overlay transition cursor-pointer select-none"
                  >
                    Notes
                  </button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">User Management</h1>
        <p className="text-text-secondary text-sm mt-0.5">{users.length} registered users</p>
      </div>

      {/* Pending approvals banner */}
      {pending.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock01Icon size={15} className="text-amber-500" />
            <h2 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">
              {pending.length} worker{pending.length !== 1 ? "s" : ""} awaiting approval
            </h2>
          </div>
          <div className="space-y-2">
            {pending.map((u) => (
              <div key={u.id}>
                <div className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-lg border border-amber-100 dark:border-amber-800 px-4 py-2.5 gap-4">
                  <div>
                    <p className="font-semibold text-text-primary dark:text-neutral-100 text-sm">{u.displayName || u.name}</p>
                    <p className="text-xs text-text-secondary">{u.email}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {u.workerNotes && (
                      <button
                        onClick={() => setExpandedNotes(expandedNotes === u.id ? null : u.id)}
                        className="px-2.5 py-1 border border-border text-text-secondary text-xs font-semibold rounded-lg hover:bg-surface-overlay transition cursor-pointer select-none"
                      >
                        {expandedNotes === u.id ? "Hide notes" : "View notes"}
                      </button>
                    )}
                    <button
                      onClick={() => setApproval(u.id, true)}
                      disabled={actionId === u.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white text-xs font-semibold rounded-lg hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60"
                    >
                      <CheckmarkCircle01Icon size={12} /> Approve
                    </button>
                    <button
                      onClick={() => setApproval(u.id, false)}
                      disabled={actionId === u.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition cursor-pointer select-none disabled:opacity-60"
                    >
                      <Cancel01Icon size={12} /> Reject
                    </button>
                  </div>
                </div>
                {expandedNotes === u.id && u.workerNotes && (
                  <div className="mx-4 mb-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 border-t-0 rounded-b-lg text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                    <p className="font-semibold mb-1 text-[10px] uppercase tracking-wide text-amber-600">Application notes</p>
                    {u.workerNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable
        data={rows}
        columns={COLUMNS}
        loading={fetching}
        emptyMessage="No users found."
      />

      {/* Notes expansion for table rows */}
      {expandedNotes && (() => {
        const u = users.find((u) => u.id === expandedNotes);
        if (!u?.workerNotes) return null;
        return (
          <div className="bg-white dark:bg-neutral-900 border border-border dark:border-neutral-800 rounded-xl p-5">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Application notes — {u.displayName || u.name}</p>
            <p className="text-sm text-text-primary dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">{u.workerNotes}</p>
          </div>
        );
      })()}
    </div>
  );
}
