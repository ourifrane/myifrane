"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DataTable, { STATUS_CONFIG, ColumnDef } from "@/app/(main)/components/DataTable";

const MapView = dynamic(() => import("@/app/(main)/components/MapView"), { ssr: false });

type IssueRow = {
  id: string;
  type: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  reportedBy: { name: string; email: string; avatarUrl?: string | null; displayName?: string | null };
  assignedTo: { name: string; avatarUrl?: string | null; displayName?: string | null } | null;
};

type FlatRow = {
  id: string;
  type: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  reporterName: string;
  reporterEmail: string;
  reporterAvatar: string | null;
  reporterDisplay: string | null;
  workerName: string;
};

const COLUMNS: ColumnDef<FlatRow>[] = [
  { type: "text", label: "Type", key: "type", sortable: true },
  {
    type: "user",
    label: "Reporter",
    nameKey: "reporterName",
    emailKey: "reporterEmail",
    avatarKey: "reporterAvatar",
    displayNameKey: "reporterDisplay",
  },
  {
    type: "enum",
    label: "Status",
    key: "status",
    config: STATUS_CONFIG,
    options: ["OPEN", "ASSIGNED", "COMPLETED", "CANCELLED"],
  },
  { type: "text", label: "Worker", key: "workerName", sortable: true },
  { type: "date", label: "Reported", key: "createdAt", sortable: true },
];

const STATUS_FILTERS = ["ALL", "OPEN", "ASSIGNED", "COMPLETED", "CANCELLED"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function AdminIssuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    setFetching(true);

    const url = statusFilter === "ALL" ? "/api/issues" : `/api/issues?status=${statusFilter}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setIssues(data))
      .finally(() => setFetching(false));
  }, [user, loading, router, statusFilter]);

  const rows: FlatRow[] = issues.map((i) => ({
    id: i.id,
    type: i.type,
    description: i.description,
    status: i.status,
    latitude: i.latitude,
    longitude: i.longitude,
    createdAt: i.createdAt,
    reporterName: i.reportedBy.name,
    reporterEmail: i.reportedBy.email,
    reporterAvatar: i.reportedBy.avatarUrl ?? null,
    reporterDisplay: i.reportedBy.displayName ?? null,
    workerName: i.assignedTo ? (i.assignedTo.displayName || i.assignedTo.name) : "—",
  }));

  const mapPins = issues.map((i) => ({ id: i.id, lat: i.latitude, lng: i.longitude, status: i.status, type: i.type }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">All Issues</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {statusFilter === "ALL" ? `${issues.length} total` : `${issues.length} ${statusFilter.toLowerCase()} issue${issues.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <label htmlFor="statusFilter" className="font-medium text-text-primary dark:text-neutral-200">Filter by status</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="rounded-xl border border-border dark:border-neutral-700 bg-white dark:bg-neutral-900 text-text-primary dark:text-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option === "ALL" ? "All statuses" : option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <MapView issues={mapPins} />

      <DataTable
        data={rows}
        columns={COLUMNS}
        loading={fetching}
        emptyMessage={statusFilter === "ALL" ? "No issues found." : `No ${statusFilter.toLowerCase()} issues found.`}
        rowHref={(row) => `/issues/${row.id}`}
      />
    </div>
  );
}
