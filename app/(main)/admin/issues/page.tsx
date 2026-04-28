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

export default function AdminIssuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    fetch("/api/issues").then((r) => r.json()).then(setIssues).finally(() => setFetching(false));
  }, [user, loading, router]);

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
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">All Issues</h1>
        <p className="text-text-secondary text-sm mt-0.5">{issues.length} total</p>
      </div>

      <MapView issues={mapPins} />

      <DataTable
        data={rows}
        columns={COLUMNS}
        loading={fetching}
        emptyMessage="No issues found."
        rowHref={(row) => `/issues/${row.id}`}
      />
    </div>
  );
}
